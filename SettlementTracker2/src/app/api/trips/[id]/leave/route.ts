// app/api/trips/[id]/leave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';
import { CloudinaryService } from '@/app/(dashboard)/dashboard/group/services/cloudinary.service';

const cloudinaryService = new CloudinaryService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: tripId } = params;
    const userEmail = session.user.email;

    // Get the trip with members
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
        createdBy: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const member = trip.members.find(m => m.email === userEmail);
    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this trip' },
        { status: 403 }
      );
    }

    const isCreator = trip.createdBy.email === userEmail;
    const remainingMembers = trip.members.filter(m => m.email !== userEmail);

    // If creator and last member, delete the trip and image
    if (isCreator && remainingMembers.length === 0) {
      // Store image URL before deletion
      const imageUrl = trip.image;

      // Delete the trip
      await prisma.trip.delete({
        where: { id: tripId },
      });

      // Delete image from Cloudinary if it exists
      let imageDeleted = false;
      if (imageUrl) {
        try {
          const result = await cloudinaryService.deleteImage(imageUrl);
          imageDeleted = result.success;
          console.log(`📸 Image deletion ${imageDeleted ? 'successful' : 'failed'}`);
        } catch (error) {
          console.error('❌ Error deleting image from Cloudinary:', error);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Trip deleted successfully',
        deleted: true,
        imageDeleted,
      });
    }

    // If creator, transfer ownership (image stays)
    if (isCreator && remainingMembers.length > 0) {
      // Get the first remaining member's user record
      const firstMember = remainingMembers[0];
      let newCreatorUser = await prisma.user.findFirst({
        where: { email: firstMember.email || undefined },
      });

      if (!newCreatorUser && firstMember.email) {
        newCreatorUser = await prisma.user.create({
          data: {
            email: firstMember.email,
            name: firstMember.name,
            provider: 'email',
          },
        });
      }

      if (newCreatorUser) {
        await prisma.trip.update({
          where: { id: tripId },
          data: { createdById: newCreatorUser.id },
        });
      }

      // Remove current user
      await prisma.tripMember.delete({
        where: { id: member.id },
      });

      return NextResponse.json({
        success: true,
        message: `Left trip. ${firstMember.name} is now the creator.`,
        transferred: true,
        newCreator: firstMember.name,
      });
    }

    // Regular member leaving (image stays)
    await prisma.tripMember.delete({
      where: { id: member.id },
    });

    // Check if any admins remain
    const remainingAfterDelete = await prisma.tripMember.findMany({
      where: { tripId },
    });
    
    const hasAdmin = remainingAfterDelete.some(m => m.isAdmin);
    if (remainingAfterDelete.length > 0 && !hasAdmin) {
      await prisma.tripMember.update({
        where: { id: remainingAfterDelete[0].id },
        data: { isAdmin: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Left trip successfully',
    });

  } catch (error) {
    console.error('Error leaving trip:', error);
    return NextResponse.json(
      { error: 'Failed to leave trip' },
      { status: 500 }
    );
  }
}