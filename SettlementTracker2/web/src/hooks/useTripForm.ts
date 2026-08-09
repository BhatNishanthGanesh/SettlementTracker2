"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  TripFormData,
  Member,
  CreateTripMember,
  DateErrors,
  TripValidationErrors,
} from "@/types/trip.types";

import {
  validateTrip,
  validateStep1,
  validateStep2,
} from "@/utils/tripValidation";

import {
  isDateValid,
  validateDate,
  isEndDateValid,
} from "@/utils/dateValidation";

import { buildTripPayload } from "@/utils/tripPayload";
import { tripCreationService } from "@/services/tripCreation.service";

const initialFormData: TripFormData = {
  name: "",
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
  description: "",
};

const initialMembers: Member[] = [
  {
    name: "",
    email: "",
  },
];

const initialDateErrors: DateErrors = {
  startDate: "",
  endDate: "",
};

export const useTripForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<TripFormData>(initialFormData);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [dateErrors, setDateErrors] = useState<DateErrors>(initialDateErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;

  const updatedFormData = {
    ...formData,
    [name]: value,
  };

  setFormData(updatedFormData);

  if (
    name === "startDate" ||
    name === "endDate"
  ) {
    const field =
      name as "startDate" | "endDate";

    const result = validateDate(
      value,
      field
    );

    let error =
      result.dateErrors?.[field] ?? "";

    // Check start/end relationship
    if (
      !error &&
      updatedFormData.startDate &&
      updatedFormData.endDate &&
      isDateValid(
        updatedFormData.startDate
      ) &&
      isDateValid(
        updatedFormData.endDate
      ) &&
      !isEndDateValid(
        updatedFormData.startDate,
        updatedFormData.endDate
      )
    ) {
      error =
        "End date must be after start date";
    }

    setDateErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }
};

  const handleMemberChange = (
    index: number,
    field: "name" | "email",
    value: string
  ) => {
    setMembers((prev) =>
      prev.map((member, i) =>
        i === index
          ? {
            ...member,
            [field]: value,
          }
          : member
      )
    );
  };

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        name: "",
        email: "",
      },
    ]);
  };

  const removeMember = (index: number) => {
    setMembers((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  const totalMembers = 1 + members.filter(
    (member) =>
      member.name.trim() ||
      member.email.trim()
  ).length;

  const validateStep = (
    step: number
  ): string | null => {
    let errors: TripValidationErrors[] = [];

    switch (step) {
      case 1:
        errors = validateStep1({
          formData,
          isDateValid,
          isEndDateValid,
        });
        break;

      case 2:
        errors = validateStep2(
          formData,
          members
        );
        break;

      case 3:
        errors = validateTrip({
          formData,
          members,
          isDateValid,
          isEndDateValid,
        });
        break;

      default:
        return null;
    }

    return errors.length > 0
      ? errors
        .map((error) => error.message)
        .join(", ")
      : null;
  };

  const isStepValid = (
    step: number
  ): boolean => {
    return validateStep(step) === null;
  };

  const createTrip = async (
    imageUrl: string | null
  ) => {
    if (isSubmitting) {
      return;
    }

    const errors = validateTrip({
      formData,
      members,
      isDateValid,
      isEndDateValid,
    });


    if (errors.length > 0) {
      toast.error(
        errors
          .map((error) => error.message)
          .join(", ")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildTripPayload(
        formData,
        members,
        imageUrl
      );

      const response = await tripCreationService.createTrip(payload);
      const trip = response.data.data;
      await tripCreationService.sendInvitations({
        tripId: trip.id,
        tripName: formData.name,
        members:
          members as CreateTripMember[],
      });

      toast.success("Trip created successfully!");

      router.push(`/dashboard/group/${trip.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create trip."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setMembers(initialMembers);
    setDateErrors(initialDateErrors);
    setIsSubmitting(false);
  };

  return {
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
    isStepValid,

    createTrip,
    resetForm,
  };
};