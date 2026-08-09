// app/dashboard/group/components/GroupSidebar.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Search,
    Plus,
    MoreVertical,
    Trash2,
    Loader2,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useGroups } from '@/context/GroupContext';
import { tripService } from '@/services/trip.service';
import { formatDistanceToNow } from 'date-fns';


export function GroupSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { groups, loading, removeGroup, fetchGroups, unreadCounts, markAsRead } = useGroups();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    useEffect(() => {
        const id = pathname?.split("/")[3];
        if (!id) {
            setSelectedGroupId(null);
            return;
        }

        setSelectedGroupId(id);
        markAsRead(id);
    }, [pathname, markAsRead]);

    const sortedGroups = [...groups].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        if (aTime !== bTime) return bTime - aTime;

        const aUnread = unreadCounts[a.id] || 0;
        const bUnread = unreadCounts[b.id] || 0;
        if (aUnread !== bUnread) return bUnread - aUnread;

        return a.name.localeCompare(b.name);
    });

    const filteredGroups = sortedGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.destination && group.destination.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleGroupSelect = (groupId: string) => {
        markAsRead(groupId);
        router.push(`/dashboard/group/${groupId}`);
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to delete this group?')) return;

        try {
            await tripService.deleteTrip(groupId);
            removeGroup(groupId);
            toast.success('Group deleted successfully');

            if (selectedGroupId === groupId) {
                router.push('/dashboard/group');
            }
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Failed to delete group');
            await fetchGroups();
        }
    };


    const getLastMessagePreview = (group: any) => {
        if (!group.lastMessage) {
            return group.destination || `${group.members?.length || 0} members`;
        }
        let message = group.lastMessage;
        return message.length > 40
            ? message.substring(0, 40) + '...'
            : message;
    };


    if (loading) {
        return (
            <div className="w-full md:w-[380px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Loading trips...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full md:w-[380px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full",
            selectedGroupId && "hidden md:flex"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Chats</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                            {Object.keys(unreadCounts).length > 0 && (
                                <span className="ml-2 text-blue-500 font-medium">
                                    · {Object.values(unreadCounts).reduce((a, b) => a + b, 0)} unread
                                </span>
                            )}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push('/dashboard/create-trip')}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        New Trip
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-100 dark:bg-gray-700 border-0 h-10 rounded-lg focus-visible:ring-1"
                    />
                </div>
            </div>

            {/* Group List */}
            <ScrollArea className="flex-1">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No groups match your search' : 'No trip groups found'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    variant="link"
                                    className="mt-2 text-blue-500"
                                    onClick={() => router.push('/dashboard/create-trip')}
                                >
                                    Create your first trip
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredGroups.map((group) => {
                            const unreadCount = unreadCounts[group.id] || 0;
                            const hasUnread = unreadCount > 0;

                            return (
                                <div
                                    key={group.id}
                                    className={cn(
                                        "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative",
                                        selectedGroupId === group.id && "bg-gray-100 dark:bg-gray-700",
                                        hasUnread && "bg-blue-50 dark:bg-blue-950/20"
                                    )}
                                    onClick={() => handleGroupSelect(group.id)}
                                >

                                    <div className="relative flex-shrink-0">
                                        <div className={
                                            "h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-500"}>
                                            {group.image ? (
                                                <img
                                                    src={group.image}
                                                    alt={group.name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                group.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        {hasUnread && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 ml-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className={cn(
                                                "text-sm font-medium truncate",
                                                hasUnread ? "text-gray-900 dark:text-gray-50 font-semibold" : "text-gray-700 dark:text-gray-300"
                                            )}>
                                                {group.name}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                                                {group.lastMessageAt
                                                    ? formatDistanceToNow(new Date(group.lastMessageAt), { addSuffix: true })
                                                    : new Date(group.createdAt).toLocaleDateString()
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 min-w-0">
                                            {group.lastMessageSender && (
                                                <span className={cn(
                                                    "text-xs flex-shrink-0",
                                                    hasUnread ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400"
                                                )}>
                                                    {group.lastMessageSender}:
                                                </span>
                                            )}
                                            <p className={cn(
                                                "text-xs truncate min-w-0",
                                                hasUnread ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400",
                                            )}>
                                                {getLastMessagePreview(group)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 px-1 rounded">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 bg-white">
                                                <DropdownMenuItem
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/group/${group.id}/settings`);
                                                    }}
                                                >
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Group Settings
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroup(group.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Group
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}