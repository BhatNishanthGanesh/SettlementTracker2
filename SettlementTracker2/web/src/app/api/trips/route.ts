import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

export async function GET() {
  try {
    const user = await requireUser();

    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: true,
      expenses: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);

    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const {
      name,
      destination,
      startDate,
      endDate,
      budget,
      description,
      members,
      image,
    } = body;

    if (!name || !startDate || budget === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, startDate, budget",
        },
        {
          status: 400,
        }
      );
    }

    const inviteCode = crypto.randomBytes(16).toString("hex");

    const invitedMembers = await Promise.all(
      members.map(async (member: any) => {
        const existingUser = await prisma.user.findUnique({
          where: {
            email: member.email,
          },
        });

        return {
          name: member.name,
          email: member.email,
          userId: existingUser?.id ?? null,
          joined: false,
          isAdmin: false,
        };
      })
    );

    const trip = await prisma.trip.create({
      data: {
        name,
        destination: destination || null,
        description: description || null,
        budget: Number(budget),
        image: image || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        inviteCode,

        members: {
          create: [
            {
              name: user.name,
              email: user.email,
              userId: user.id,
              joined: true,
              isAdmin: true,
            },
            ...invitedMembers,
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...trip,
      },
    });
  } catch (error) {
    console.error("Error creating trip:", error);

    return NextResponse.json(
      {
        error: "Failed to create trip",
      },
      {
        status: 500,
      }
    );
  }
}