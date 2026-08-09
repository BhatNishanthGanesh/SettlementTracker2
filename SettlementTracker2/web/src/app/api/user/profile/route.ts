// app/api/user/profile/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";
import { leaveTrip } from "@/helpers/leaveTrip";

// =====================================================
// GET
// =====================================================

export async function GET(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          deleted: true,
        },
      });

    if (
      !currentUser ||
      currentUser.deleted
    ) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: currentUser,
    });
  } catch (error) {
    console.error(
      "Error fetching user profile:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch profile",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// PUT
// =====================================================

export async function PUT(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          deleted: true,
        },
      });

    if (
      !existingUser ||
      existingUser.deleted
    ) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const { name, image } = body;

    const updatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...(name !== undefined && {
            name: name.trim(),
          }),

          ...(image !== undefined && {
            image,
          }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "Error updating profile:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update profile",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// DELETE ACCOUNT
// =====================================================

export async function DELETE(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          tripMembers: true,
        },
      });

    if (
      !currentUser ||
      currentUser.deleted
    ) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const originalEmail =
      currentUser.email;

    for (const membership of currentUser.tripMembers) {
      await leaveTrip(
        membership.tripId,
        currentUser.id
      );
    }

    // Delete OTPs
    await prisma.otp.deleteMany({
      where: {
        email: originalEmail,
      },
    });

    // Soft-delete user
    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        deleted: true,
        name: "Deleted User",
        email: `deleted_${currentUser.id}@removed.user`,
        image: null,
        password: null,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Account deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Error deleting account:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete account",
      },
      {
        status: 500,
      }
    );
  }
}