import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          
          return (
            <React.Fragment key={index}>
              {/* Step item */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border
                    ${
                      isCompleted
                        ? 'bg-brand-primary border-brand-primary text-white shadow-premium'
                        : isActive
                        ? 'bg-white border-brand-primary text-brand-primary ring-4 ring-teal-50 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300
                      ${isActive ? 'text-brand-primary' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
                    `}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-slate-100 relative rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-brand-primary transition-all duration-500 ease-in-out"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        
        {/* Simple Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
