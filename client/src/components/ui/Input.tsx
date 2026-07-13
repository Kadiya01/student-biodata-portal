import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-errormessage={error ? errorId : undefined}
            aria-describedby={describedBy}
            className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-200 dark:disabled:border-slate-700 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-11' : ''}
              ${
                error
                  ? 'border-rose-500 text-rose-900 dark:text-rose-400 focus-visible:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-600 focus-visible:ring-brand-primary focus:border-brand-primary'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span id={errorId} role="alert" aria-live="polite" className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
