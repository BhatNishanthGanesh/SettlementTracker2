// helpers/leaveTrip.ts

import prisma from "@/lib/db";
import { deleteImageByUrl } from "@/lib/cloudinary";

export async function leaveTrip(
  tripId: string,
  userId: string
) {
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
    include: {
      members: true,
    },
  });

  if (!trip) {
    return {
      success: false,
      error: "Trip not found",
    };
  }

  // Find current user's membership
  const member = trip.members.find(
    (member) => member.userId === userId
  );

  if (!member) {
    return {
      success: false,
      error: "You are not a member of this trip",
    };
  }

  // Members remaining after this user leaves
  const remainingMembers = trip.members.filter(
    (m) => m.id !== member.id
  );

  // =====================================================
  // LAST MEMBER -> DELETE TRIP
  // =====================================================

  if (remainingMembers.length === 0) {
    if (trip.image) {
      try {
        await deleteImageByUrl(trip.image);
      } catch (error) {
        console.error(
          "Error deleting trip image:",
          error
        );
      }
    }

    await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });

    return {
      success: true,
      deleted: true,
    };
  }

  // =====================================================
  // REMOVE CURRENT MEMBER
  // =====================================================

  await prisma.tripMember.delete({
    where: {
      id: member.id,
    },
  });

  // =====================================================
  // ADMIN LEFT
  // =====================================================

  if (member.isAdmin) {
    const joinedMembers =
      remainingMembers.filter(
        (m) => m.joined
      );

    if (joinedMembers.length > 0) {
      const nextAdmin = joinedMembers[0];

      // Ensure only one admin
      await prisma.tripMember.updateMany({
        where: {
          tripId,
          id: {
            not: nextAdmin.id,
          },
        },
        data: {
          isAdmin: false,
        },
      });

      await prisma.tripMember.update({
        where: {
          id: nextAdmin.id,
        },
        data: {
          isAdmin: true,
        },
      });
    }
  }

  // =====================================================
  // SYSTEM MESSAGE
  // =====================================================

  await prisma.message.create({
    data: {
      tripId,
      senderId: null,
      text: `${member.name} left the trip.`,
      type: "system",
    },
  });

  return {
    success: true,
    deleted: false,
  };
}