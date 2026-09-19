"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Trip,
  Member,
  MemberBalance,
  Settlement,
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
  Smartphone,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { settlementService } from "@/services/settlement.service";

interface SettleTabProps {
  trip: Trip;

  currentUser: Member | undefined;

  onSettleUp: (memberId: string) => void | Promise<void>;
}

export function SettleTab({
  trip,
  currentUser,
  onSettleUp,
}: SettleTabProps) {
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [settlingMember, setSettlingMember] =
    useState<string | null>(null);
  const [paymentMember, setPaymentMember] =
    useState<MemberBalance | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<"idle" | "processing" | "success">("idle");
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(true);

  // ==================================================
  // CURRENT USER
  //
  // currentUser.id = TripMember.id
  //
  // Expense.paidBy also contains TripMember.id
  // ==================================================

  const currentUserMemberId = currentUser?.id;
  const currentUserId = currentUser?.userId ?? currentUserMemberId;

  // ==================================================
  // Calculate balances
  // ==================================================

  useEffect(() => {
    if (!currentUserMemberId) {
      setBalances([]);
      return;
    }

    const stats = calculateTripStats(
      { ...trip, settlements },
      currentUserId
    );

    setBalances(stats.memberBalances);
  }, [
    trip,
    currentUser,
    currentUserId,
    settlements,
  ]);

  useEffect(() => {
    let active = true;

    const loadSettlements = async () => {
      setIsLoadingSettlements(true);
      try {
        const loaded = await settlementService.list(trip.id);
        if (active) {
          setSettlements(loaded);
        }
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Failed to load settlements");
        }
      } finally {
        if (active) {
          setIsLoadingSettlements(false);
        }
      }
    };

    loadSettlements();

    return () => {
      active = false;
    };
  }, [trip.id]);

  const getCompletedAmount = (memberId: string) =>
    settlements
      .filter(
        (settlement) =>
          settlement.status === "completed" &&
          settlement.payerId === currentUserMemberId &&
          settlement.recipientId === memberId
      )
      .reduce((total, settlement) => total + settlement.amount, 0);

  const getReceivedAmount = (memberId: string) =>
    settlements
      .filter(
        (settlement) =>
          settlement.status === "completed" &&
          settlement.payerId === memberId &&
          settlement.recipientId === currentUserMemberId
      )
      .reduce((total, settlement) => total + settlement.amount, 0);

  const pendingRequestFor = (memberId: string) =>
    settlements.find(
      (settlement) =>
        settlement.status === "pending" &&
        settlement.payerId === memberId &&
        settlement.recipientId === currentUserMemberId
    );

  const pendingRequestTo = (memberId: string) =>
    settlements.find(
      (settlement) =>
        settlement.status === "pending" &&
        settlement.payerId === currentUserMemberId &&
        settlement.recipientId === memberId
    );

  // ==================================================
  // Current user's calculated balance
  // ==================================================

  const myBalance = useMemo(() => {
    if (!currentUserMemberId) {
      return undefined;
    }

    const balance = balances.find(
      (balance) =>
        balance.memberId === currentUserMemberId
    );

    if (!balance) {
      return undefined;
    }

    const completedOutgoing = settlements
      .filter(
        (settlement) =>
          settlement.status === "completed" &&
          settlement.payerId === currentUserMemberId
      )
      .reduce((total, settlement) => total + settlement.amount, 0);
    const completedIncoming = settlements
      .filter(
        (settlement) =>
          settlement.status === "completed" &&
          settlement.recipientId === currentUserMemberId
      )
      .reduce((total, settlement) => total + settlement.amount, 0);

    return {
      ...balance,
      balance: balance.balance - completedOutgoing + completedIncoming,
    };
  }, [
    balances,
    currentUserMemberId,
    settlements,
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
        if (member.memberId === currentUserMemberId) {
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
        if (member.memberId === currentUserMemberId) {
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

  const openPaymentModal = (member: MemberBalance) => {
    setPaymentMember(member);
    setPaymentStatus("idle");
    setPaymentReference(`payment-${crypto.randomUUID()}`);
    setPaymentError(null);
  };

  const closePaymentModal = () => {
    if (paymentStatus !== "processing") {
      setPaymentMember(null);
      setPaymentStatus("idle");
      setPaymentReference(null);
      setPaymentError(null);
    }
  };

  const handlePayment = async () => {
    if (!paymentMember || paymentStatus !== "idle") {
      return;
    }

    if (!paymentReference) {
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await settlementService.pay(
        trip.id,
        paymentMember.memberId,
        paymentReference
      );
      setSettlements(await settlementService.list(trip.id));
      setPaymentStatus("success");
      await onSettleUp(paymentMember.memberId);
      window.setTimeout(() => {
        setPaymentMember(null);
        setPaymentStatus("idle");
        setPaymentReference(null);
      }, 900);
    } catch (error) {
      setPaymentStatus("idle");
      setPaymentError(error instanceof Error ? error.message : "Payment failed");
      toast.error("Payment failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleSettleUp = async (member: MemberBalance) => {

    if (!member.memberId) {
      return;
    }

    if (member.balance > 0) {
      openPaymentModal(member);
      return;
    }

    if (pendingRequestFor(member.memberId)) {
      return;
    }

    setSettlingMember(member.memberId);
    try {
      await settlementService.request(trip.id, member.memberId);
      setSettlements(await settlementService.list(trip.id));
      toast.success("Payment request sent", {
        description: `${member.name} can now pay the outstanding balance.`,
      });
    } catch (error) {
      toast.error("Could not send payment request", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSettlingMember(null);
    }
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

  if (!balances.length || isLoadingSettlements) {
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
                    onSettleUp={() => handleSettleUp(member)}
                    isSettling={
                      settlingMember ===
                      member.memberId
                    }
                    status={pendingRequestFor(member.memberId) ? "requested" : undefined}
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
                    onSettleUp={() => handleSettleUp(member)}
                    isSettling={
                      settlingMember ===
                      member.memberId
                    }
                    status={pendingRequestTo(member.memberId) ? "requested" : undefined}
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

      <Dialog
        open={paymentMember !== null}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentModal();
          }
        }}
      >
        <DialogContent
          className="max-w-md gap-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          onInteractOutside={(event) => {
            if (paymentStatus === "processing") {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (paymentStatus === "processing") {
              event.preventDefault();
            }
          }}
        >
          {paymentMember && (
            <div className="max-h-[min(720px,calc(100vh-2rem))] overflow-y-auto">
              {paymentStatus === "success" ? (
                <div className="flex flex-col items-center px-6 py-10 text-center sm:px-8">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                    <CheckCircle className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <DialogTitle className="text-2xl font-bold tracking-normal text-slate-900 dark:text-white">
                    Payment successful
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {formatCurrency(Math.abs(paymentMember.balance))} paid to {paymentMember.name}
                  </DialogDescription>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Settlement updated
                  </div>
                  <Button className="mt-8 h-11 w-full" onClick={closePaymentModal}>
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <DialogHeader className="border-b border-slate-100 px-6 pb-5 pt-6 text-left dark:border-slate-800 sm:px-8">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-normal text-slate-900 dark:text-white">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">
                        <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </span>
                      Pay {paymentMember.name}
                    </DialogTitle>
                    <DialogDescription className="pl-11 text-sm text-slate-500 dark:text-slate-400">
                      Settlement payment
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 px-6 py-6 sm:px-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-base font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-200">
                        {trip.members.find((member) => member.id === paymentMember.memberId)?.image ? (
                          <img
                            src={trip.members.find((member) => member.id === paymentMember.memberId)?.image ?? ""}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          paymentMember.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                          {paymentMember.name}
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {`${paymentMember.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "recipient"}@settlemate`}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-4xl font-bold tracking-normal text-blue-600 dark:text-blue-400 sm:text-5xl">
                        {formatCurrency(Math.abs(paymentMember.balance))}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Settlement amount
                      </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                          Demo payment
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No real money will be transferred
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Payment for</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">Settlement</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Recipient</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{paymentMember.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Amount</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(Math.abs(paymentMember.balance))}
                        </span>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                        <p className="font-semibold">Payment failed</p>
                        <p className="mt-0.5 text-xs">We couldn&apos;t complete this demo payment.</p>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex-row gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-8">
                    <Button
                      variant="outline"
                      className="h-11 flex-1 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                      onClick={closePaymentModal}
                      disabled={paymentStatus === "processing"}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-11 flex-1 bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      onClick={handlePayment}
                      disabled={paymentStatus === "processing"}
                    >
                      {paymentStatus === "processing" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatCurrency(Math.abs(paymentMember.balance))}`
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
  status?: "requested";
}

function MemberBalanceCard({
  member,
  type,
  onSettleUp,
  isSettling,
  status,
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
            status === "requested" ? "Requested" : "Request"
          ) : (
            "Pay Now"
          )}
        </Button>

      </div>

    </div>
  );
}