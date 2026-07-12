// app/create/page.tsx
'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Plane, DollarSign, Send } from 'lucide-react';
import { TripStep } from '@/app/(dashboard)/dashboard/create-trip/types/trip';
import { useTripForm } from '@/hooks/useTripForm';
import { useTripImage } from '@/hooks/useTripImage';
import { useTripCreation } from '@/hooks/useTripCreation';
import { TripProgress } from '@/components/dashboard/create-trip/TripProgress';
import { TripDetailsStep } from '@/components/dashboard/create-trip/TripDetailsStep';
import { BudgetMembersStep } from '@/components/dashboard/create-trip/BudgetMembersStep';
import { ShareConfirmStep } from '@/components/dashboard/create-trip/ShareConfirmStep';
import { TripNavigation } from '@/components/dashboard/create-trip/TripNavigation';

export default function CreateTrip() {
  const { data: session } = useSession();
  const [step, setStep] = React.useState(1);
  const [isCopied, setIsCopied] = React.useState(false);

  const {
    formData,
    members,
    dateErrors,
    handleInputChange,
    handleMemberChange,
    addMember,
    removeMember,
    getTotalMembers,
    isDateValid,
    isEndDateValid
  } = useTripForm();

  const {
    tripImage,
    imagePreview,
    isUploading,
    fileInputRef,
    handleImageUpload,
    removeImage,
    uploadImage
  } = useTripImage();


  const {
    isSubmitting,
    shareableLink,
    isLinkGenerated,
    createTrip,
    generateShareableLink,
    setImageUrl
  } = useTripCreation({
    formData,
    members,
     imageUrl: null,
    isDateValid,
    isEndDateValid
  });

  const steps: TripStep[] = [
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

  const hasInvalidMembers=()=>{
    return members.some(member =>{
      const hasName = member.name.trim() !== ''; 
      const hasEmail = member.email.trim() !== '';
      return hasName !== hasEmail;
    })
  }

  const isStep1Valid = () => {
    const isValid = formData.name.trim() !== '' && formData.startDate !== '';
    if (formData.startDate && !isDateValid(formData.startDate)) {
      return false;
    }
    return isValid;
  };

  const isStep2Valid = () => {
    const budgetNum = parseFloat(formData.budget);
    return formData.budget !== '' && !isNaN(budgetNum) && budgetNum > 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid()) {
      toast.error("Please fill in all required fields: Trip Name and Start Date");
      return;
    }
    if (step === 2 && !isStep2Valid()) {
      toast.error("Please set a valid budget amount greater than 0");
      return;
    }
    if (step === 2 && !isEndDateValid()) {
      toast.error("End date must be after start date");
      return;
    }
     if (step === 2 && hasInvalidMembers()) {
    toast.error(
      "Every invited member must have both a name and an email, or leave both fields empty."
    );
    return;
  }
    setStep(step + 1);
  };

  const handleCreateTrip = async () => {
    let imageUrl = null;
     if (tripImage) {
      console.log('📤 Uploading image before creating trip...');
      imageUrl = await uploadImage();
      console.log('📸 Image uploaded, URL:', imageUrl);

      if (imageUrl) {
        setImageUrl(imageUrl);
      }
    }
    console.log('📝 Creating trip with image URL:', imageUrl);
    await createTrip(imageUrl);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto flex gap-8 items-start">
        <div className="flex-1 min-w-0 shadow-lg rounded-xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-800 shadow-sm p-6 md:p-8">
            {/* Step Content */}
            {step === 1 && (
              <TripDetailsStep
                formData={formData}
                dateErrors={dateErrors}
                imagePreview={imagePreview}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                onInputChange={handleInputChange}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                isEndDateValid={isEndDateValid}
              />
            )}

            {step === 2 && (
              <BudgetMembersStep
                budget={formData.budget}
                members={members}
                sessionName={session?.user?.name}
                sessionEmail={session?.user?.email}
                onBudgetChange={handleInputChange}
                onMemberChange={handleMemberChange}
                onAddMember={addMember}
                onRemoveMember={removeMember}
                getTotalMembers={getTotalMembers}
              />
            )}

            {step === 3 && (
              <ShareConfirmStep
                formData={formData}
                members={members}
                imagePreview={imagePreview}
                shareableLink={shareableLink}
                isLinkGenerated={isLinkGenerated}
                isSubmitting={isSubmitting}
                isUploading={isUploading}
                getTotalMembers={getTotalMembers}
                onGenerateLink={generateShareableLink}
                onCopyLink={copyLink}
                isCopied={isCopied}
              />
            )}

            {/* Navigation */}
            <TripNavigation
              currentStep={step}
              totalSteps={steps.length}
              isSubmitting={isSubmitting}
              isUploading={isUploading}
              isStep1Valid={isStep1Valid}
              isStep2Valid={isStep2Valid}
              onBack={() => setStep(step - 1)}
              onNext={handleNextStep}
              onSubmit={handleCreateTrip}
            />
          </div>
        </div>

        {/* Progress Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-8">
          <TripProgress steps={steps} currentStep={step} />
        </div>
      </div>
    </div>
  );
}