// app/api/join/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET - Fetch trip info
export async function GET(
  request: NextRequest,
  { params }: { params: { inviteCode: string } }
) {
  try {
    const inviteCode = params.inviteCode;

    const trip = await prisma.trip.findUnique({
      where: { inviteCode: inviteCode },
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
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: trip.name,
        destination: trip.destination,
        memberCount: trip._count.members,
      },
    });
  } catch (error) {
    console.error('Error fetching trip info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip information' },
      { status: 500 }
    );
  }
}

// POST - Join the trip
export async function POST(
  request: NextRequest,
  { params }: { params: { inviteCode: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const inviteCode = params.inviteCode;

    // Find trip
    const trip = await prisma.trip.findUnique({
      where: { inviteCode: inviteCode },
      include: {
        members: true,
        createdBy: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Get the logged-in user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ✅ Check if user is already a member
    const existingMember = trip.members.find(
      m => m.email === session.user?.email
    );

    if (existingMember) {
      // ✅ If member exists but has no userId, link them!
      if (!existingMember.userId) {
        await prisma.tripMember.update({
          where: { id: existingMember.id },
          data: { 
            userId: user.id,
            joined: true,
          },
        });
      } else {
        // Just update joined status
        await prisma.tripMember.update({
          where: { id: existingMember.id },
          data: { joined: true },
        });
      }

      // Get the updated member with user info
      const updatedMember = await prisma.tripMember.findUnique({
        where: { id: existingMember.id },
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
        message: 'You are already a member of this trip',
        data: {
          tripId: trip.id,
          tripName: trip.name,
          isNewMember: false,
          member: {
            id: updatedMember?.id,
            name: updatedMember?.user?.name || updatedMember?.name,
            email: updatedMember?.user?.email || updatedMember?.email,
            image: updatedMember?.user?.image || null,
            joined: updatedMember?.joined,
            isAdmin: updatedMember?.isAdmin,
            userId: updatedMember?.userId,
          },
        },
      });
    }

    const newMember = await prisma.tripMember.create({
      data: {
        tripId: trip.id,
        name: user.name || session.user.name || 'Anonymous',
        email: session.user.email,
        userId: user.id,
        joined: true,
        isAdmin: false,
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
      message: 'Successfully joined the trip!',
      data: {
        tripId: trip.id,
        tripName: trip.name,
        isNewMember: true,
        member: {
          id: newMember.id,
          name: newMember.user?.name || newMember.name,
          email: newMember.user?.email || newMember.email || '',
          image: newMember.user?.image || null,
          joined: newMember.joined,
          isAdmin: newMember.isAdmin,
          userId: newMember.userId,
        },
      },
    });
  } catch (error) {
    console.error('Error joining trip:', error);
    return NextResponse.json(
      { error: 'Failed to join trip' },
      { status: 500 }
    );
  }
}