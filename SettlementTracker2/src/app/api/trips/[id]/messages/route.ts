// app/api/trips/[id]/messages/route.ts
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
    
    // ✅ Extract all fields including attachments
    const { text, type = 'text', metadata, attachments } = body;

    console.log('📨 Received message:', { text, type, attachmentsCount: attachments?.length || 0 });

    if (!text && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: 'Message text or attachments are required' },
        { status: 400 }
      );
    }

    // Check if trip exists and user is a member
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const isMember = trip.members.some(m => m.email === session?.user?.email);
    if (!isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Prepare metadata with attachments
    let finalMetadata = null;
    
    // If metadata already exists, merge attachments into it
    if (metadata) {
      finalMetadata = { ...metadata };
      if (attachments && attachments.length > 0) {
        finalMetadata.attachments = attachments;
      }
    } else if (attachments && attachments.length > 0) {
      // If only attachments exist, create metadata with them
      finalMetadata = { attachments };
    }

    // ✅ Create message with proper data
    const messageData: any = {
      tripId,
      senderId: user.id,
      text: text || '📎 Image',
      type: type || 'text',
    };

    // Only add metadata if it's not null
    if (finalMetadata) {
      messageData.metadata = JSON.stringify(finalMetadata);
    }

    console.log('📨 Creating message with data:', {
      ...messageData,
      attachmentsCount: attachments?.length || 0,
    });

    // Create message
    const message = await prisma.message.create({
      data: messageData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    // ✅ Parse metadata and include attachments
    let parsedMetadata = null;
    let parsedAttachments = undefined;
    
    if (message.metadata) {
      try {
        parsedMetadata = JSON.parse(message.metadata);
        parsedAttachments = parsedMetadata.attachments;
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }

    // Emit via Socket.io if available
    const formattedMessage = {
      id: message.id,
      text: message.text,
      sender: message.sender?.name || 'Unknown',
      senderId: message.sender?.id || null,
      senderImage: message.sender?.image || null,
      isOwn: false,
      type: message.type || 'text',
      timestamp: message.createdAt.toISOString(),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      edited: false,
      deleted: false,
      metadata: parsedMetadata,
      attachments: parsedAttachments,
    };

    const io = (global as any).io;
    if (io) {
      io.to(`trip-${tripId}`).emit('new-message', formattedMessage);
    }

    console.log('✅ Message created:', formattedMessage);

    return NextResponse.json({
      success: true,
      data: formattedMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

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

    const messages = await prisma.message.findMany({
      where: { 
        tripId,
        deleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format messages with senderId and senderImage
    const formattedMessages = messages.map(msg => {
      let parsedMetadata = null;
      let parsedAttachments = undefined;
      
      if (msg.metadata) {
        try {
          parsedMetadata = JSON.parse(msg.metadata);
          parsedAttachments = parsedMetadata.attachments;
        } catch (e) {
          console.error('Error parsing metadata for message:', msg.id, e);
        }
      }

      return {
        id: msg.id,
        text: msg.text,
        sender: msg.sender?.name || 'Unknown',
        senderId: msg.sender?.id || null,
        senderImage: msg.sender?.image || null,
        isOwn: msg.sender?.email === session?.user?.email,
        type: msg.type || 'text',
        edited: msg.edited || false,
        editedAt: msg.editedAt?.toISOString() || null,
        deleted: msg.deleted || false,
        timestamp: msg.createdAt.toISOString(),
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString(),
        metadata: parsedMetadata,
        attachments: parsedAttachments,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}