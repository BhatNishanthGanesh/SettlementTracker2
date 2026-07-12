// app/api/trips/[id]/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';

// Edit message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, messageId } = params;
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Get the message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
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
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user owns the message
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || message.senderId !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }

    // Check if message is older than 5 minutes
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (messageAge > fiveMinutes) {
      return NextResponse.json(
        { error: 'Cannot edit messages older than 5 minutes' },
        { status: 400 }
      );
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        text: text.trim(),
        edited: true,
        editedAt: new Date(),
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
    });

    // Format response
    const formattedMessage = {
  id: updatedMessage.id,
  text: updatedMessage.text,
  sender: updatedMessage.sender?.name ?? "Unknown User",
  senderId: updatedMessage.sender?.id ?? null,
  senderImage: updatedMessage.sender?.image ?? null,
  isOwn: true,
  type: updatedMessage.type || "text",
  edited: true,
  editedAt: updatedMessage.editedAt?.toISOString(),
  timestamp: updatedMessage.createdAt.toISOString(),
  createdAt: updatedMessage.createdAt.toISOString(),
  updatedAt: updatedMessage.updatedAt.toISOString(),
};
    // Emit via Socket.io
    const io = (global as any).io;
    if (io) {
      io.to(`trip-${tripId}`).emit('edit-message', formattedMessage);
    }

    return NextResponse.json({
      success: true,
      data: formattedMessage,
    });
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 }
    );
  }
}

// Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, messageId } = params;

    // Get the message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        tripId,
        deleted: false,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user owns the message
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || message.senderId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    // Check if message is older than 5 minutes
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (messageAge > fiveMinutes) {
      return NextResponse.json(
        { error: 'Cannot delete messages older than 5 minutes' },
        { status: 400 }
      );
    }

    // Soft delete (mark as deleted)
    await prisma.message.update({
      where: { id: messageId },
      data: {
        deleted: true,
        text: 'This message was deleted',
      },
    });

    // Emit via Socket.io
    const io = (global as any).io;
    if (io) {
      io.to(`trip-${tripId}`).emit('delete-message', {
        messageId,
        tripId,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}