// app/api/trips/[id]/leave/route.ts

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/helpers/auth";
import { leaveTrip } from "@/helpers/leaveTrip";

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

    const result = await leaveTrip(
      tripId,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
        },
        {
          status:
            result.error === "Trip not found"
              ? 404
              : 403,
        }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      message: result.deleted
        ? "Trip deleted successfully."
        : "Left trip successfully.",
    });
  } catch (error) {
    console.error(
      "Error leaving trip:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to leave trip",
      },
      {
        status: 500,
      }
    );
  }
}