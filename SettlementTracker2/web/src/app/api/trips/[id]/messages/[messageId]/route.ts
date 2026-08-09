// app/api/trips/[id]/messages/[messageId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

const FIVE_MINUTES = 5 * 60 * 1000;

// Edit message
export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      messageId: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId, messageId } = await params;

    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Message text is required" },
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
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Only sender can edit
    if (message.senderId !== user.id) {
      return NextResponse.json(
        {
          error: "You can only edit your own messages",
        },
        { status: 403 }
      );
    }

    // Check 5-minute edit window
    const messageAge =
      Date.now() - new Date(message.createdAt).getTime();

    if (messageAge < 0 || messageAge > FIVE_MINUTES) {
      return NextResponse.json(
        {
          error: "Cannot edit messages older than 5 minutes",
        },
        { status: 400 }
      );
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
      },
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

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast/edit-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tripId,
            message: {
              id: updatedMessage.id,
              text: updatedMessage.text,
              sender:
                updatedMessage.sender?.name ||
                "Unknown User",
              senderId:
                updatedMessage.sender?.id || null,
              senderImage:
                updatedMessage.sender?.image || null,
              type:
                updatedMessage.type || "text",
              edited:
                updatedMessage.edited,
              editedAt:
                updatedMessage.editedAt?.toISOString() ||
                null,
              deleted:
                updatedMessage.deleted,
              timestamp:
                updatedMessage.createdAt.toISOString(),
              createdAt:
                updatedMessage.createdAt.toISOString(),
              updatedAt:
                updatedMessage.updatedAt.toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to broadcast edit:",
          await response.text()
        );
      }
    } catch (error) {
      console.error(
        "Socket edit broadcast failed:",
        error
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error editing message:", error);

    return NextResponse.json(
      { error: "Failed to edit message" },
      { status: 500 }
    );
  }
}

// Delete message
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      messageId: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId, messageId } = await params;

    // Get the message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        tripId,
        deleted: false,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Only sender can delete
    if (message.senderId !== user.id) {
      return NextResponse.json(
        {
          error: "You can only delete your own messages",
        },
        { status: 403 }
      );
    }

    // Check 5-minute delete window
    const messageAge =
      Date.now() - new Date(message.createdAt).getTime();

    if (messageAge < 0 || messageAge > FIVE_MINUTES) {
      return NextResponse.json(
        {
          error: "Cannot delete messages older than 5 minutes",
        },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        deleted: true,
        text: "This message was deleted",
      },
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast/delete-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tripId,
            messageId,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to broadcast delete:",
          await response.text()
        );
      }
    } catch (error) {
      console.error(
        "Socket delete broadcast failed:",
        error
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);

    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
