// components/dashboard/group/settings/MembersList.tsx
'use client';
import React from 'react';
import { Users, UserPlus, Crown, Check, AlertCircle, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Member } from '@/app/(dashboard)/dashboard/group/types';

interface MembersListProps {
  members: Member[];
  canEdit: boolean;
  currentUserEmail: string;
  onAddMember: () => void;
  onRemoveMember: (member: Member) => void;
}

export function MembersList({ 
  members, 
  canEdit, 
  currentUserEmail, 
  onAddMember, 
  onRemoveMember 
}: MembersListProps) {
  // Function to get avatar fallback color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Members</h2>
              <p className="text-sm text-gray-500">{members.length} members in this group</p>
            </div>
          </div>
          {canEdit && (
            <Button size="sm" onClick={onAddMember} className="rounded-full">
              <UserPlus className="h-4 w-4 mr-1" /> Add Member
            </Button>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-2">
          {members.map((member) => {
            const isCurrentUser = member.email === currentUserEmail;
            const canRemove = canEdit && !member.isAdmin && !isCurrentUser;

            return (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-gray-800 shadow-md">
                      {member.image ? (
                        <AvatarImage 
                          src={member.image} 
                          alt={member.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className={cn(
                          "bg-gradient-to-br text-white font-semibold text-sm",
                          getAvatarColor(member.name)
                        )}>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className={cn(
                      "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm",
                      member.joined ? 'bg-green-500' : 'bg-yellow-500'
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.isAdmin && (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none">
                          <Crown className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      )}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {member.joined ? (
                        <><Check className="h-3 w-3 text-green-500" /> Joined</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 text-yellow-500" /> Pending</>
                      )}
                    </p>
                  </div>
                </div>
                {canRemove && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100" 
                    onClick={() => onRemoveMember(member)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}