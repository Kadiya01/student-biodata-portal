import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  size = 'sm',
}) => {
  const roundedValue = Math.min(100, Math.max(0, value));

  const colors = {
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-secondary',
    accent: 'bg-brand-accent',
    success: 'bg-emerald-500',
  };

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizes[size]}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colors[variant]}`}
        style={{ width: `${roundedValue}%` }}
      />
    </div>
  );
};
