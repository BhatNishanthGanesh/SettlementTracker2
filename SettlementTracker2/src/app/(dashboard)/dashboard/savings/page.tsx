'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  name: string;
  expense: string;
  spent: number;
  recieved: number;
  createdAt: string;
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalReceived: 0,
    totalTrips: 0,
    pendingSettlements: 0,
    budgetUsed: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/posts", { cache: 'no-store' });
        const data = await res.json();
        setExpenses(data);
        
        const totalSpent = data.reduce((acc: number, item: any) => acc + Number(item.spent), 0);
        const totalReceived = data.reduce((acc: number, item: any) => acc + Number(item.recieved), 0);
        const uniqueTrips = new Set(data.map((item: any) => item.expense)).size;
        const pending = data.filter((item: any) => item.spent > item.recieved).length;

        setStats({
          totalSpent,
          totalReceived,
          totalTrips: uniqueTrips,
          pendingSettlements: pending,
          budgetUsed: Math.min((totalSpent / 50000) * 100, 100)
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Create a trip',
      description: 'Name your trip, pick dates. Get a shareable link instantly — no app download for members.',
      icon: '🚀'
    },
    {
      number: '02',
      title: 'Set your budget',
      description: 'Enter your estimated trip budget. Our AI will track your spending and alert you if you\'re going over.',
      icon: '💰'
    },
    {
      number: '03',
      title: 'Log expenses as you go',
      description: 'Add expenses on the fly. Pick who paid, split equally or by custom amounts per person.',
      icon: '📝'
    },
    {
      number: '04',
      title: 'Get AI insights',
      description: 'Our AI analyzes your spending patterns and gives you smart recommendations to stay on track.',
      icon: '🤖'
    },
    {
      number: '05',
      title: 'Pay and mark settled',
      description: 'Pay via any UPI app. Come back and mark it settled. Everyone sees the updated balance.',
      icon: '✅'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome to TripSplit! 🎉</h1>
              <p className="text-primary-foreground/80 mt-1">
                Track expenses, split bills, and settle up with friends effortlessly
              </p>
            </div>
            <Button 
              asChild
              size="lg"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
            >
              <Link href="/dashboard/create-trip">
                <Plus className="mr-2 h-4 w-4" />
                New Trip
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Across all trips</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold">{Math.round(stats.budgetUsed)}%</p>
                <Progress value={stats.budgetUsed} className="h-2 mt-2" />
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Wallet className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trips</p>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
                <p className="text-xs text-muted-foreground mt-1">Active trips</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Settlements</p>
                <p className="text-2xl font-bold">{stats.pendingSettlements}</p>
                <p className="text-xs text-muted-foreground mt-1">Need to settle</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Steps Section */}
      <Card>
        <CardHeader>
          <CardTitle>How TripSplit Works</CardTitle>
          <CardDescription>Follow these simple steps to manage your trip expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">Step {step.number}</span>
                    </div>
                    <h3 className="font-semibold mt-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest expenses from your trips</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/expenses">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {item.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.expense} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{item.spent}</p>
                  <Badge variant={item.spent > item.recieved ? "default" : "secondary"}>
                    {item.spent > item.recieved ? 'Pending' : 'Settled'}
                  </Badge>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expenses yet. Start tracking your trip expenses!</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/create-trip">Create Your First Trip</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}