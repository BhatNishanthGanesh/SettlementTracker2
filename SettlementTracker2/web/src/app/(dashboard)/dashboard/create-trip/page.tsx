"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useTripForm } from "@/hooks/useTripForm";
import { useTripImage } from "@/hooks/useImageUpload";

import { TripProgress } from "@/components/dashboard/create-trip/TripProgress";
import { TripDetailsStep } from "@/components/dashboard/create-trip/TripDetailsStep";
import { BudgetMembersStep } from "@/components/dashboard/create-trip/BudgetMembersStep";
import { ShareConfirmStep } from "@/components/dashboard/create-trip/ShareConfirmStep";
import { TripNavigation } from "@/components/dashboard/create-trip/TripNavigation";

import { steps } from "@/constants/trip.constant";

export default function CreateTrip() {
  const { data: session } = useSession();

  const [step, setStep] = useState(1);

  const {
    formData,
    members,
    dateErrors,
    isSubmitting,
    handleInputChange,
    handleMemberChange,
    addMember,
    removeMember,
    totalMembers,
    validateStep,
    createTrip,
  } = useTripForm();

  const {
    tripImage,
    imagePreview,
    isUploading,
    fileInputRef,
    handleImageUpload,
    removeImage,
    uploadImage,
    cropperOpen,
    cropImage,
    setCropperOpen,
    handleCropComplete,
  } = useTripImage();

  const handleNextStep = () => {
    const error = validateStep(step);

    if (error) {
      toast.error(error);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleCreateTrip = async () => {
    const imageUrl = tripImage
      ? await uploadImage()
      : null;

    await createTrip(imageUrl);
  };

  return (
    <div>
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1">
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
              cropperOpen={cropperOpen}
              cropImage={cropImage}
              onCropComplete={handleCropComplete}
              closeCropper={() =>
                setCropperOpen(false)
              }
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
              totalMembers={totalMembers}
            />
          )}

          {step === 3 && (
            <ShareConfirmStep
              formData={formData}
              members={members}
              imagePreview={imagePreview}
              totalMembers={totalMembers}
            />
          )}

          {/* Navigation */}
          <TripNavigation
            currentStep={step}
            totalSteps={steps.length}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            onBack={() =>
              setStep((prev) =>
                Math.max(1, prev - 1)
              )
            }
            onNext={handleNextStep}
            onSubmit={handleCreateTrip}
          />
        </div>

        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-8">
          <TripProgress
            steps={steps}
            currentStep={step}
          />
        </div>
      </div>
    </div>
  );
}