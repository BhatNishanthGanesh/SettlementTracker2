import { Plane, DollarSign, Send } from 'lucide-react';
import {TripStep} from "@/types/trip.types";

export const TRIP_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "settled", label: "Settled" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
] as const;

export const steps: TripStep[] = [
    { 
      label: 'Trip Details', 
      description: 'Tell us about your adventure',
      icon: Plane,
      color: 'blue'
    },
    { 
      label: 'Budget & Members', 
      description: 'Set budget and invite friends',
      icon: DollarSign,
      color: 'emerald'
    },
    { 
      label: 'Share & Confirm', 
      description: 'Finalize and share your trip',
      icon: Send,
      color: 'purple'
    }
];