// app/(dashboard)/dashboard/group/context/GroupContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TripService } from '../services/trip.service';
import { Trip } from '../types';
import { useSession } from 'next-auth/react';
import { socketService } from '../services/socket.service';

const tripService = new TripService();

interface GroupContextType {
  groups: Trip[];
  loading: boolean;
  unreadCounts: Record<string, number>;
  fetchGroups: () => Promise<void>;
  removeGroup: (id: string) => void;
  markAsRead: (groupId: string) => void;
  incrementUnread: (groupId: string) => void;
  getUnreadCount: (groupId: string) => number;
  hasUnread: (groupId: string) => boolean;
  totalUnread: number;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedGroups = await tripService.getUserTrips();
      setGroups(fetchedGroups || []);
      
      // Load unread counts from localStorage
      const saved = localStorage.getItem('unreadCounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUnreadCounts(parsed);
        } catch {
          setUnreadCounts({});
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchGroups();
    }
  }, [session, fetchGroups]);

  // Listen for new messages via socket
  useEffect(() => {
    const messageHandler = (newMessage: any) => {
      if (newMessage.tripId) {
        // Don't increment unread if the message is from current user
        if (!newMessage.isOwn && newMessage.senderId !== session?.user?.id) {
          incrementUnread(newMessage.tripId);
        }
        // Refresh groups to update last message
        fetchGroups();
      }
    };

    const editHandler = (editedMessage: any) => {
      if (editedMessage.tripId) {
        fetchGroups();
      }
    };

    const deleteHandler = (data: { messageId: string; tripId: string }) => {
      if (data.tripId) {
        fetchGroups();
      }
    };

    socketService.on('message', messageHandler);
    socketService.on('new-message', messageHandler);
    socketService.on('edit-message', editHandler);
    socketService.on('delete-message', deleteHandler);

    return () => {
      socketService.off('message', messageHandler);
      socketService.off('new-message', messageHandler);
      socketService.off('edit-message', editHandler);
      socketService.off('delete-message', deleteHandler);
    };
  }, [fetchGroups, session]);

  const incrementUnread = useCallback((groupId: string) => {
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [groupId]: (prev[groupId] || 0) + 1
      };
      localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
      return newCounts;
    });
  }, []);

  const markAsRead = useCallback((groupId: string) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[groupId];
      localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
      return newCounts;
    });
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[id];
      localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
      return newCounts;
    });
  }, []);

  const getUnreadCount = useCallback((groupId: string) => {
    return unreadCounts[groupId] || 0;
  }, [unreadCounts]);

  const hasUnread = useCallback((groupId: string) => {
    return (unreadCounts[groupId] || 0) > 0;
  }, [unreadCounts]);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <GroupContext.Provider value={{
      groups,
      loading,
      unreadCounts,
      fetchGroups,
      removeGroup,
      markAsRead,
      incrementUnread,
      getUnreadCount,
      hasUnread,
      totalUnread,
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}