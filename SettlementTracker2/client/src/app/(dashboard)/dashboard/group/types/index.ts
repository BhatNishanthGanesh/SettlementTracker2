// types/index.ts
// types/index.ts
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
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
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

export interface Member {
  id: string;
  name: string;
  email: string | null;
  image?: string | null;
  joined: boolean;
  isAdmin: boolean;
  status?: 'online' | 'offline' | 'away';
  paid?: number;
  owes?: number;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  paidBy: string;
  category: string | null;
  createdAt: string;
  metadata?: string | null;
  splitBetween?: string[] | null;
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
  editedAt?:string;
   attachments?: Array<{
      id: string;
      url: string;
      type: string;
      name: string;
      size?: number;
    }>;
  deleted?:boolean;
    metadata?: {
    title?: string;
    amount?: number;
    paidBy?: string;
    paidById?: string;
    splitBetween?: string[];
    splitBetweenIds?: string[];
    perPersonAmount?: number;
    category?: string;
    description?: string;
    timestamp?: string;
    type?: 'expense_deleted';
  } | null;
}
export interface Attachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size?: number;
}

export interface TripFormData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
}

export interface TripState {
  trip: Trip | null;
  loading: boolean;
  error: string | null;
}