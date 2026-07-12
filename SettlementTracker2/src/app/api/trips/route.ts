import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';
import crypto from 'crypto';

// app/api/trips/route.ts (GET endpoint)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Get all trips where user is a member - INCLUDE user relation for images
    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: {
            email: session.user.email,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,  // ✅ Include image from User
              }
            }
          }
        },
        expenses: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                name: true,
                image: true,  // ✅ Also get sender image if needed
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,  // ✅ Include image for creator
          }
        },
        _count: {
          select: {
            members: true,
            expenses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ✅ Format trips with member images
    const formattedTrips = trips.map(trip => {
      // Format members with image from user relation
      const formattedMembers = trip.members.map(member => ({
        id: member.id,
        name: member.user?.name || member.name,
        email: member.user?.email || member.email || '',
        image: member.user?.image || null,  // ✅ Get image from user
        joined: member.joined,
        isAdmin: member.isAdmin,
        userId: member.userId,
      }));

      return {
        ...trip,
        members: formattedMembers,
        lastMessage: trip.messages[0]?.text || null,
        lastMessageAt: trip.messages[0]?.createdAt || trip.updatedAt,
        lastMessageSender: trip.messages[0]?.sender?.name || null,
        createdBy: {
          ...trip.createdBy,
          image: trip.createdBy?.image || null,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedTrips,
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Validate required fields
    if (!name || !startDate || budget === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startDate, budget' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex');

    const memberData = await Promise.all(
      members.map(async (member: any) => {
        let userId = null;
        if (member.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: member.email },
          });
          if (existingUser) {
            userId = existingUser.id;
          }
        }
        return {
          name: member.name || 'Anonymous',
          email: member.email || null,
          userId: userId,
          joined: member.isCreator || false,
          isAdmin: member.isCreator || false,
        };
      })
    );

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        name,
        destination: destination || null,
        description: description || null,
        budget: parseFloat(budget) || 0,
        image: image || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        inviteCode,
        createdById: user.id,
         members: {
          create: memberData, 
        },
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
              }
            }
          }
        },
        expenses: true,
      },
    });

    // Format members with image
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

    return NextResponse.json({
      success: true,
      data: {
        ...trip,
        members: formattedMembers,
        shareableLink,
      },
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}