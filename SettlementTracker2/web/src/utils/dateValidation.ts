import { DateErrors } from "@/types/trip.types";

interface DateValidationResult {
  isValid: boolean;
  error: string;
  dateErrors?: Partial<DateErrors>;
}

export const validateDate = (
  value: string,
  field: "startDate" | "endDate"
): DateValidationResult => {
  if (!value) {
    return {
      isValid: true,
      error: "",
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value)) {
    const message =
      "Invalid date format. Use YYYY-MM-DD";

    return {
      isValid: false,
      error: message,
      dateErrors: {
        [field]: message,
      },
    };
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    const message = "Invalid date";

    return {
      isValid: false,
      error: message,
      dateErrors: {
        [field]: message,
      },
    };
  }

  const currentYear = new Date().getFullYear();

  if (
    year < currentYear - 100 ||
    year > currentYear + 100
  ) {
    const message = `Year should be between ${
      currentYear - 100
    } and ${currentYear + 100}`;

    return {
      isValid: false,
      error: message,
      dateErrors: {
        [field]: message,
      },
    };
  }

  return {
    isValid: true,
    error: "",
  };
};

export const isDateValid = (
  value: string
): boolean => {
  if (!value) return true;

  return validateDate(value, "startDate").isValid;
};

export const isEndDateValid = (
  startDate: string,
  endDate: string
): boolean => {
  if (!startDate || !endDate) {
    return true;
  }

  if (
    !isDateValid(startDate) ||
    !isDateValid(endDate)
  ) {
    return false;
  }

  return endDate >= startDate;
};

export const getDateErrors = (
  startDate: string,
  endDate: string
): DateErrors => {
  const errors: DateErrors = {
    startDate: "",
    endDate: "",
  };

  const startResult = validateDate(
    startDate,
    "startDate"
  );

  const endResult = validateDate(
    endDate,
    "endDate"
  );

  errors.startDate =
    startResult.dateErrors?.startDate ?? "";

  errors.endDate =
    endResult.dateErrors?.endDate ?? "";
  if (
    !errors.startDate &&
    !errors.endDate &&
    startDate &&
    endDate &&
    !isEndDateValid(startDate, endDate)
  ) {
    errors.endDate =
      "End date must be after start date";
  }

  return errors;
};