"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";

import { socketService } from "@/services/socket.service";
import { tripService } from "@/services/trip.service";
import { Trip } from "@/types/trip.types";

interface GroupContextType {
  groups: Trip[];
  loading: boolean;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  fetchGroups: () => Promise<void>;
  incrementUnread: (groupId: string) => void;
  markAsRead: (groupId: string) => Promise<void>;
  removeGroup: (groupId: string) => void;
}

const GroupContext =
  createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [groups, setGroups] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] =
    useState<Record<string, number>>({});
  const [lastReadMap, setLastReadMap] =
    useState<Record<string, Date>>({});

  const fetchGroups = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const { data } =
        await tripService.getUserTrips();

      const trips: Trip[] = data.data ?? [];

      const tripsWithLastMessage = trips.map((trip) => ({
        ...trip,
        lastMessageAt: trip.messages?.[0]?.createdAt ?? trip.createdAt,
      }));

      setGroups(tripsWithLastMessage);

      if (!trips.length) {
        setUnreadCounts({});
        setLastReadMap({});
        return;
      }

      const tripIds = trips.map(trip => trip.id);

      const lastReads =
        await tripService.getLastReadTimestamps(
          tripIds
        );

      setLastReadMap(lastReads);

      const counts: Record<string, number> = {};

      trips.forEach(trip => {
        const lastRead = lastReads[trip.id];

        const unreadCount =
          trip.messages?.filter(message => {
            if (
              message.deleted ||
              message.senderId === userId
            ) {
              return false;
            }

            if (!lastRead) return true;
            if (!message.createdAt) return false;

            return (
              new Date(message.createdAt).getTime() >
              new Date(lastRead).getTime()
            );
          }).length ?? 0;

        if (unreadCount > 0) {
          counts[trip.id] = unreadCount;
        }
      });

      setUnreadCounts(counts);
    } catch (error) {
      console.error(
        "Failed to fetch groups:",
        error
      );
      setUnreadCounts({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchGroups();
    }
  }, [userId, fetchGroups]);

  const markAsRead = useCallback(async (groupId: string) => {
  try {
    await tripService.updateLastRead(groupId);

    setLastReadMap(prev => ({
      ...prev,
      [groupId]: new Date(),
    }));

    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[groupId];
      return updated;
    });
  } catch (error) {
    console.error(
      "Failed to mark as read:",
      error
    );
  }
}, []);

  const incrementUnread = (groupId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [groupId]:
        (prev[groupId] ?? 0) + 1,
    }));
  };

  const removeGroup = (groupId: string) => {
    setGroups(prev =>
      prev.filter(group => group.id !== groupId)
    );

    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[groupId];
      return updated;
    });

    setLastReadMap(prev => {
      const updated = { ...prev };
      delete updated[groupId];
      return updated;
    });
  };

  useEffect(() => {
    if (!userId) return;

    const handleNewMessage = (message: any) => {

  if (!message?.tripId) {
    return;
  }

  setGroups((prev) => {

    const index = prev.findIndex(
      (group) => group.id === message.tripId
    );

    if (index === -1) {
      return prev;
    }

    const updatedGroup = {
      ...prev[index],
      lastMessageAt:
        message.createdAt || new Date().toISOString(),
    };

    const newGroups = [
      updatedGroup,
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ];

    return newGroups;
  });

  if (message.senderId !== userId) {
    incrementUnread(message.tripId);
  }
};
    const handleMessageUpdate = () => {
      fetchGroups();
    };

    socketService.on(
      "message",
      handleNewMessage
    );

    socketService.on(
      "new-message",
      handleNewMessage
    );

    socketService.on(
      "edit-message",
      handleMessageUpdate
    );

    socketService.on(
      "delete-message",
      handleMessageUpdate
    );

    return () => {
      socketService.off(
        "message",
        handleNewMessage
      );

      socketService.off(
        "new-message",
        handleNewMessage
      );

      socketService.off(
        "edit-message",
        handleMessageUpdate
      );

      socketService.off(
        "delete-message",
        handleMessageUpdate
      );
    };
  }, [userId, fetchGroups]);

  const totalUnread = Object.values(
    unreadCounts
  ).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        unreadCounts,
        totalUnread,
        fetchGroups,
        incrementUnread,
        markAsRead,
        removeGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);

  if (!context) {
    throw new Error(
      "useGroups must be used within GroupProvider"
    );
  }

  return context;
}