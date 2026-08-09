import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();

    const tripId = params.id;
    const body = await request.json();

    const { name, email } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Find trip
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // Check if current user is the admin
    const userMember = trip.members.find(
      (member) => member.userId === user.id
    );

    if (!userMember?.isAdmin) {
      return NextResponse.json(
        {
          error: "Only admins can add members",
        },
        { status: 403 }
      );
    }

    // Check if email already belongs to a trip member
    if (email) {
      const existingMember = trip.members.find(
        (member) =>
          member.email?.toLowerCase() ===
          email.toLowerCase()
      );

      if (existingMember) {
        return NextResponse.json(
          {
            error:
              "Member already exists in this trip",
          },
          { status: 400 }
        );
      }
    }

    // Check whether this email belongs to an existing user
    let existingUser = null;

    if (email) {
      existingUser = await prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });
    }

    // Create TripMember
    const member = await prisma.tripMember.create({
      data: {
        tripId,
        name: existingUser?.name || name.trim(),
        email: email?.toLowerCase() || null,

        // The user has not accepted the invitation yet
        joined: false,

        // Only the existing admin is admin
        isAdmin: false,

        // If the account already exists, link it
        userId: existingUser?.id ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });


    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error(
      "Error adding member:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to add member",
      },
      {
        status: 500,
      }
    );
  }
}