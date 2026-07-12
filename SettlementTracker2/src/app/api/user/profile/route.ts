// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

// ✅ GET handler
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        deleted: true,
      },
    });

    if (!user || user.deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// ✅ PUT handler
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is not deleted
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { deleted: true },
    });

    if (!existingUser || existingUser.deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, image } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        image: image || undefined,
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
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// ✅ DELETE handler - Fixed with email
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with all their data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trips: {
          include: {
            members: true,
          }
        },
        tripMembers: true,
      }
    });

    if (!user || user.deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let transferredTrips = 0;
    let deletedTrips = 0;

    // ✅ Step 1: Handle admin transfer for trips created by this user
    const adminTrips = user.trips.filter(trip => trip.createdById === user.id);

    for (const trip of adminTrips) {
      // Find another member who is NOT the deleting user
      const otherMember = trip.members.find(m => m.userId !== user.id && m.joined);
      
      if (otherMember && otherMember.userId) {
        // Transfer trip to the other member
        await prisma.trip.update({
          where: { id: trip.id },
          data: {
            createdById: otherMember.userId,
          },
        });
        
        // Make them admin in TripMember
        await prisma.tripMember.update({
          where: { id: otherMember.id },
          data: { isAdmin: true },
        });
        
        transferredTrips++;
      } else {
        // No other members - trip will be deleted via cascade
        deletedTrips++;
      }
    }

    // ✅ Step 2: Remove user from all trip memberships using email
    await prisma.tripMember.deleteMany({
      where: { 
        email: user.email,
      },
    });

    // ✅ Step 3: Delete OTPs
    await prisma.oTP.deleteMany({
      where: { email: user.email },
    });

    // ✅ Step 4: Soft delete the user (mark as deleted)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deleted: true,
        name: "Deleted User",
        email: `deleted_${user.id}@removed.user`,
        image: null,
        password: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully.',
      details: {
        adminTripsTransferred: transferredTrips,
        adminTripsDeleted: deletedTrips,
        totalTrips: user.trips.length,
        messagesPreserved: 'Messages remain with sender as NULL (Deleted User)',
        reRegistration: 'You can re-register with the same email for a fresh start.',
      }
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}