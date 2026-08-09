import {
  TripFormData,
  TripValidationErrors,
  Member,
} from "@/types/trip.types";


export const validateStep1 = ({
  formData,
  isDateValid,
  isEndDateValid,
}: {
  formData: TripFormData;
  isDateValid: (value: string) => boolean;
  isEndDateValid: (
    startDate: string,
    endDate: string
  ) => boolean;
}): TripValidationErrors[] => {
  const errors: TripValidationErrors[] = [];

  if (!formData.name.trim()) {
    errors.push({
      field: "name",
      message: "Trip Name is required",
    });
  }

  if (!formData.destination.trim()) {
    errors.push({
      field: "destination",
      message: "Destination is required",
    });
  }

  if (!formData.startDate) {
    errors.push({
      field: "startDate",
      message: "Start Date is required",
    });
  } else if (!isDateValid(formData.startDate)) {
    errors.push({
      field: "startDate",
      message: "Invalid Start Date",
    });
  }

  if (!formData.endDate) {
    errors.push({
      field: "endDate",
      message: "End Date is required",
    });
  } else if (!isDateValid(formData.endDate)) {
    errors.push({
      field: "endDate",
      message: "Invalid End Date",
    });
  }

  if (
    formData.startDate &&
    formData.endDate &&
    isDateValid(formData.startDate) &&
    isDateValid(formData.endDate) &&
    !isEndDateValid(
      formData.startDate,
      formData.endDate
    )
  ) {
    errors.push({
      field: "endDate",
      message:
        "End Date must be after Start Date",
    });
  }

  return errors;
};

export const validateStep2 = (
  formData: TripFormData,
  members: Member[]
): TripValidationErrors[] => {
  const errors: TripValidationErrors[] = [];

  // Budget
  if (!formData.budget) {
    errors.push({
      field: "budget",
      message: "Budget is required",
    });
  } else {
    const budgetNum = parseFloat(formData.budget);

    if (
      isNaN(budgetNum) ||
      budgetNum <= 0
    ) {
      errors.push({
        field: "budget",
        message:
          "Budget must be a valid number greater than 0",
      });
    }
  }

  // Members
  const hasInvalidMembers = members.some(
    (member) => {
      const hasName =
        member.name?.trim() !== "";

      const hasEmail =
        member.email?.trim() !== "";

      return hasName !== hasEmail;
    }
  );

  if (hasInvalidMembers) {
    errors.push({
      field: "members",
      message:
        "Every invited member must have both a name and an email, or leave both fields empty",
    });
  }

  return errors;
};

export const validateTrip = ({
  formData,
  members = [],
  isDateValid,
  isEndDateValid,
}: {
  formData: TripFormData;
  members?: Member[];
  isDateValid: (value: string) => boolean;
  isEndDateValid: (
    startDate: string,
    endDate: string
  ) => boolean;
}): TripValidationErrors[] => {
  return [
    ...validateStep1({
      formData,
      isDateValid,
      isEndDateValid,
    }),

    ...validateStep2(
      formData,
      members
    ),
  ];
};