import prisma from "@/lib/db";

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

async function broadcastBudgetMessage(
  tripId: string,
  message: { id: string; text: string; type: string; metadata: unknown; createdAt: Date; updatedAt: Date }
) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!socketUrl) return;

  try {
    await fetch(`${socketUrl}/broadcast/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId,
        message: {
          ...message,
          tripId,
          sender: "System",
          senderId: null,
          senderImage: null,
          createdAt: message.createdAt.toISOString(),
          updatedAt: message.updatedAt.toISOString(),
          edited: false,
          deleted: false,
        },
      }),
    });
  } catch (error) {
    console.error("Budget alert broadcast failed:", error);
  }
}

async function createBudgetAlert(
  tripId: string,
  alertKey: string,
  kind: string,
  threshold: number | null,
  amount: number,
  text: string
) {
  try {
    const alert = await prisma.budgetAlert.create({
      data: { tripId, alertKey, kind, threshold, amount },
    });

    const message = await prisma.message.create({
      data: {
        tripId,
        text,
        type: "budget_alert",
        metadata: JSON.stringify({
          alertKey,
          kind,
          threshold,
          amount,
        }),
      },
    });

    await broadcastBudgetMessage(tripId, {
      id: message.id,
      text: message.text,
      type: message.type,
      metadata: {
        alertKey,
        kind,
        threshold,
        amount,
      },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });

    return alert;
  } catch (error: any) {
    if (error?.code === "P2002") {
      return null;
    }
    throw error;
  }
}

export async function evaluateBudgetAlerts(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      budget: true,
      expenses: { select: { amount: true } },
    },
  });

  if (!trip || !Number.isFinite(Number(trip.budget)) || trip.budget <= 0) {
    return;
  }

  const spent = trip.expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );
  const budget = Number(trip.budget);

  for (const threshold of [25, 50, 75, 100]) {
    const thresholdAmount = budget * (threshold / 100);
    if (spent < thresholdAmount) continue;

    const text = threshold === 100
      ? `🚨 Your group has reached the full trip budget of ${formatAmount(budget)}.`
      : threshold >= 75
        ? `⚠️ Your group has used ${threshold}% of the trip budget.`
        : `📊 Your group has used ${threshold}% of the trip budget.`;

    await createBudgetAlert(
      tripId,
      `${tripId}-budget-${threshold}`,
      "threshold",
      threshold,
      spent,
      text
    );
  }

  if (spent > budget) {
    await createBudgetAlert(
      tripId,
      `${tripId}-budget-over`,
      "overspending",
      null,
      spent,
      `🔴 Your group has exceeded the trip budget by ${formatAmount(spent - budget)}.`
    );
  }
}
