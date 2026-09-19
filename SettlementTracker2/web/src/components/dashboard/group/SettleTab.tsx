"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Trip,
  Member,
  MemberBalance,
} from "@/types/trip.types";

import { formatCurrency } from "@/utils/formatters";
import { calculateTripStats } from "@/utils/tripStats";

import {
  Wallet,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettleTabProps {
  trip: Trip;

  currentUser: Member | undefined;

  onSettleUp: (memberId: string) => void;
}

export function SettleTab({
  trip,
  currentUser,
  onSettleUp,
}: SettleTabProps) {
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [settlingMember, setSettlingMember] =
    useState<string | null>(null);

  // ==================================================
  // CURRENT USER
  //
  // currentUser.id = TripMember.id
  //
  // Expense.paidBy also contains TripMember.id
  // ==================================================

  const currentUserMemberId = currentUser?.id;

  // ==================================================
  // Calculate balances
  // ==================================================

  useEffect(() => {
    if (!currentUserMemberId) {
      setBalances([]);
      return;
    }

    const stats = calculateTripStats(
      trip,
      currentUserMemberId
    );

    setBalances(stats.memberBalances);
  }, [
    trip,
    currentUser,
    currentUserMemberId,
  ]);

  // ==================================================
  // Current user's calculated balance
  // ==================================================

  const myBalance = useMemo(() => {
    if (!currentUserMemberId) {
      return undefined;
    }

    return balances.find(
      (balance) =>
        balance.memberId === currentUserMemberId
    );
  }, [
    balances,
    currentUserMemberId,
  ]);

  // ==================================================
  // People who owe ME
  //
  // balance < 0 means:
  //
  // paid < share
  //
  // Therefore they owe money to me.
  // ==================================================

  const membersWhoOwe = useMemo(() => {
    if (!currentUserMemberId) {
      return [];
    }

    return balances.filter((member) => {
      if (
        member.memberId ===
        currentUserMemberId
      ) {
        return false;
      }

      return member.balance < 0;
    });
  }, [
    balances,
    currentUserMemberId,
  ]);

  // ==================================================
  // People I owe
  //
  // balance > 0 means:
  //
  // paid > share
  //
  // Therefore I owe them.
  // ==================================================

  const membersOwedTo = useMemo(() => {
    if (!currentUserMemberId) {
      return [];
    }

    return balances.filter((member) => {
      if (
        member.memberId ===
        currentUserMemberId
      ) {
        return false;
      }

      return member.balance > 0;
    });
  }, [
    balances,
    currentUserMemberId,
  ]);

  // ==================================================
  // Total others owe me
  // ==================================================

  const totalOwed = membersWhoOwe.reduce(
    (sum, member) =>
      sum + Math.abs(member.balance),
    0
  );

  // ==================================================
  // Total I owe others
  // ==================================================

  const totalOwes = membersOwedTo.reduce(
    (sum, member) =>
      sum + Math.abs(member.balance),
    0
  );

  // ==================================================
  // Settle
  // ==================================================

  const handleSettleUp = async (
    memberId: string
  ) => {
    setSettlingMember(memberId);

    const member = balances.find(
      (item) =>
        item.memberId === memberId
    );

    if (!member) {
      setSettlingMember(null);
      return;
    }

    const amount = Math.abs(
      member.balance
    );

    const isOwedByMember =
      member.balance < 0;

    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    toast.success(
      isOwedByMember
        ? `✅ ${member.name} has paid you ${formatCurrency(
            amount
          )}!`
        : `✅ You paid ${member.name} ${formatCurrency(
            amount
          )}!`,
      {
        description: isOwedByMember
          ? "Payment confirmed! 🎉"
          : "Payment sent successfully! 🎉",
        duration: 4000,
      }
    );

    setSettlingMember(null);

    onSettleUp(memberId);
  };

  // ==================================================
  // Loading
  // ==================================================

  if (!currentUserMemberId) {
    return (
      <div className="flex-1 p-4 overflow-y-auto min-h-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto" />

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Finding your account...
          </p>
        </div>
      </div>
    );
  }

  if (!balances.length) {
    return (
      <div className="flex-1 p-4 overflow-y-auto min-h-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto" />

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Calculating balances...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ================================================= */}
        {/* YOUR BALANCE */}
        {/* ================================================= */}

        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 rounded-2xl p-6 shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Your Balance
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your spending and outstanding balance
                </p>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-3">

            {/* PAID */}

            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paid
              </p>

              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(
                  myBalance?.paid ?? 0
                )}
              </p>

            </div>

            {/* YOUR SHARE */}

            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your Share
              </p>

              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {formatCurrency(
                  myBalance?.owes ?? 0
                )}
              </p>

            </div>

            {/* NET */}

            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Net
              </p>

              <p
                className={cn(
                  "text-2xl font-bold",
                  (myBalance?.balance ?? 0) > 0
                    ? "text-green-600 dark:text-green-400"
                    : (myBalance?.balance ?? 0) < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-gray-500"
                )}
              >
                {formatCurrency(
                  Math.abs(
                    myBalance?.balance ?? 0
                  )
                )}
              </p>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {(myBalance?.balance ?? 0) > 0
                  ? "owed to you"
                  : (myBalance?.balance ?? 0) < 0
                  ? "you owe"
                  : "settled ✨"}
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* PEOPLE WHO OWE YOU */}
        {/* ================================================= */}

        {membersWhoOwe.length > 0 && (

          <section className="rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/30 bg-white dark:bg-gray-800/30 shadow-sm">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">

                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                <div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    People who owe you
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    They need to pay you back
                  </p>

                </div>

              </div>

              <Badge>
                {membersWhoOwe.length} person
                {membersWhoOwe.length > 1
                  ? "s"
                  : ""}
              </Badge>

            </div>

            <div className="space-y-2">

              {membersWhoOwe.map(
                (member) => (

                  <MemberBalanceCard
                    key={member.memberId}
                    member={member}
                    type="owes-you"
                    onSettleUp={() =>
                      handleSettleUp(
                        member.memberId
                      )
                    }
                    isSettling={
                      settlingMember ===
                      member.memberId
                    }
                  />

                )
              )}

            </div>

          </section>
        )}

        {/* ================================================= */}
        {/* PEOPLE YOU OWE */}
        {/* ================================================= */}

        {membersOwedTo.length > 0 && (

          <section className="rounded-2xl p-6 border border-rose-200/50 dark:border-rose-800/30 bg-white dark:bg-gray-800/30 shadow-sm">

            <div className="flex items-center gap-2 mb-4">

              <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />

              <div>

                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  People you owe
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You need to pay them back
                </p>

              </div>

            </div>

            <div className="space-y-2">

              {membersOwedTo.map(
                (member) => (

                  <MemberBalanceCard
                    key={member.memberId}
                    member={member}
                    type="you-owe"
                    onSettleUp={() =>
                      handleSettleUp(
                        member.memberId
                      )
                    }
                    isSettling={
                      settlingMember ===
                      member.memberId
                    }
                  />

                )
              )}

            </div>

          </section>
        )}

        {/* ================================================= */}
        {/* ALL SETTLED */}
        {/* ================================================= */}

        {membersWhoOwe.length === 0 &&
          membersOwedTo.length === 0 &&
          balances.length > 1 && (

            <div className="rounded-2xl p-8 text-center bg-white dark:bg-gray-800/30 border border-emerald-200/50 dark:border-emerald-800/30">

              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4" />

              <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                All settled up! 🎉
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You don't owe anyone and no one owes you
              </p>

            </div>
          )}

        {/* ================================================= */}
        {/* NO MEMBERS */}
        {/* ================================================= */}

        {balances.length <= 1 && (

          <div className="rounded-2xl p-8 text-center bg-white dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50">

            <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />

            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              No other members
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add members to start splitting expenses
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

// ==================================================
// MEMBER BALANCE CARD
// ==================================================

interface MemberBalanceCardProps {
  member: MemberBalance;
  type: "owes-you" | "you-owe";
  onSettleUp: () => void;
  isSettling?: boolean;
}

function MemberBalanceCard({
  member,
  type,
  onSettleUp,
  isSettling,
}: MemberBalanceCardProps) {
  const isOwesYou =
    type === "owes-you";

  const amount = Math.abs(
    member.balance
  );

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">

      <div>

        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
          {member.name}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">

          <span>
            Paid:{" "}
            {formatCurrency(
              member.paid
            )}
          </span>

          <span>•</span>

          <span>
            Share:{" "}
            {formatCurrency(
              member.owes
            )}
          </span>

        </div>

      </div>

      <div className="flex items-center gap-3">

        <Badge
          className={cn(
            "font-medium border-0",
            isOwesYou
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          )}
        >
          {isOwesYou
            ? "↑"
            : "↓"}

          {formatCurrency(
            amount
          )}
        </Badge>

        <Button
          variant={
            isOwesYou
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={onSettleUp}
          disabled={isSettling}
        >
          {isSettling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isOwesYou ? (
            "Request"
          ) : (
            "Pay Now"
          )}
        </Button>

      </div>

    </div>
  );
}