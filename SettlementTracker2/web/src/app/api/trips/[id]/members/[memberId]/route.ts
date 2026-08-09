import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      memberId: string;
    };
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId, memberId } = params;

    // Find the trip and its members
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        members: {
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
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the admin
    const userMember = trip.members.find(
      (member) => member.userId === user.id
    );

    if (!userMember?.isAdmin) {
      return NextResponse.json(
        {
          error: "Only admins can remove members",
        },
        { status: 403 }
      );
    }

    // Find the member to remove
    const memberToRemove = trip.members.find(
      (member) => member.id === memberId
    );

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Get member name for the system message
    const memberName =
      memberToRemove.user?.name ||
      memberToRemove.name;

    // Remove the member
    await prisma.tripMember.delete({
      where: {
        id: memberId,
      },
    });

    // Create system message
    await prisma.message.create({
      data: {
        tripId,
        senderId: null,
        text: `${memberName} has been removed from the trip.`,
        type: "system",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error(
      "Error removing member:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to remove member",
      },
      {
        status: 500,
      }
    );
  }
}