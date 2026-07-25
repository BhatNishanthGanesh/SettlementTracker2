// hooks/useTripCreation.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { TripFormData, Member } from '@/app/(dashboard)/dashboard/create-trip/types/trip';

interface UseTripCreationProps {
  formData: TripFormData;
  members: Member[];
  imageUrl: string | null;
  isDateValid: (value: string) => boolean;
  isEndDateValid: () => boolean;
}

export const useTripCreation = ({
  formData,
  members,
  imageUrl: initialImageUrl,
  isDateValid,
  isEndDateValid
}: UseTripCreationProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);
  // Store the image URL in state
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);

  const getValidationErrors = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Trip Name is required' });
    }

    if (!formData.startDate) {
      errors.push({ field: 'startDate', message: 'Start Date is required' });
    } else if (!isDateValid(formData.startDate)) {
      errors.push({ field: 'startDate', message: 'Invalid Start Date format' });
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      errors.push({ field: 'budget', message: 'Valid Budget is required' });
    }

    if (formData.endDate && !isDateValid(formData.endDate)) {
      errors.push({ field: 'endDate', message: 'Invalid End Date format' });
    }

    if (formData.endDate && !isEndDateValid()) {
      errors.push({ field: 'endDate', message: 'End Date must be after Start Date' });
    }

    return errors;
  };

  const sendInvitations = async (tripId: string, link: string, tripName: string) => {
    const membersWithEmail = members.filter(m => m.email);

    if (membersWithEmail.length === 0) return;

    try {
      const inviteResponse = await fetch('/api/trips/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          tripName,
          members: membersWithEmail,
          invitedBy: session?.user?.name || 'Trip Organizer',
          shareableLink: link
        }),
      });

      if (!inviteResponse.ok) {
        console.warn('Failed to send some invitation emails');
      } else {
        const inviteData = await inviteResponse.json();
        toast.success(`Invitations sent to ${inviteData.sentCount || membersWithEmail.length} members!`);
      }
    } catch (emailError) {
      console.error('Error sending invitations:', emailError);
      toast.warning('Trip created but some invitations may not have been sent');
    }
  };

  const createTrip = async (imageUrlOverride?: string | null) => {
    if (isSubmitting) return;

    const errors = getValidationErrors();

    if (errors.length > 0) {
      toast.error(
        `Please fix the following errors: ${errors.map(e => e.message).join(', ')}`,
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the override if provided, otherwise use the state
      const finalImageUrl = imageUrlOverride !== undefined ? imageUrlOverride : imageUrl;

      const validMembers = [
        {
          name: session?.user?.name ?? "Anonymous",
          email: session?.user?.email,
          isCreator: true,
        },
        ...members
          .filter(m => m.name.trim() || m.email.trim())
          .map(m => ({
            name: m.name.trim() || m.email.trim() || "Anonymous",
            email: m.email.trim() || undefined,
            isCreator: false,
          })),
      ];

      const requestBody = {
        name: formData.name,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        budget: parseFloat(formData.budget) || 0,
        description: formData.description,
        members: validMembers,
        image: finalImageUrl,
        createdBy: session?.user?.name || session?.user?.email || 'anonymous'
      };

      console.log('📤 Sending request:', requestBody);

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trip');
      }

      const tripId = data.data.id;

      await sendInvitations(
        tripId,
        data.data.shareableLink,
        formData.name
      );

      setShareableLink(data.data.shareableLink);
      setIsLinkGenerated(true);

      router.push(`/dashboard/group/${tripId}`);

    } catch (error) {
      console.error('❌ Error creating trip:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create trip. Please try again.");
      setIsSubmitting(false);
    }
  };

  const generateShareableLink = () => {
    const previewLink = `${window.location.origin}/join/trip/preview-${Date.now()}`;
    setShareableLink(previewLink);
    setIsLinkGenerated(true);
    toast.info("Link generated for preview. Trip will be created when you click 'Create Trip'.");
  };

  return {
    isSubmitting,
    shareableLink,
    isLinkGenerated,
    createTrip,
    generateShareableLink,
    getValidationErrors,
    setImageUrl
  };
};