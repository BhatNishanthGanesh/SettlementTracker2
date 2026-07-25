import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;
    const body = await request.json();
    const { name, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
        createdBy: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is admin or creator
    const userMember = trip.members.find(m => m.email === session?.user?.email);
    const isAdmin = userMember?.isAdmin || false;
    const isCreator = trip.createdBy.email === session.user.email;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only admins can add members' },
        { status: 403 }
      );
    }

    // Check if member already exists
    if (email) {
      const existingMember = trip.members.find(m => m.email === email);
      if (existingMember) {
        return NextResponse.json(
          { error: 'Member already exists in this trip' },
          { status: 400 }
        );
      }
    }

    // ✅ Find existing user by email
    let existingUser = null;
    if (email) {
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
    }

    // ✅ Create member with userId if user exists
    const memberData: any = {
      tripId,
      name,
      email: email || null,
      joined: false,
      isAdmin: false,
    };

    if (existingUser) {
      memberData.userId = existingUser.id;
      // Use the user's name if available
      if (existingUser.name) {
        memberData.name = existingUser.name;
      }
    }

    // Add member
    const member = await prisma.tripMember.create({
      data: memberData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,  // ✅ Include image
          }
        }
      }
    });

    // ✅ Format member with image
    const formattedMember = {
      id: member.id,
      name: member.user?.name || member.name,
      email: member.user?.email || member.email || '',
      image: member.user?.image || null,  // ✅ Get image from user
      joined: member.joined,
      isAdmin: member.isAdmin,
      userId: member.userId,
    };

    return NextResponse.json({
      success: true,
      data: formattedMember,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}