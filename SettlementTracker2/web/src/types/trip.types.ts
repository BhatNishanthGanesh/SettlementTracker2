// types/trip.ts

import { Expense } from "./expense.types";
export interface TripFormData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
}

export interface Member {
  id?: string;
  userId?: string | null;
  name: string;
  email: string;
  image?: string | null;
  joined?: boolean;
  isAdmin?: boolean;
  status?: 'online' | 'offline' | 'away';
  paid?: number;
  owes?: number;
}

export interface DateErrors {
  startDate: string;
  endDate: string;
}

export interface TripStep {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface TripValidationErrors {
  field: string;
  message: string;
}

export interface CreateTripMember {
  name: string;
  email: string;
}

export interface CreateTripPayload {
  name: string;
  destination: string;
  startDate: string;
  endDate: string | null;
  budget: number;
  description: string;
  members: CreateTripMember[];
  image: string | null;
}

export interface SendInvitationsPayload {
  tripId: string;
  tripName: string;
  members: Member[];
}


export interface TripData {
  id: string;
  name: string;
  expense: string;
  spent: number;
  owedToMe: number;
  status: "settled" | "pending";
  balance: number;
  category: string;
  companions: string[];
  createdAt: string;
  image?: string;
  budget?: number;
  destination?: string;
}


export interface DashboardStats {
  totalSpent: number;
  averageSpent: number;
  totalTrips: number;
  settledCount: number;
  pendingCount: number;
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


export interface Trip {
  id: string;
  name: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number;
  description: string | null;
  image: string | null;
  shareableLink: string;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  expenses: Expense[];
  messages?: Message[];
  lastMessage?: string | null;
  lastMessageAt?: string;
  lastMessageSender?: string | null;
  _count?: {
    members: number;
    expenses: number;
  };
}

export interface TripMember {
  id: string;
  tripId?: string;
  userId?: string | null;

  name: string;
  email?: string;
  image?: string | null;

  joined: boolean;
  isAdmin: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderId?: string;
  senderImage?: string | null;
  text: string;
  timestamp: string;
  isOwn: boolean;

  type?: 'text' | 'expense' | 'system' | 'image';

  createdAt?: string;
  updatedAt?: string;

  edited?: boolean;
  editedAt?: string;

  attachments?: Attachment[];

  deleted?: boolean;

  metadata?: MessageMetadata | null;
}

export interface Attachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TripState {
  trip: Trip | null;
  loading: boolean;
  error: string | null;
}


export interface MessageMetadata {
  title?: string;
  amount?: number;
  paidBy?: string;
  paidById?: string;

  splitBetween?: string[];
  splitBetweenIds?: string[];
  splitBetweenNames?: string[];

  splits?: Record<string, number>;

  perPersonAmount?: number;

  category?: string;
  description?: string;
  timestamp?: string;

  type?: "expense_deleted";
}

export interface SendMessagePayload {
  text: string;
  attachments?: Attachment[];
  metadata?: MessageMetadata | null;
}

export interface EditMessagePayload {
  text: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadImageResponse {
  success: boolean;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  uploadedAt: string;
}

export interface MemberBalance {
  memberId: string;
  name: string;
  paid: number;
  owes: number;
  balance: number;
}

export interface TripStats {
  totalSpent: number;
  expenseCount: number;
  memberCount: number;
  owedToMe: number;
  currentUserBalance: number;
  memberBalances: MemberBalance[];
}

export interface MultipleTripStats {
  stats: TripStats[];
  totals: {
    totalSpent: number;
    totalTrips: number;
    settledCount: number;
    pendingCount: number;
    pendingBalance: number;
  };
  dashboardStats: DashboardStats;
}

