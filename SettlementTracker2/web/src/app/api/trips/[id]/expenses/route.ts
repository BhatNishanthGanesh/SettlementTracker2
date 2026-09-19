// app/api/trips/[id]/expenses/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";
import { evaluateBudgetAlerts } from "@/lib/budgetAlerts";

// =====================================================
// POST - Create expense
// =====================================================

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    const body = await request.json();

    const {
      title,
      description,
      amount,
      paidBy,
      category,
      splitBetween,
      splits,
    } = body;

    if (!title || !amount || !paidBy) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, amount, paidBy",
        },
        {
          status: 400,
        }
      );
    }

    const parsedAmount = Number(amount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Amount must be a valid positive number",
        },
        {
          status: 400,
        }
      );
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check if current user is a member
    const isMember = trip.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    if (!trip.members.some((member) => member.id === paidBy)) {
      return NextResponse.json(
        { error: "Invalid expense payer" },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Validate split data
    // -----------------------------------------

    const validSplitBetween =
      Array.isArray(splitBetween)
        ? splitBetween
        : [];

    const validSplits =
      splits &&
        typeof splits === "object"
        ? splits
        : {};

    // Make sure every split member exists
    const validMemberIds = new Set(
      trip.members
        .filter((member) => member.id)
        .map((member) => member.id!)
    );

    for (const memberId of validSplitBetween) {
      if (!validMemberIds.has(memberId)) {
        return NextResponse.json(
          {
            error:
              "Invalid member in split",
          },
          {
            status: 400,
          }
        );
      }
    }

    // -----------------------------------------
    // Validate split amounts
    // -----------------------------------------

    if (validSplitBetween.length > 0) {
      let splitTotal = 0;

      for (const memberId of validSplitBetween) {
        const share = Number(
          validSplits[memberId] ?? 0
        );

        if (!Number.isFinite(share) || share < 0) {
          return NextResponse.json(
            {
              error:
                "Invalid split amount",
            },
            {
              status: 400,
            }
          );
        }

        splitTotal += share;
      }

      // Allow tiny floating point difference
      if (
        Math.abs(
          splitTotal - parsedAmount
        ) > 0.01
      ) {
        return NextResponse.json(
          {
            error:
              `Split amounts must equal expense amount. ` +
              `Expected ₹${parsedAmount}, got ₹${splitTotal}`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // -----------------------------------------
    // Save expense
    // -----------------------------------------

    const metadata =
      validSplitBetween.length > 0
        ? JSON.stringify({
          splitBetween:
            validSplitBetween,

          splits:
            validSplits,
        })
        : null;

    const expense =
      await prisma.expense.create({
        data: {
          tripId,
          title: title.trim(),

          description:
            description?.trim() || null,

          amount: parsedAmount,

          paidBy,

          category:
            category?.trim() || null,

          metadata,
        },
      });

    try {
      await evaluateBudgetAlerts(tripId);
    } catch (alertError) {
      console.error("Budget alert evaluation failed:", alertError);
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error(
      "Error creating expense:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create expense",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// GET - Fetch expenses
// =====================================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    // Check trip and membership
    const trip =
      await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          members: true,
        },
      });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        {
          status: 404,
        }
      );
    }

    const isMember = trip.members.some(
      (member) =>
        member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const expenses =
      await prisma.expense.findMany({
        where: {
          tripId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const formattedExpenses = expenses.map((expense) => {
      let splitBetween: string[] = [];
      let splits: Record<string, number> = {};

      if (expense.metadata) {
        try {
          const metadata = JSON.parse(expense.metadata);

          splitBetween = metadata.splitBetween ?? [];
          splits = metadata.splits ?? {};
        } catch {
          splitBetween = [];
          splits = {};
        }
      }

      return {
        ...expense,
        splitBetween,
        splits,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedExpenses,
    });
  } catch (error) {
    console.error(
      "Error fetching expenses:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch expenses",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// DELETE - Delete expense
// =====================================================

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user = await requireUser();

    const { id: tripId } = await params;

    const url = new URL(
      request.url
    );

    const expenseId =
      url.searchParams.get(
        "expenseId"
      );

    if (!expenseId) {
      return NextResponse.json(
        {
          error: "Expense ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // Get trip and members
    const trip =
      await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          members: true,
        },
      });

    if (!trip) {
      return NextResponse.json(
        {
          error: "Trip not found",
        },
        {
          status: 404,
        }
      );
    }

    // Find current user's membership
    const userMember =
      trip.members.find(
        (member) =>
          member.userId === user.id
      );

    if (!userMember) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    // Get expense
    const expense =
      await prisma.expense.findFirst({
        where: {
          id: expenseId,
          tripId,
        },
      });

    if (!expense) {
      return NextResponse.json(
        {
          error: "Expense not found",
        },
        {
          status: 404,
        }
      );
    }

    const isAdmin =
      userMember.isAdmin;

    const isOwnExpense =
      expense.paidBy ===
      userMember.id;

    // Admin can delete any expense.
    // Normal members can delete only
    // expenses they paid.
    if (
      !isAdmin &&
      !isOwnExpense
    ) {
      return NextResponse.json(
        {
          error:
            "You can only delete your own expenses. Admins can delete any expense.",
        },
        {
          status: 403,
        }
      );
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting expense:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete expense",
      },
      {
        status: 500,
      }
    );
  }
}