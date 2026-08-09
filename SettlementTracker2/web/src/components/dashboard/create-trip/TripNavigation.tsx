import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isUploading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function TripNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  isUploading,
  onBack,
  onNext,
  onSubmit,
}: TripNavigationProps) {
  const isLoading = isSubmitting || isUploading;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1}
        className="h-10 px-6"
      >
        Back
      </Button>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="h-10 px-8 min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading..." : "Creating..."}
            </>
          ) : (
            "Create Trip"
          )}
        </Button>
      )}
    </div>
  );
}