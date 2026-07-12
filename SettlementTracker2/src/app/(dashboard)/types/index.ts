// app/(dashboard)/types/index.ts

export interface TripData {
  id: string;
  name: string;
  expense: string;
  spent: number;
  recieved: number;
  status: 'settled' | 'pending' | 'overdue';
  category: string;
  companions: string[];
  createdAt: string;
  image?: string;
  budget?: number;
  destination?: string;
}

export interface EditFormData {
  name: string;
  expense: string;
  spent: string;
  recieved: string;
  category: string;
  companionInput: string;
  companions: string[];
}

export interface DashboardStats {
  totalSpent: number;
  totalReceived: number;
  averageSpent: number;
  totalTrips: number;
  settledCount: number;
  pendingCount: number;
  overdueCount: number;
  pendingBalance: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface GroupChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  amount: number;
  paidBy: string;
  category?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  destination?: string;
  description?: string;
  budget: number;
  image?: string;
  startDate: string;
  endDate: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members: TripMember[];
  expenses: Expense[];
  messages: Message[];
  _count?: {
    members: number;
    expenses: number;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSender?: string;
}

export interface TripMember {
  id: string;
  tripId: string;
  name: string;
  email?: string;
  joined: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tripId: string;
  senderId: string;
  text: string;
  type: string;
  metadata?: string;
  edited: boolean;
  editedAt?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    name: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}