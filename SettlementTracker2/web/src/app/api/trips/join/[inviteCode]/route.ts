import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";


export async function GET(
  request: NextRequest,
  { params }: { params: { inviteCode: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: {
        inviteCode: params.inviteCode,
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
        { error: "Invalid invitation link" },
        { status: 404 }
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
    console.error("Error fetching trip:", error);

    return NextResponse.json(
      { error: "Failed to fetch trip information" },
      { status: 500 }
    );
  }
}

// POST - Join trip
export async function POST(
  { params }: { params: { inviteCode: string } }
) {
  try {
    const user = await requireUser();

    const trip = await prisma.trip.findUnique({
      where: {
        inviteCode: params.inviteCode,
      },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Invalid invitation link" },
        { status: 404 }
      );
    }

    let member = trip.members.find(
      member => member.userId === user.id
    );

    if (!member) {
      member = trip.members.find(
        member => member.email === user.email
      );
    }

    if (member) {
      if (!member.userId) {
        await prisma.tripMember.update({
          where: {
            id: member.id,
          },
          data: {
            userId: user.id,
            joined: true,
          },
        });
      } else if (!member.joined) {
        await prisma.tripMember.update({
          where: {
            id: member.id,
          },
          data: {
            joined: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Already a member of this trip.",
        data: {
          tripId: trip.id,
          tripName: trip.name,
        },
      });
    }

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
      message: "Successfully joined the trip.",
      data: {
        tripId: trip.id,
        tripName: trip.name,
      },
    });
  } catch (error) {
    console.error("Error joining trip:", error);

    return NextResponse.json(
      { error: "Failed to join trip" },
      { status: 500 }
    );
  }
}