import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, memberId } = params;

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
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
        { error: 'Only admins can remove members' },
        { status: 403 }
      );
    }

    // Find the member to remove
    const memberToRemove = trip.members.find(m => m.id === memberId);
    if (!memberToRemove) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Don't allow removing the creator or other admins
    if (memberToRemove.email === trip.createdBy.email) {
      return NextResponse.json(
        { error: 'Cannot remove the trip creator' },
        { status: 400 }
      );
    }

    if (memberToRemove.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot remove another admin' },
        { status: 400 }
      );
    }

    // Get the member's name for the system message
    const memberName = memberToRemove.user?.name || memberToRemove.name;

    // Remove member
    await prisma.tripMember.delete({
      where: { id: memberId },
    });

    // ✅ Optionally: Create a system message for removal
    const systemUser = await prisma.user.findFirst({
      where: { email: 'system@tripsplit.com' },
    });

    if (systemUser) {
      await prisma.message.create({
        data: {
          tripId,
          senderId: systemUser.id,
          text: `${memberName} has been removed from the trip.`,
          type: 'leave',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}