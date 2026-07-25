// components/SettleTab.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trip, Member, Expense } from '@/app/(dashboard)/dashboard/group/types';
import { formatCurrency } from '@/utils/formatters';
import { useState, useEffect } from 'react';
import { Wallet, Users, CheckCircle, AlertCircle, Loader2, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SettleTabProps {
  trip: Trip;
  currentUserId: string;
  onSettleUp: (memberId: string) => void;
}

interface MemberBalance {
  memberId: string;
  name: string;
  paid: number;
  owes: number;
  balance: number;
}

export function SettleTab({ trip, currentUserId, onSettleUp }: SettleTabProps) {
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingMember, setSettlingMember] = useState<string | null>(null);

  useEffect(() => {
    const calculateBalances = () => {
      const memberBalances: Record<string, MemberBalance> = {};

      trip.members?.forEach((member: Member) => {
        memberBalances[member.id] = {
          memberId: member.id,
          name: member.name,
          paid: 0,
          owes: 0,
          balance: 0,
        };
      });

      trip.expenses?.forEach((expense: Expense) => {
        const paidBy = expense.paidBy;
        const amount = expense.amount;
        const splitBetween = (expense as any).splitBetween || trip.members?.map(m => m.id) || [];

        if (memberBalances[paidBy]) {
          memberBalances[paidBy].paid += amount;
        }

        const perPerson = splitBetween.length > 0 ? amount / splitBetween.length : 0;
        splitBetween.forEach((memberId: string) => {
          if (memberBalances[memberId]) {
            memberBalances[memberId].owes += perPerson;
          }
        });
      });

      const result = Object.values(memberBalances).map(member => ({
        ...member,
        balance: member.paid - member.owes,
      }));

      setBalances(result);
      setLoading(false);
    };

    calculateBalances();
  }, [trip]);

  const currentUserBalance = balances.find(b => b.memberId === currentUserId);
  const totalOwed = balances
    .filter(b => b.memberId !== currentUserId)
    .reduce((sum, b) => sum + Math.max(0, b.balance), 0);
  const totalOwes = balances
    .filter(b => b.memberId !== currentUserId)
    .reduce((sum, b) => sum + Math.max(0, -b.balance), 0);

  const membersWhoOwe = balances.filter(b => 
    b.memberId !== currentUserId && b.balance < 0
  );

  const membersOwedTo = balances.filter(b => 
    b.memberId !== currentUserId && b.balance > 0
  );

  const handleSettleUp = async (memberId: string) => {
    setSettlingMember(memberId);
    const member = balances.find(b => b.memberId === memberId);
    if (!member) return;

    const amount = Math.abs(member.balance);
    const isOwed = member.balance < 0;

    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(
      isOwed 
        ? `✅ ${member.name} has paid you ₹${formatCurrency(amount)}!`
        : `✅ You paid ${member.name} ₹${formatCurrency(amount)}!`,
      {
        description: isOwed ? 'Payment confirmed! 🎉' : 'Payment sent successfully! 🎉',
        duration: 4000,
      }
    );
    
    setSettlingMember(null);
    onSettleUp(memberId);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 overflow-y-auto min-h-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Calculating balances...</p>
        </div>
      </div>
    );
  }

  const currentUser = balances.find(b => b.memberId === currentUserId);

  return (
    <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Balance Summary - Custom card */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 rounded-2xl p-6 shadow-sm border border-emerald-100/50 dark:border-emerald-800/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">Your Balance</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Overview with all members</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                <Sparkles className="h-3 w-3 mr-1 text-emerald-500" />
                Live
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{formatCurrency(currentUser?.paid || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">Owed</p>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  ₹{formatCurrency(currentUser?.owes || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
                <p className={cn(
                  "text-2xl font-bold",
                  (currentUser?.balance || 0) > 0 
                    ? "text-green-600 dark:text-green-400" 
                    : (currentUser?.balance || 0) < 0 
                    ? "text-rose-600 dark:text-rose-400" 
                    : "text-gray-500"
                )}>
                  ₹{formatCurrency(Math.abs(currentUser?.balance || 0))}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {(currentUser?.balance || 0) > 0 ? 'owed to you' : 
                   (currentUser?.balance || 0) < 0 ? 'you owe' : 'settled ✨'}
                </p>
              </div>
            </div>

            {(totalOwed > 0 || totalOwes > 0) && (
              <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  {totalOwed > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" />
                      ₹{formatCurrency(totalOwed)} owed to you
                    </span>
                  )}
                  {totalOwes > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <ArrowDownRight className="h-4 w-4" />
                      ₹{formatCurrency(totalOwes)} you owe
                    </span>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={() => toast.info('Settle all feature coming soon!')}
                >
                  Settle All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Members who owe you */}
        {membersWhoOwe.length > 0 && (
          <div className="rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/30 bg-white dark:bg-gray-800/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">People who owe you</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">They need to pay you back</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {membersWhoOwe.length} person{membersWhoOwe.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="space-y-2">
              {membersWhoOwe.map((member, index) => (
                <div
                  key={member.memberId}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MemberBalanceCard
                    member={member}
                    type="owes-you"
                    onSettleUp={() => handleSettleUp(member.memberId)}
                    isSettling={settlingMember === member.memberId}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People you owe */}
        {membersOwedTo.length > 0 && (
          <div className="rounded-2xl p-6 border border-rose-200/50 dark:border-rose-800/30 bg-white dark:bg-gray-800/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                  <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">People you owe</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">You need to pay them back</p>
                </div>
              </div>
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                {membersOwedTo.length} person{membersOwedTo.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="space-y-2">
              {membersOwedTo.map((member, index) => (
                <div
                  key={member.memberId}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MemberBalanceCard
                    member={member}
                    type="you-owe"
                    onSettleUp={() => handleSettleUp(member.memberId)}
                    isSettling={settlingMember === member.memberId}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All settled */}
        {membersWhoOwe.length === 0 && membersOwedTo.length === 0 && balances.length > 1 && (
          <div className="rounded-2xl p-8 text-center bg-white dark:bg-gray-800/30 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">All settled up! 🎉</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              You don't owe anyone and no one owes you
            </p>
            <Badge className="mt-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              ✨ Perfectly balanced
            </Badge>
          </div>
        )}

        {/* No members */}
        {balances.length <= 1 && (
          <div className="rounded-2xl p-8 text-center bg-white dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">No other members</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add members to start splitting expenses
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => toast.info('Add members feature coming soon!')}
            >
              <Users className="h-4 w-4 mr-2" />
              Add Members
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Member Balance Card
interface MemberBalanceCardProps {
  member: MemberBalance;
  type: 'owes-you' | 'you-owe';
  onSettleUp: () => void;
  isSettling?: boolean;
}

function MemberBalanceCard({ member, type, onSettleUp, isSettling }: MemberBalanceCardProps) {
  const isOwesYou = type === 'owes-you';
  const amount = Math.abs(member.balance);
  
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-transform duration-200 group-hover:scale-105",
          isOwesYou 
            ? "bg-gradient-to-br from-emerald-400 to-teal-500" 
            : "bg-gradient-to-br from-rose-400 to-red-500"
        )}>
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {member.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Paid: ₹{formatCurrency(member.paid)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>Owes: ₹{formatCurrency(member.owes)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <Badge className={cn(
            "font-medium border-0",
            isOwesYou 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          )}>
            {isOwesYou ? '↑' : '↓'} ₹{formatCurrency(amount)}
          </Badge>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {isOwesYou ? 'owes you' : 'you owe'}
          </p>
        </div>
        
        <Button
          variant={isOwesYou ? "default" : "outline"}
          size="sm"
          onClick={onSettleUp}
          disabled={isSettling}
          className={cn(
            "min-w-[110px] transition-all duration-200 font-medium",
            isOwesYou 
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md" 
              : "border-rose-200 hover:border-rose-300 dark:border-rose-800 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          )}
        >
          {isSettling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            isOwesYou ? 'Request' : 'Pay Now'
          )}
        </Button>
      </div>
    </div>
  );
}