  // app/api/chat/route.ts

  import { NextRequest, NextResponse } from "next/server";

  import prisma from "@/lib/db";
  import Groq from "groq-sdk";

  import { requireUser } from "@/helpers/auth";

  import {
    PROMPT_CONTEXTS,
    QueryValidator,
    ResponseGenerator,
  } from "@/app/(dashboard)/prompts";

  import { ResponseContext } from "@/app/(dashboard)/prompts/types";

  import { calculateMultipleTripsStats } from "@/utils/tripStats";
  import { Trip } from "@/types/trip.types";

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
  });

  // =====================================================
  // Determine context
  // =====================================================

  function getContextForQuery(
    message: string,
    context: ResponseContext
  ): string {
    const lowerMsg = message.toLowerCase();

    // Technical
    if (
      lowerMsg.includes("api") ||
      lowerMsg.includes("endpoint") ||
      lowerMsg.includes("database") ||
      lowerMsg.includes("schema") ||
      lowerMsg.includes("model") ||
      lowerMsg.includes("integration")
    ) {
      return "TECHNICAL";
    }

    // Onboarding
    if (
      lowerMsg.includes("new") ||
      lowerMsg.includes("start") ||
      lowerMsg.includes("create") ||
      lowerMsg.includes("first time") ||
      lowerMsg.includes("begin") ||
      lowerMsg.includes("tutorial")
    ) {
      return "ONBOARDING";
    }

    // Travel
    if (
      lowerMsg.includes("plan") ||
      lowerMsg.includes("destination") ||
      lowerMsg.includes("visit") ||
      lowerMsg.includes("travel to") ||
      lowerMsg.includes("go to") ||
      lowerMsg.includes("vacation")
    ) {
      return "TRAVEL";
    }

    // Analytics
    if (
      lowerMsg.includes("analytics") ||
      lowerMsg.includes("trend") ||
      lowerMsg.includes("pattern") ||
      lowerMsg.includes("insight") ||
      lowerMsg.includes("analysis") ||
      lowerMsg.includes("data")
    ) {
      return "ANALYTICS";
    }

    // Expert
    if (
      lowerMsg.includes("invest") ||
      lowerMsg.includes("optimize") ||
      lowerMsg.includes("strategy") ||
      lowerMsg.includes("maximize") ||
      lowerMsg.includes("professional") ||
      lowerMsg.includes("expert")
    ) {
      return "EXPERT";
    }

    // Friendly
    if (
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hi") ||
      lowerMsg.includes("hey") ||
      lowerMsg.includes("thanks") ||
      lowerMsg.includes("thank you") ||
      lowerMsg.includes("wow")
    ) {
      return "FRIENDLY";
    }

    // Concise
    if (
      lowerMsg.includes("brief") ||
      lowerMsg.includes("quick") ||
      lowerMsg.includes("short") ||
      lowerMsg.includes("just") ||
      lowerMsg.includes("simply") ||
      lowerMsg.length < 30
    ) {
      return "CONCISE";
    }

    return "DEFAULT";
  }

  // =====================================================
  // POST - Chat
  // =====================================================

  export async function POST(
    request: NextRequest
  ) {
    try {
      // Get authenticated user
      const user = await requireUser();

      const body = await request.json();

      const { message } = body;

      if (
        !message ||
        typeof message !== "string"
      ) {
        return NextResponse.json(
          {
            error: "Message is required",
          },
          {
            status: 400,
          }
        );
      }

      // =================================================
      // Fetch user's trips
      // =================================================

      const trips =
        await prisma.trip.findMany({
          where: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },

          include: {
            members: true,

            expenses: true,

            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    name: true,
                  },
                },
              },
            },

            _count: {
              select: {
                members: true,
                expenses: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      // =================================================
      // Calculate stats using existing helper
      // =================================================

     const statsTrips: Trip[] = trips.map((trip) => ({
  id: trip.id,
  name: trip.name,
  destination: trip.destination,
  startDate: trip.startDate?.toISOString() ?? null,
  endDate: trip.endDate?.toISOString() ?? null,
  budget: trip.budget,
  description: trip.description,
  image: trip.image,
  shareableLink: "",
  createdAt: trip.createdAt.toISOString(),
  updatedAt: trip.updatedAt.toISOString(),

  members: trip.members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email ?? "",
    image: null,
    joined: member.joined,
    isAdmin: member.isAdmin,
  })),

  expenses: trip.expenses.map((expense) => ({
    id: expense.id,
    tripId: expense.tripId,
    title: expense.title,
    description: expense.description ?? undefined,
    amount: expense.amount,
    paidBy: expense.paidBy,
    category: expense.category ?? undefined,
    metadata: expense.metadata ?? undefined,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  })),
}));

  const multipleStats = calculateMultipleTripsStats(
    statsTrips,
    user.id
  );

      const {
        stats,
        dashboardStats,
      } = multipleStats;

      // =================================================
      // Format trips
      // =================================================

      const formattedTrips =
        trips.map((trip, index) => {
          const tripStats =
            stats[index];

          const lastMessage =
            trip.messages[0];

          return {
            id: trip.id,

            name: trip.name,

            destination:
              trip.destination ||
              "Unknown",

            budget: trip.budget,

            spent:
              tripStats.totalSpent,

            owedToMe:
              tripStats.owedToMe,

            expenseCount:
              tripStats.expenseCount,

            memberCount:
              tripStats.memberCount,

            status:
              tripStats.memberBalances.every(
                (member) =>
                  member.balance === 0
              )
                ? "settled"
                : "pending",

            members:
              trip.members.map(
                (member) =>
                  member.name
              ),

            memberBalances:
              tripStats.memberBalances,

            expenses:
              trip.expenses.map(
                (expense) => ({
                  title:
                    expense.title,

                  amount:
                    expense.amount,

                  paidBy:
                    expense.paidBy,

                  category:
                    expense.category ||
                    "other",

                  createdAt:
                    expense.createdAt,
                })
              ),

            lastMessage:
              lastMessage?.text ||
              null,

            lastMessageAt:
              lastMessage?.createdAt ||
              trip.updatedAt,

            lastMessageSender:
              lastMessage
                ?.sender
                ?.name || null,
          };
        });

      // =================================================
      // Overall expense information
      // =================================================

      const allExpenses =
        trips.flatMap(
          (trip) =>
            trip.expenses || []
        );

      const categories: Record<
        string,
        number
      > = {};

      allExpenses.forEach(
        (expense) => {
          const category =
            expense.category ||
            "other";

          categories[category] =
            (categories[category] ||
              0) + expense.amount;
        }
      );

      const categoryTotals =
        Object.entries(
          categories
        ).sort(
          (a, b) => b[1] - a[1]
        );

      // =================================================
      // AI context
      // =================================================

      const context: ResponseContext = {
        user: {
          name:
            user.name ||
            "User",

          email: user.email,
        },

        summary: {
          totalTrips: dashboardStats.totalTrips,
          totalExpenses: allExpenses.length,
          totalSpent: dashboardStats.totalSpent,
          categories: categoryTotals,
          avgPerTrip: dashboardStats.averageSpent,
        },

        trips:
          formattedTrips,

        query: message,

        queryType:
          QueryValidator.getQueryType(
            message
          ),
      };

      // =================================================
      // Check whether question is project-related
      // =================================================

      if (
        !QueryValidator.isProjectRelated(
          message
        )
      ) {
        return NextResponse.json({
          response:
            ResponseGenerator.generateUnrelatedResponse(),

          quickReplies:
            ResponseGenerator.generateQuickReplies(
              message
            ),

          restricted: true,
        });
      }

      // =================================================
      // Select AI context
      // =================================================

      const contextType =
        getContextForQuery(
          message,
          context
        );

      const selectedContext =
        PROMPT_CONTEXTS[
        contextType
        ] ||
        PROMPT_CONTEXTS.DEFAULT;

      // =================================================
      // Examples
      // =================================================

      const examplesText =
        selectedContext.examples
          .map(
            (example) =>
              `User: ${example.user}\nAssistant: ${example.assistant}`
          )
          .join("\n\n");

      // =================================================
      // Groq
      // =================================================

      const completion =
        await groq.chat.completions.create(
          {
            messages: [
              {
                role: "system",

                content:
                  selectedContext.systemPrompt,
              },

              {
                role: "system",

                content: `
  Here is the user's REAL Settlement Tracker data.

  ONLY use this data when answering questions about
  the user's trips, expenses, spending, balances,
  members, or settlements.

  Do not invent numbers.

  DATA:
  ${JSON.stringify(
                  context,
                  null,
                  2
                )}
                `,
              },

              {
                role: "system",

                content: `
  Here are example responses for reference:

  ${examplesText}
                `,
              },

              {
                role: "user",

                content: message,
              },
            ],

            model:
              "llama-3.3-70b-versatile",

            temperature: 0.7,

            max_tokens: 500,
          }
        );

      const response =
        completion.choices[0]
          ?.message?.content ||
        "I couldn't generate a response. Please try again.";

      return NextResponse.json({
        response,

        quickReplies:
          ResponseGenerator.generateQuickReplies(
            message
          ),

        context: contextType,
      });
    } catch (error) {
      console.error(
        "Chat API Error:",
        error
      );

      return NextResponse.json(
        {
          response:
            "I'm having trouble connecting. Please try again in a moment.",

          quickReplies: [
            "How much have I spent?",
            "Show my trips",
            "Budget status",
          ],

          fallback: true,
        },
        {
          status: 500,
        }
      );
    }
  }