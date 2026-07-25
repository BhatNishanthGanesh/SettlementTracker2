import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';
import { CloudinaryService } from '@/app/(dashboard)/dashboard/group/services/cloudinary.service';

const cloudinaryService = new CloudinaryService();

// GET - Fetch a single trip with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;

    // Fetch trip with all relations
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
              },
            },
          },
        },
        expenses: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is a member of the trip
    const isMember = trip.members.some(m => m.email === session?.user?.email);
    if (!isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formattedMembers = trip.members.map(member => ({
      id: member.id,
      name: member.user?.name || member.name,
      email: member.user?.email || member.email || '',
      image: member.user?.image || null, 
      joined: member.joined,
      isAdmin: member.isAdmin,
      userId: member.userId,
    }));

    // Generate shareable link
    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${trip.inviteCode}`;

    // Calculate member balances
    const membersWithBalance = formattedMembers.map(member => {
      const memberExpenses = trip.expenses.filter(e => e.paidBy === member.id);
      const paid = memberExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Calculate what they owe (split equally among all members)
      const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
      const memberCount = trip.members.length;
      const owes = memberCount > 0 ? (totalExpenses / memberCount) - paid : 0;

      return {
        ...member,
        paid,
        owes: Math.max(0, owes),
      };
    });
    const formattedTrip = {
      ...trip,
      members: membersWithBalance,
      shareableLink,
      createdBy: {
        ...trip.createdBy,
        image: trip.createdBy.image || null,
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedTrip,
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT - Update a trip
export async function PUT(
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
    const { name, destination, startDate, endDate, budget, description, image } = body;

    console.log('📝 Update request body:', body);
    console.log('📸 Image value received:', image);

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
        createdBy: true,
      },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is admin or creator
    const userMember = existingTrip.members.find(m => m.email === session?.user?.email);
    const isAdmin = userMember?.isAdmin || false;
    const isCreator = existingTrip.createdBy.email === session.user.email;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only admins can edit the group' },
        { status: 403 }
      );
    }

    // Handle image update - delete old image if it's being replaced
    const currentImage = existingTrip.image;
    const newImage = image;

    // If image is being changed (including removed/null), delete old image from Cloudinary
    if (currentImage && currentImage !== newImage) {
      try {
        const result = await cloudinaryService.deleteImage(currentImage);
        console.log(`📸 Old image ${result.success ? 'deleted' : 'failed to delete'}`);
      } catch (error) {
        console.error('❌ Error deleting old image from Cloudinary:', error);
        // Continue with update even if image deletion fails
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (destination !== undefined) updateData.destination = destination;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = parseFloat(budget);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : undefined;
    
    // Handle image - allow setting to null or string
    if (image !== undefined) {
      updateData.image = image; // This can be null or a string URL
    }

    console.log('🔄 Update data being sent to Prisma:', updateData);

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
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


    console.log('✅ Updated trip:', updatedTrip);
    console.log('📸 Image in updated trip:', updatedTrip.image);
    const formattedMembers = updatedTrip.members.map(member => ({
      id: member.id,
      name: member.user?.name || member.name,
      email: member.user?.email || member.email || '',
      image: member.user?.image || null,
      joined: member.joined,
      isAdmin: member.isAdmin,
      userId: member.userId,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...updatedTrip,
        members: formattedMembers,
      },
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;

    // Check if trip exists and user is the creator
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        createdBy: true,
        members: true,
      },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is creator or admin
    const userMember = existingTrip.members.find(m => m.email === session?.user?.email);
    const isAdmin = userMember?.isAdmin || false;
    const isCreator = existingTrip.createdBy.email === session.user.email;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only admins can delete the trip' },
        { status: 403 }
      );
    }

    // Store image URL before deletion
    const imageUrl = existingTrip.image;

    // Delete trip and all related data (cascade delete)
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
      imageDeleted,
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}