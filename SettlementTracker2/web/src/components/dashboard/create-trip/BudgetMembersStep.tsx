// components/trips/BudgetMembersStep.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, User, X } from 'lucide-react';
import { Member } from '@/types/trip.types';

interface BudgetMembersStepProps {
  budget: string;
  members: Member[];
  sessionName: string | null | undefined;
  sessionEmail: string | null | undefined;
  onBudgetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMemberChange: (index: number, field: 'name' | 'email', value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  totalMembers: number;
}

export const BudgetMembersStep = ({
  budget,
  members,
  sessionName,
  sessionEmail,
  onBudgetChange,
  onMemberChange,
  onAddMember,
  onRemoveMember,
  totalMembers
}: BudgetMembersStepProps ) => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Budget & Members
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set your budget and invite your travel buddies
        </p>
      </div>

      <div className="space-y-4">
        <BudgetInput
          value={budget}
          onChange={onBudgetChange}
        />

        <hr className="border-gray-200 dark:border-gray-800" />

        <MembersSection
          members={members}
          sessionName={sessionName}
          sessionEmail={sessionEmail}
          onMemberChange={onMemberChange}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
          totalMembers={totalMembers}
        />
      </div>
    </div>
  );
};

const BudgetInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="budget" className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Estimated Budget <span className="text-red-500">*</span>
    </Label>
    <div className="relative mt-1.5">
      <span className="absolute left-3 top-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">₹</span>
      <Input
        id="budget"
        name="budget"
        type="number"
        placeholder="Enter budget amount"
        className="pl-7 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        value={value}
        onChange={onChange}
        min="0"
        step="1"
      />
    </div>
  
  </div>
);

const MembersSection: React.FC<{
  members: Member[];
  sessionName: string | null | undefined;
  sessionEmail: string | null | undefined;
  onMemberChange: (index: number, field: 'name' | 'email', value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  totalMembers:number;
}> = ({ members, sessionName, sessionEmail, onMemberChange, onAddMember, onRemoveMember, totalMembers }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Trip Members
      </Label>
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
        Total : {totalMembers}
      </span>
    </div>

    <div className="space-y-3">
      <CreatorMember
        name={sessionName ?? "Anonymous"}
        email={sessionEmail ?? "No email"}
      />

      {members.map((member, index) => (
        <MemberInput
          key={index}
          member={member}
          index={index}
          isLast={members.length === 1}
          onChange={onMemberChange}
          onRemove={onRemoveMember}
        />
      ))}
    </div>

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onAddMember}
      className="w-full mt-3 h-10 border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Add Member
    </Button>
  </div>
);

const CreatorMember: React.FC<{
  name: string;
  email: string;
}> = ({ name, email }) => (
  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3">
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <div className="absolute left-3 top-2.5">
          <User className="h-4 w-4 text-emerald-500" />
        </div>
        <Input
          value={name}
          disabled
          className="pl-9 h-10 bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800/50 text-gray-900 dark:text-white"
        />
        <span className="absolute right-3 top-2.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
          Creator
        </span>
      </div>
      <div className="relative flex-1">
        <Input
          value={email}
          disabled
          className="h-10 bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800/50 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  </div>
);

const MemberInput: React.FC<{
  member: Member;
  index: number;
  isLast: boolean;
  onChange: (index: number, field: 'name' | 'email', value: string) => void;
  onRemove: (index: number) => void;
}> = ({ member, index, isLast, onChange, onRemove }) => (
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <div className="absolute left-3 top-2.5">
        <User className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        placeholder={`Member ${index + 1} Name`}
        value={member.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      />
    </div>
    <div className="relative flex-1">
      <Input
        placeholder="Email"
        value={member.email}
        onChange={(e) => onChange(index, 'email', e.target.value)}
        className="h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        type="email"
      />
    </div>
    {!isLast && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
      >
        <X className="h-4 w-4" />
      </Button>
    )}
    {isLast && (
      <div className="w-10" />
    )}
  </div>
);