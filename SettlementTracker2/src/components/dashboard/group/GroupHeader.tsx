// components/dashboard/group/GroupHeader.tsx
'use client';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin, Settings, MoreVertical, Edit2, UserPlus, Trash2, LogOut, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trip } from '@/app/(dashboard)/dashboard/group/types';
import { cn } from '@/lib/utils';

interface GroupHeaderProps {
    trip: Trip;
    isAdmin: boolean;
    isCreator: boolean;
    onEdit: () => void;
    onAddMember: () => void;
    onDelete: () => void;
    onLeave: () => void;
    isOnlyMember: boolean;
}

export function GroupHeader({ 
    trip, 
    isAdmin, 
    isCreator, 
    onEdit, 
    onAddMember, 
    onDelete,
    onLeave,
    isOnlyMember 
}: GroupHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Mobile back button */}
                <button
                    className="md:hidden p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    onClick={() => router.push('/dashboard/group')}
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                </button>

                {/* Group icon */}
                <button
                    onClick={() => router.push(`/dashboard/group/${trip.id}/settings`)}
                    className="relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                >
                    {trip.image ? (
                        <img
                            src={trip.image}
                            alt={trip.name}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                    ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm sm:text-xl font-bold text-white flex-shrink-0">
                            {trip.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </button>

                {/* Group info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <button
                            onClick={() => router.push(`/dashboard/group/${trip.id}/settings`)}
                            className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-50 truncate hover:text-blue-500 transition-colors text-left focus:outline-none max-w-[100px] sm:max-w-[200px]"
                        >
                            {trip.name}
                        </button>
                        
                        {/* Member count - only show as number on mobile */}
                        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="hidden xs:inline">members</span>
                            {trip.members?.length || 0}
                        </Badge>
                        
                        {/* Creator badge - hidden on mobile, shown on desktop */}
                        {isCreator && (
                            <Badge variant="default" className="hidden sm:flex text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5 bg-amber-500 whitespace-nowrap">
                                Creator
                            </Badge>
                        )}
                        
                        {/* Admin badge - hidden on mobile, shown on desktop */}
                        {isAdmin && !isCreator && (
                            <Badge variant="secondary" className="hidden sm:flex text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap">
                                Admin
                            </Badge>
                        )}
                    </div>
                    
                    {/* Destination - hidden on very small screens */}
                    {trip.destination && (
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-0.5 sm:gap-1">
                            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                            <span className="truncate hidden xs:inline">{trip.destination}</span>
                            <span className="truncate xs:hidden">{trip.destination}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                {/* Settings button - hidden on mobile */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className="hidden md:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => router.push(`/dashboard/group/${trip.id}/settings`)}
                            >
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Group Settings</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* More menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900">
                        <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {/* Settings option - only visible on mobile */}
                        <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/group/${trip.id}/settings`)}
                            className="cursor-pointer md:hidden data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 dark:data-[highlighted]:bg-gray-700 dark:data-[highlighted]:text-white"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Group Settings
                        </DropdownMenuItem>

                        {(isAdmin || isCreator) && (
                            <>
                                <DropdownMenuItem
                                    onClick={onEdit}
                                    className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 dark:data-[highlighted]:bg-gray-700 dark:data-[highlighted]:text-white"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Group
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={onAddMember}
                                    className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 dark:data-[highlighted]:bg-gray-700 dark:data-[highlighted]:text-white"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Member
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                            </>
                        )}

                        {/* Leave Group - Always visible */}
                        <DropdownMenuItem
                            onClick={onLeave}
                            className={cn(
                                "cursor-pointer",
                                isCreator && isOnlyMember
                                    ? "text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600 dark:data-[highlighted]:bg-red-950/30 dark:data-[highlighted]:text-red-400"
                                    : "text-yellow-600 data-[highlighted]:bg-yellow-50 data-[highlighted]:text-yellow-600 dark:data-[highlighted]:bg-yellow-950/30 dark:data-[highlighted]:text-yellow-400"
                            )}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            {isCreator && isOnlyMember ? 'Delete Group' : 'Leave Group'}
                        </DropdownMenuItem>

                        {/* Delete Group - Only for admins/creators */}
                        {(isAdmin || isCreator) && !isOnlyMember && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="cursor-pointer text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600 dark:data-[highlighted]:bg-red-950/30 dark:data-[highlighted]:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Group
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}