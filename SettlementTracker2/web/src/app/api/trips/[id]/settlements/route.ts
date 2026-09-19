import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";
import { calculateTripStats } from "@/utils/tripStats";
import { Trip } from "@/types/trip.types";

const SETTLEMENT_STATUSES = {
  pending: "pending",
  completed: "completed",
} as const;

type SettlementAction = "request" | "pay";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function memberName(member: { name: string }) {
  return member.name || "A group member";
}

async function broadcastMessage(tripId: string, message: Record<string, unknown>) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!socketUrl) {
    return;
  }

  try {
    const response = await fetch(`${socketUrl}/broadcast/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId, message: { ...message, tripId } }),
    });

    if (!response.ok) {
      console.error("Failed to broadcast settlement message:", await response.text());
    }
  } catch (error) {
    console.error("Settlement socket broadcast failed:", error);
  }
}

async function getTripForSettlement(tripId: string) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: true,
      expenses: true,
      settlements: {
        where: { status: SETTLEMENT_STATUSES.completed },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

function getAuthoritativeAmount(
  trip: Awaited<ReturnType<typeof getTripForSettlement>>,
  payerId: string,
  recipientId: string
) {
  if (!trip) {
    return 0;
  }

  const payer = trip.members.find((member) => member.id === payerId);
  const recipient = trip.members.find((member) => member.id === recipientId);

  if (!payer || !recipient || payer.userId === null || payer.userId === undefined) {
    return 0;
  }

  const stats = calculateTripStats(
    trip as unknown as Trip,
    payer.userId
  );
  const payerBalance = stats.memberBalances.find(
    (balance) => balance.memberId === payerId
  )?.balance ?? 0;
  const recipientBalance = stats.memberBalances.find(
    (balance) => balance.memberId === recipientId
  )?.balance ?? 0;

  if (payerBalance >= 0 || recipientBalance <= 0) {
    return 0;
  }

  const completedAmount = trip.settlements
    .filter(
      (settlement) =>
        settlement.payerId === payerId &&
        settlement.recipientId === recipientId
    )
    .reduce((total, settlement) => total + settlement.amount, 0);

  return Math.max(
    0,
    Math.min(Math.abs(payerBalance), recipientBalance) - completedAmount
  );
}

function serializeSettlement(settlement: {
  id: string;
  tripId: string;
  payerId: string;
  recipientId: string;
  amount: number;
  status: string;
  referenceId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...settlement,
    createdAt: settlement.createdAt.toISOString(),
    updatedAt: settlement.updatedAt.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: tripId } = await params;
    const trip = await getTripForSettlement(tripId);

    if (!trip) {
      return errorResponse("Trip not found", 404);
    }

    const isMember = trip.members.some((member) => member.userId === user.id);
    if (!isMember) {
      return errorResponse("You are not a member of this trip", 403);
    }

    const settlements = await prisma.settlement.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: settlements.map(serializeSettlement),
    });
  } catch (error) {
    console.error("Error fetching settlements:", error);
    return errorResponse("Failed to fetch settlements", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: tripId } = await params;
    const body = await request.json();
    const action = body.action as SettlementAction;
    const trip = await getTripForSettlement(tripId);

    if (!trip) {
      return errorResponse("Trip not found", 404);
    }

    const currentMember = trip.members.find((member) => member.userId === user.id);
    if (!currentMember) {
      return errorResponse("You are not a member of this trip", 403);
    }

    if (action !== "request" && action !== "pay") {
      return errorResponse("Invalid settlement action", 400);
    }

    const targetMemberId = body.recipientMemberId || body.payerMemberId;
    const targetMember = trip.members.find((member) => member.id === targetMemberId);
    if (!targetMember || targetMember.id === currentMember.id) {
      return errorResponse("The selected member is not part of this trip", 400);
    }

    const payerId = action === "pay" ? currentMember.id : targetMember.id;
    const recipientId = action === "pay" ? targetMember.id : currentMember.id;
    const amount = getAuthoritativeAmount(trip, payerId, recipientId);

    if (amount <= 0) {
      return errorResponse("There is no outstanding balance for this settlement", 409);
    }

    if (action === "request") {
      const existingRequest = await prisma.settlement.findFirst({
        where: {
          tripId,
          payerId,
          recipientId,
          status: SETTLEMENT_STATUSES.pending,
        },
      });

      if (existingRequest) {
        return NextResponse.json({
          success: true,
          data: serializeSettlement(existingRequest),
          duplicate: true,
        });
      }

      const referenceId = `request-${crypto.randomUUID()}`;
      const settlement = await prisma.settlement.create({
        data: {
          tripId,
          payerId,
          recipientId,
          amount,
          status: SETTLEMENT_STATUSES.pending,
          referenceId,
        },
      });

      const message = await prisma.message.create({
        data: {
          tripId,
          senderId: user.id,
          text: `🔔 ${memberName(currentMember)} requested ${amount} from ${memberName(targetMember)}.`,
          type: "settlement_request",
          settlementReferenceId: referenceId,
          metadata: JSON.stringify({
            settlementId: settlement.id,
            referenceId,
            payerId,
            recipientId,
            amount,
            status: SETTLEMENT_STATUSES.pending,
          }),
        },
      });

      await broadcastMessage(tripId, {
        id: message.id,
        text: message.text,
        sender: memberName(currentMember),
        senderId: user.id,
        senderImage: user.image,
        type: message.type,
        metadata: {
          settlementId: settlement.id,
          referenceId,
          payerId,
          recipientId,
          amount,
          status: SETTLEMENT_STATUSES.pending,
        },
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        edited: false,
        deleted: false,
      });

      return NextResponse.json({
        success: true,
        data: serializeSettlement(settlement),
      }, { status: 201 });
    }

    const requestedSettlementId = typeof body.settlementId === "string"
      ? body.settlementId
      : undefined;
    const referenceId = typeof body.referenceId === "string" && body.referenceId.trim()
      ? body.referenceId.trim()
      : `payment-${crypto.randomUUID()}`;

    const existingByReference = await prisma.settlement.findUnique({
      where: { referenceId },
    });

    if (existingByReference?.status === SETTLEMENT_STATUSES.completed) {
      return NextResponse.json({
        success: true,
        data: serializeSettlement(existingByReference),
        duplicate: true,
      });
    }

    const pendingSettlement = requestedSettlementId
      ? await prisma.settlement.findFirst({
          where: {
            id: requestedSettlementId,
            tripId,
            payerId,
            recipientId,
            status: SETTLEMENT_STATUSES.pending,
          },
        })
      : await prisma.settlement.findFirst({
          where: {
            tripId,
            payerId,
            recipientId,
            status: SETTLEMENT_STATUSES.pending,
          },
          orderBy: { createdAt: "asc" },
        });

    const settlement = pendingSettlement
      ? await prisma.settlement.update({
          where: { id: pendingSettlement.id },
          data: {
            amount,
            status: SETTLEMENT_STATUSES.completed,
            referenceId,
          },
        })
      : await prisma.settlement.create({
          data: {
            tripId,
            payerId,
            recipientId,
            amount,
            status: SETTLEMENT_STATUSES.completed,
            referenceId,
          },
        });

    const paymentMetadata = {
      settlementId: settlement.id,
      referenceId,
      payerId,
      recipientId,
      amount,
      status: SETTLEMENT_STATUSES.completed,
    };

    let message = await prisma.message.findFirst({
      where: { settlementReferenceId: referenceId },
    });

    if (!message) {
      message = await prisma.message.create({
        data: {
          tripId,
          senderId: user.id,
          text: `💸 ${memberName(currentMember)} paid ${memberName(targetMember)} ${amount}.`,
          type: "payment",
          settlementReferenceId: referenceId,
          metadata: JSON.stringify(paymentMetadata),
        },
      });

      await broadcastMessage(tripId, {
        id: message.id,
        tripId,
        text: message.text,
        sender: memberName(currentMember),
        senderId: user.id,
        senderImage: user.image,
        type: message.type,
        metadata: paymentMetadata,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        edited: false,
        deleted: false,
      });
    }

    const updatedSettlement = await prisma.settlement.update({
      where: { id: settlement.id },
      data: { paymentMessageId: message.id },
    });

    return NextResponse.json({
      success: true,
      data: serializeSettlement(updatedSettlement),
    });
  } catch (error) {
    console.error("Error processing settlement:", error);
    return errorResponse("Failed to process settlement", 500);
  }
}
