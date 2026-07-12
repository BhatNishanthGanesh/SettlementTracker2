// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db'; 
import Groq from 'groq-sdk';
import { PROMPT_CONTEXTS, QueryValidator, ResponseGenerator } from '@/app/(dashboard)/prompts';
import { ResponseContext } from '@/app/(dashboard)/prompts/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Determine which context to use based on the query
function getContextForQuery(message: string, context: ResponseContext): string {
  const lowerMsg = message.toLowerCase();
  
  // Check for technical questions
  if (lowerMsg.includes('api') || lowerMsg.includes('endpoint') || lowerMsg.includes('database') || 
      lowerMsg.includes('schema') || lowerMsg.includes('model') || lowerMsg.includes('integration')) {
    return 'TECHNICAL';
  }
  
  // Check for onboarding/help questions
  if (lowerMsg.includes('new') || lowerMsg.includes('start') || lowerMsg.includes('create') || 
      lowerMsg.includes('first time') || lowerMsg.includes('begin') || lowerMsg.includes('tutorial')) {
    return 'ONBOARDING';
  }
  
  // Check for travel planning
  if (lowerMsg.includes('plan') || lowerMsg.includes('destination') || lowerMsg.includes('visit') || 
      lowerMsg.includes('travel to') || lowerMsg.includes('go to') || lowerMsg.includes('vacation')) {
    return 'TRAVEL';
  }
  
  // Check for analytics
  if (lowerMsg.includes('analytics') || lowerMsg.includes('trend') || lowerMsg.includes('pattern') || 
      lowerMsg.includes('insight') || lowerMsg.includes('analysis') || lowerMsg.includes('data')) {
    return 'ANALYTICS';
  }
  
  // Check for advanced financial advice
  if (lowerMsg.includes('invest') || lowerMsg.includes('optimize') || lowerMsg.includes('strategy') || 
      lowerMsg.includes('maximize') || lowerMsg.includes('professional') || lowerMsg.includes('expert')) {
    return 'EXPERT';
  }
  
  // Check for casual conversation
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || 
      lowerMsg.includes('thanks') || lowerMsg.includes('thank you') || lowerMsg.includes('wow')) {
    return 'FRIENDLY';
  }
  
  // Check for concise requests
  if (lowerMsg.includes('brief') || lowerMsg.includes('quick') || lowerMsg.includes('short') || 
      lowerMsg.includes('just') || lowerMsg.includes('simply') || lowerMsg.length < 30) {
    return 'CONCISE';
  }
  
  // Default to default context
  return 'DEFAULT';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // ✅ DIRECT DATABASE QUERY - No API call needed!
    console.log(`🔍 Fetching trips for user: ${session.user.email}`);
    
    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: {
            email: session.user.email,
          },
        },
      },
      include: {
        members: true,
        expenses: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
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
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${trips.length} trips for user: ${session.user.email}`);

    // ✅ Format trips (similar to what the API does)
    const formattedTrips = trips.map(trip => ({
      ...trip,
      lastMessage: trip.messages[0]?.text || null,
      lastMessageAt: trip.messages[0]?.createdAt || trip.updatedAt,
      lastMessageSender: trip.messages[0]?.sender?.name || null,
    }));
    
    // Build context
    const allExpenses = formattedTrips.flatMap((trip: any) => trip.expenses || []);
    const totalSpent = allExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    
    const categories: Record<string, number> = {};
    allExpenses.forEach((expense: any) => {
      const category = expense.category || 'other';
      categories[category] = (categories[category] || 0) + expense.amount;
    });

    const context: ResponseContext = {
      user: {
        name: session.user.name || 'User',
        email: session.user.email,
      },
      summary: {
        totalTrips: formattedTrips.length,
        totalExpenses: allExpenses.length,
        totalSpent: totalSpent,
        categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
        avgPerTrip: formattedTrips.length > 0 ? totalSpent / formattedTrips.length : 0,
      },
      trips: formattedTrips.map((trip: any) => ({
        name: trip.name,
        destination: trip.destination || 'Unknown',
        budget: trip.budget || 0,
        spent: trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0,
        members: trip.members?.map((m: any) => m.name) || [],
        expenses: trip.expenses?.length || 0,
      })),
      query: message,
      queryType: QueryValidator.getQueryType(message),
    };

    // Validate if question is project-related
    if (!QueryValidator.isProjectRelated(message)) {
      return NextResponse.json({
        response: ResponseGenerator.generateUnrelatedResponse(),
        quickReplies: ResponseGenerator.generateQuickReplies(message),
        restricted: true,
      });
    }

    // Determine which context to use
    const contextType = getContextForQuery(message, context);
    const selectedContext = PROMPT_CONTEXTS[contextType] || PROMPT_CONTEXTS.DEFAULT;
    
    // Add context examples for better responses
    const examplesText = selectedContext.examples
      .map(e => `User: ${e.user}\nAssistant: ${e.assistant}`)
      .join('\n\n');

    // Generate AI response using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: selectedContext.systemPrompt,
        },
        {
          role: "system",
          content: `Here is the user's REAL data. ONLY use this to answer questions:\n${JSON.stringify(context, null, 2)}`,
        },
        {
          role: "system",
          content: `Here are some example responses for reference:\n${examplesText}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({
      response,
      quickReplies: ResponseGenerator.generateQuickReplies(message),
      context: contextType, // Return which context was used (for debugging)
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      response: "I'm having trouble connecting. Please try again in a moment.",
      quickReplies: ['How much have I spent?', 'Show my trips', 'Budget status'],
      fallback: true,
    });
  }
}