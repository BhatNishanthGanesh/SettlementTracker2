// types/trip.ts
export interface TripFormData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
}

export interface Member {
  name: string;
  email: string;
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