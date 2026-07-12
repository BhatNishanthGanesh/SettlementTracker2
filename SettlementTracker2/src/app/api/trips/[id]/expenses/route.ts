// app/api/trips/[id]/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;
    const body = await request.json();
    const { title, description, amount, paidBy, category, splitBetween } = body;

    if (!title || !amount || !paidBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, amount, paidBy' },
        { status: 400 }
      );
    }

    // Check if trip exists and user is a member
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const isMember = trip.members.some(m => m.email === session?.user?.email);
    if (!isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create expense with splitBetween stored in metadata
    const expense = await prisma.expense.create({
      data: {
        tripId,
        title,
        description: description || null,
        amount: parseFloat(amount),
        paidBy,
        category: category || null,
        metadata: splitBetween ? JSON.stringify({ splitBetween }) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse metadata for each expense
    const formattedExpenses = expenses.map(exp => ({
      ...exp,
      splitBetween: exp.metadata ? JSON.parse(exp.metadata).splitBetween : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedExpenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;
    const url = new URL(request.url);
    const expenseId = url.searchParams.get('expenseId');

    if (!expenseId) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
        createdBy: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get the expense
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions
    const userMember = trip.members.find(m => m.email === session?.user?.email);
    const isAdmin = userMember?.isAdmin || false;
    const isCreator = trip.createdBy.email === session.user.email;
    const isOwnExpense = expense.paidBy === userMember?.id;

    // Allow deletion if: user is admin/creator OR user owns the expense
    if (!isAdmin && !isCreator && !isOwnExpense) {
      return NextResponse.json(
        { error: 'You can only delete your own expenses. Admins can delete any expense.' },
        { status: 403 }
      );
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}