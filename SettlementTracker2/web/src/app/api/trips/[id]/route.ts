// app/api/trips/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { deleteImageByUrl } from "@/lib/cloudinary";
import { requireUser } from "@/helpers/auth";

// =====================================================
// GET - Fetch a single trip
// =====================================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

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
        expenses: {
          orderBy: {
            createdAt: "desc",
          },
        },
        settlements: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check membership using userId
    const isMember = trip.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const shareableLink = `${
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    }/join/${trip.inviteCode}`;

    const formattedMembers =
      trip.members.map((member) => ({
        id: member.id,
        name:
          member.user?.name ||
          member.name,
        email:
          member.user?.email ||
          member.email ||
          "",
        image:
          member.user?.image ||
          null,
        joined: member.joined,
        isAdmin: member.isAdmin,
        userId: member.userId,
      }));

    const formattedTrip = {
      ...trip,
      members: formattedMembers,
      shareableLink,
    };

    return NextResponse.json({
      success: true,
      data: formattedTrip,
    });
  } catch (error) {
    console.error(
      "Error fetching trip:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch trip",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// PUT - Update trip
// =====================================================

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    const body = await request.json();

    const {
      name,
      destination,
      startDate,
      endDate,
      budget,
      description,
      image,
    } = body;

    // Find existing trip
    const existingTrip =
      await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          members: true,
        },
      });

    if (!existingTrip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        {
          status: 404,
        }
      );
    }

    // Only the admin can edit the trip
    const userMember =
      existingTrip.members.find(
        (member) =>
          member.userId === user.id
      );

    if (!userMember?.isAdmin) {
      return NextResponse.json(
        {
          error:
            "Only admin can edit the group",
        },
        {
          status: 403,
        }
      );
    }

    // Delete old image if replaced/removed
    const currentImage =
      existingTrip.image;

    if (
      currentImage &&
      image !== undefined &&
      currentImage !== image
    ) {
      try {
        await deleteImageByUrl(
          currentImage
        );
      } catch (error) {
        console.error(
          "Error deleting old image:",
          error
        );
      }
    }

    // Prepare update data
    const updateData: {
      name?: string;
      destination?: string;
      description?: string | null;
      budget?: number;
      startDate?: Date;
      endDate?: Date;
      image?: string | null;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (destination !== undefined) {
      updateData.destination =
        destination;
    }

    if (description !== undefined) {
      updateData.description =
        description;
    }

    if (budget !== undefined) {
      updateData.budget =
        Number(budget);
    }

    if (startDate !== undefined) {
      updateData.startDate =
        startDate
          ? new Date(startDate)
          : undefined;
    }

    if (endDate !== undefined) {
      updateData.endDate =
        endDate
          ? new Date(endDate)
          : undefined;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    // Update trip
    const updatedTrip =
      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: updateData,
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
          expenses: true,
        },
      });

    const formattedMembers =
      updatedTrip.members.map(
        (member) => ({
          id: member.id,
          name:
            member.user?.name ||
            member.name,
          email:
            member.user?.email ||
            member.email ||
            "",
          image:
            member.user?.image ||
            null,
          joined: member.joined,
          isAdmin: member.isAdmin,
          userId: member.userId,
        })
      );

    return NextResponse.json({
      success: true,
      data: {
        ...updatedTrip,
        members: formattedMembers,
      },
    });
  } catch (error) {
    console.error(
      "Error updating trip:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update trip",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// DELETE - Delete trip
// =====================================================

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    const existingTrip =
      await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          members: true,
        },
      });

    if (!existingTrip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        {
          status: 404,
        }
      );
    }

    // Only the admin can delete the trip
    const userMember =
      existingTrip.members.find(
        (member) =>
          member.userId === user.id
      );

    if (!userMember?.isAdmin) {
      return NextResponse.json(
        {
          error:
            "Only admins can delete the trip",
        },
        {
          status: 403,
        }
      );
    }

    // Save image URL before deleting trip
    const imageUrl =
      existingTrip.image;

    // Delete trip.
    // Prisma cascade deletes members,
    // expenses and messages.
    await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });

    // Delete Cloudinary image
    let imageDeleted = false;

    if (imageUrl) {
      try {
        imageDeleted =
          await deleteImageByUrl(
            imageUrl
          );
      } catch (error) {
        console.error(
          "Error deleting trip image:",
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Trip deleted successfully",
      imageDeleted,
    });
  } catch (error) {
    console.error(
      "Error deleting trip:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete trip",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST - Update lastReadAt
// =====================================================

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    // Find the user's membership directly
    const member =
      await prisma.tripMember.findFirst({
        where: {
          tripId,
          userId: user.id,
        },
      });

    if (!member) {
      return NextResponse.json(
        {
          error:
            "User is not a member of this trip",
        },
        {
          status: 403,
        }
      );
    }

    // Update lastReadAt
    const updatedMember =
      await prisma.tripMember.update({
        where: {
          id: member.id,
        },
        data: {
          lastReadAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      data: {
        tripId,
        lastReadAt:
          updatedMember.lastReadAt,
      },
    });
  } catch (error) {
    console.error(
      "Error updating lastRead:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update lastRead",
      },
      {
        status: 500,
      }
    );
  }
}