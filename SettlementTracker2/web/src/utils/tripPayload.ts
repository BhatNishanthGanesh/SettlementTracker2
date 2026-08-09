import {
  CreateTripPayload,
  CreateTripMember,
  TripFormData,
} from "@/types/trip.types";

export function buildTripPayload(
  formData: TripFormData,
  members: CreateTripMember[],
  imageUrl: string | null
): CreateTripPayload {
  
  return {
    tripName: formData.name,
    destination: formData.destination,
    startDate: formData.startDate,
    endDate: formData.endDate || null,
    budget: parseFloat(formData.budget),
    description: formData.description,
    members,
    image: imageUrl,
  };
}