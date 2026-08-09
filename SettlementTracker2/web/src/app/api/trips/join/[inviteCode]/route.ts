// app/api/trips/join/[inviteCode]/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

// =====================================================
// GET - Get trip information from invite code
// =====================================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      inviteCode: string;
    }>;
  }
) {
  try {
    const { inviteCode } = await params;

    const trip = await prisma.trip.findUnique({
      where: {
        inviteCode,
      },
      select: {
        id: true,
        name: true,
        destination: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Invalid invitation link",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        memberCount: trip._count.members,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching trip:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch trip information",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST - Join trip
// =====================================================

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      inviteCode: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { inviteCode } = await params;

    const trip = await prisma.trip.findUnique({
      where: {
        inviteCode,
      },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Invalid invitation link",
        },
        {
          status: 404,
        }
      );
    }

    // =================================================
    // Find existing TripMember
    // =================================================

    let member = trip.members.find(
      (member) =>
        member.userId === user.id
    );

    // If not found by userId, try email.
    // This handles invited users whose account
    // existed after the TripMember was created.
    if (!member) {
      member = trip.members.find(
        (member) =>
          member.email === user.email
      );
    }

    // =================================================
    // Existing member
    // =================================================

    if (member) {
      // IMPORTANT:
      //
      // If the TripMember previously had
      // userId = null, connect it to the
      // actual logged-in User.
      //
      // This is important for expenses because:
      //
      // Expense.paidBy -> TripMember.id
      //
      // TripMember.userId -> User.id
      //

      await prisma.tripMember.update({
        where: {
          id: member.id,
        },
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          joined: true,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Successfully joined the trip.",
        data: {
          tripId: trip.id,
          tripName: trip.name,
          memberId: member.id,
        },
      });
    }

    // =================================================
    // New member
    // =================================================

    const newMember =
      await prisma.tripMember.create({
        data: {
          tripId: trip.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          joined: true,
          isAdmin: false,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Successfully joined the trip.",
      data: {
        tripId: trip.id,
        tripName: trip.name,
        memberId: newMember.id,
      },
    });
  } catch (error) {
    console.error(
      "Error joining trip:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to join trip",
      },
      {
        status: 500,
      }
    );
  }
}