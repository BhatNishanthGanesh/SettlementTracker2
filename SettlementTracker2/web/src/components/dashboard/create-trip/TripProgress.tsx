// components/trips/TripProgress.tsx
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { TripStep } from '@/types/trip.types';

interface TripProgressProps {
  steps: TripStep[];
  currentStep: number;
}

export const TripProgress: React.FC<TripProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">
        Progress
      </h3>
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const isActive = currentStep === idx + 1;
          const isCompleted = currentStep > idx + 1;
          const isNext = currentStep === idx + 2;
          
          return (
            <div 
              key={idx} 
              className={cn(
                "relative pl-8 transition-all duration-300",
                isActive && "transform scale-105",
                isNext && "opacity-70"
              )}
              style={{
                transform: isActive ? 'translateX(4px)' : 'none',
                transitionDelay: `${idx * 50}ms`
              }}
            >
              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-2 top-7 w-0.5 h-12 transition-colors duration-500",
                    isCompleted ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              )}
              
              <div className="absolute left-0 top-0.5">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isActive && "border-blue-600 bg-blue-600 scale-110 shadow-lg shadow-blue-500/30",
                  isCompleted && "border-emerald-500 bg-emerald-500",
                  !isActive && !isCompleted && "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                )}>
                  {isCompleted ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : isActive ? (
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <step.icon className={cn(
                    "h-4 w-4",
                    isActive && `text-${step.color}-600 dark:text-${step.color}-400`,
                    isCompleted && "text-emerald-500",
                    !isActive && !isCompleted && "text-gray-400"
                  )} />
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? `text-${step.color}-600 dark:text-${step.color}-400` : 
                    isCompleted ? "text-emerald-600 dark:text-emerald-400" :
                    "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-xs transition-colors",
                  isActive ? "text-gray-700 dark:text-gray-300" :
                  isCompleted ? "text-gray-500 dark:text-gray-400" :
                  "text-gray-400 dark:text-gray-500"
                )}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.round((currentStep - 1) / 2 * 100)}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((currentStep - 1) / 2 * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};