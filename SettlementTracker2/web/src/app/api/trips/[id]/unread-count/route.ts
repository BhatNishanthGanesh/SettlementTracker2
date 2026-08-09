// app/api/trips/[id]/unread-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: tripId } = await params;

    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId,
        userId: user.id,
      },
      select: {
        lastReadAt: true,
      },
    });

    const unreadCount = await prisma.message.count({
      where: {
        tripId,
        deleted: false,
        senderId: {
          not: user.id,
        },
        ...(tripMember?.lastReadAt
          ? {
              createdAt: {
                gt: tripMember.lastReadAt,
              },
            }
          : {}),
      },
    });

    return NextResponse.json({
      count: unreadCount,
    });
  } catch (error) {
    console.error(
      "Error getting unread count:",
      error
    );

    return NextResponse.json(
      { error: "Failed to get unread count" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: tripId } = await params;

    const tripMember =
      await prisma.tripMember.findFirst({
        where: {
          tripId,
          userId: user.id,
        },
      });

    if (!tripMember) {
      return NextResponse.json(
        { error: "You are not a member of this trip" },
        { status: 403 }
      );
    }

    const updated =
      await prisma.tripMember.update({
        where: {
          id: tripMember.id,
        },
        data: {
          lastReadAt: new Date(),
        },
        select: {
          lastReadAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      lastReadAt: updated.lastReadAt,
    });
  } catch (error) {
    console.error(
      "Error updating last read:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update last read" },
      { status: 500 }
    );
  }
}