import {
  Trip,
  TripStats,
  MultipleTripStats,
  DashboardStats
} from "@/types/trip.types";

interface ExpenseMetadata {
  splitBetween?: string[];
  splitBetweenIds?: string[];
  splits?: Record<string, number>;
}

const getExpenseMetadata = (
  metadata?: string
): ExpenseMetadata | null => {
  if (!metadata) return null;

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
};

const getSplitBetween = (metadata?: string): string[] => {
  const parsed = getExpenseMetadata(metadata);

  if (!parsed) return [];

  if (
    Array.isArray(parsed.splitBetweenIds) &&
    parsed.splitBetweenIds.length
  ) {
    return parsed.splitBetweenIds;
  }

  if (
    Array.isArray(parsed.splitBetween) &&
    parsed.splitBetween.length
  ) {
    return parsed.splitBetween;
  }

  return [];
};

const getSplits = (
  metadata?: string
): Record<string, number> => {
  return getExpenseMetadata(metadata)?.splits ?? {};
};

export const calculateTripStats = (
  trip: Trip,
  currentUserId?: string
): TripStats => {
  const members = trip.members ?? [];
  const expenses = trip.expenses ?? [];

  // -----------------------------------------
  // Find the current user's TripMember
  // -----------------------------------------
  const currentUserMember = members.find(
    (member) => member.userId === currentUserId
  );

  const currentUserMemberId = currentUserMember?.id;

  // -----------------------------------------
  // Track what each member paid / owes
  // -----------------------------------------
  const balances = new Map<
    string,
    {
      paid: number;
      owes: number;
    }
  >();

  members.forEach((member) => {
    if (!member.id) return;

    balances.set(member.id, {
      paid: 0,
      owes: 0,
    });
  });

  // -----------------------------------------
  // IMPORTANT:
  // totalSpent = money THIS USER actually paid
  // NOT total trip expenses
  // -----------------------------------------
  let totalSpent = 0;

  for (const expense of expenses) {
    // ---------------------------------------
    // What did I personally pay?
    // ---------------------------------------
    if (
      currentUserMemberId &&
      expense.paidBy === currentUserMemberId
    ) {
      totalSpent += expense.amount;
    }

    // ---------------------------------------
    // Record who paid the expense
    // ---------------------------------------
    const payer = balances.get(expense.paidBy);

    if (payer) {
      payer.paid += expense.amount;
    }

    // ---------------------------------------
    // Get exact split information
    // ---------------------------------------
    const participants = getSplitBetween(
      expense.metadata
    );

    const splits = getSplits(
      expense.metadata
    );

    // ---------------------------------------
    // No explicit split
    // ---------------------------------------
    if (!participants.length) {
      if (payer) {
        payer.owes += expense.amount;
      }

      continue;
    }

    // ---------------------------------------
    // Add each person's EXACT share
    // ---------------------------------------
    participants.forEach((memberId) => {
      const member = balances.get(memberId);

      if (!member) return;

      member.owes += Number(
        splits[memberId] ?? 0
      );
    });
  }

  // -----------------------------------------
  // Calculate each member's balance
  // -----------------------------------------
  const memberBalances = members
    .filter((member) => member.id)
    .map((member) => {
      const balance =
        balances.get(member.id!) ?? {
          paid: 0,
          owes: 0,
        };

      return {
        memberId: member.id!,
        name: member.name,
        paid: balance.paid,
        owes: balance.owes,
        balance:
          balance.paid - balance.owes,
      };
    });

  // -----------------------------------------
  // Current user's balance
  //
  // +₹400 = others owe me ₹400
  // -₹400 = I owe others ₹400
  // ₹0    = nothing pending
  // -----------------------------------------
  const currentUserBalance =
    memberBalances.find(
      (member) =>
        member.memberId ===
        currentUserMemberId
    );

  const balance =
    currentUserBalance?.balance ?? 0;

  // -----------------------------------------
  // Amount others owe me
  // -----------------------------------------
  const owedToMe = Math.max(0, balance);

  return {
    totalSpent,
    expenseCount: expenses.length,
    memberCount: members.length,
    owedToMe,
    currentUserBalance: balance,
    memberBalances,
  };
};

export const calculateMultipleTripsStats = (
  trips: Trip[],
  currentUserId?: string
): MultipleTripStats => {
  const stats = trips.map((trip) =>
    calculateTripStats(trip, currentUserId)
  );

  const totals = {
    totalSpent: 0,
    totalTrips: trips.length,
    settledCount: 0,
    pendingCount: 0,
    pendingBalance: 0,
  };

  stats.forEach((trip) => {
    // Money THIS USER personally paid
    totals.totalSpent += trip.totalSpent;

    const myBalance = trip.currentUserBalance;

    if (myBalance === 0) {
      // Nobody owes me
      // I don't owe anybody
      totals.settledCount++;
    } else {
      // Either:
      // + balance => someone owes me
      // - balance => I owe someone
      totals.pendingCount++;

      // Pending Balance means:
      // money I personally owe others
      if (myBalance < 0) {
        totals.pendingBalance += Math.abs(myBalance);
      }
    }
  });

  const dashboardStats: DashboardStats = {
    totalSpent: totals.totalSpent,

    totalTrips: totals.totalTrips,

    averageSpent:
      totals.totalTrips > 0
        ? totals.totalSpent / totals.totalTrips
        : 0,

    settledCount: totals.settledCount,

    pendingCount: totals.pendingCount,

    pendingBalance: totals.pendingBalance,
  };

  return {
    stats,
    totals,
    dashboardStats,
  };
};