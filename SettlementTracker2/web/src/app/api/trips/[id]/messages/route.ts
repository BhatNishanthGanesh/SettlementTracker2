// app/api/trips/[id]/messages/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";

// Send message
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    const body = await request.json();

    const {
      text,
      type = "text",
      metadata,
      attachments,
    } = body;

    console.log("📨 Received message:", {
      text,
      type,
      attachmentsCount:
        attachments?.length || 0,
    });

    if (
      !text &&
      (!attachments ||
        attachments.length === 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Message text or attachments are required",
        },
        { status: 400 }
      );
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        { status: 404 }
      );
    }

    // Check if current user is a member
    const isMember = trip.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        {
          error:
            "You are not a member of this trip",
        },
        { status: 403 }
      );
    }

    // Prepare metadata
    let finalMetadata: any = null;

    if (metadata) {
      finalMetadata = {
        ...metadata,
      };

      if (
        attachments &&
        attachments.length > 0
      ) {
        finalMetadata.attachments =
          attachments;
      }
    } else if (
      attachments &&
      attachments.length > 0
    ) {
      finalMetadata = {
        attachments,
      };
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        tripId,
        senderId: user.id,
        text: text || "📎 Image",
        type: type || "text",
        metadata: finalMetadata
          ? JSON.stringify(finalMetadata)
          : null,
      },
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

    // Parse metadata
    let parsedMetadata = null;
    let parsedAttachments = undefined;

    if (message.metadata) {
      try {
        parsedMetadata = JSON.parse(
          message.metadata
        );

        parsedAttachments =
          parsedMetadata.attachments;
      } catch (error) {
        console.error(
          "Error parsing message metadata:",
          error
        );
      }
    }

    // Format message
    const formattedMessage = {
      id: message.id,
      text: message.text,
      sender:
        message.sender?.name ||
        "Unknown User",
      senderId:
        message.sender?.id || null,
      senderImage:
        message.sender?.image || null,
      isOwn: true,
      type: message.type || "text",
      timestamp:
        message.createdAt.toISOString(),
      createdAt:
        message.createdAt.toISOString(),
      updatedAt:
        message.updatedAt.toISOString(),
      edited: message.edited,
      editedAt:
        message.editedAt?.toISOString() ||
        null,
      deleted: message.deleted,
      metadata: parsedMetadata,
      attachments: parsedAttachments,
    };
   try {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tripId: tripId,
        message: formattedMessage,
      }),
    }
  );

  console.log(
    "📡 Broadcast response:",
    response.status
  );

  if (!response.ok) {
    console.error(
      "Failed to broadcast message:",
      await response.text()
    );
  }
} catch (error) {
  console.error(
    "Socket broadcast failed:",
    error
  );
}

    return NextResponse.json({
      success: true,
      data: formattedMessage,
    });
  } catch (error) {
    console.error(
      "Error sending message:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to send message",
      },
      { status: 500 }
    );
  }
}

// Get messages
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    // Check if trip exists and user is a member
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        { status: 404 }
      );
    }

    const isMember = trip.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        {
          error:
            "You are not a member of this trip",
        },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages =
      await prisma.message.findMany({
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
          createdAt: "asc",
        },
      });

    // Format messages
    const formattedMessages =
      messages.map((msg) => {
        let parsedMetadata = null;
        let parsedAttachments =
          undefined;

        if (msg.metadata) {
          try {
            parsedMetadata = JSON.parse(
              msg.metadata
            );

            parsedAttachments =
              parsedMetadata.attachments;
          } catch (error) {
            console.error(
              "Error parsing metadata:",
              msg.id,
              error
            );
          }
        }

        return {
          id: msg.id,
          text: msg.text,
          sender:
            msg.sender?.name ||
            "Unknown User",
          senderId:
            msg.sender?.id || null,
          senderImage:
            msg.sender?.image || null,

          // System messages have senderId = null
          isOwn:
            msg.senderId === user.id,

          type:
            msg.type || "text",

          edited:
            msg.edited || false,

          editedAt:
            msg.editedAt?.toISOString() ||
            null,

          deleted:
            msg.deleted || false,

          timestamp:
            msg.createdAt.toISOString(),

          createdAt:
            msg.createdAt.toISOString(),

          updatedAt:
            msg.updatedAt.toISOString(),

          metadata: parsedMetadata,

          attachments:
            parsedAttachments,
        };
      });

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    console.error(
      "Error fetching messages:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}