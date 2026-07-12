// components/trips/TripNavigation.tsx
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface TripNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isUploading: boolean;
  isStep1Valid: () => boolean;
  isStep2Valid: () => boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const TripNavigation: React.FC<TripNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  isUploading,
  isStep1Valid,
  isStep2Valid,
  onBack,
  onNext,
  onSubmit
}) => {
  const isStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    return true;
  };

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1}
        className="h-10 px-6 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        Back
      </Button>
      <div className="flex gap-3">
        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={onNext}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isUploading}
            className="h-10 px-8 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70"
          >
            {isSubmitting || isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isUploading ? 'Uploading...' : 'Creating...'}
              </>
            ) : (
              'Create Trip'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};