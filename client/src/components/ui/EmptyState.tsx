import React from 'react';
import { Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <Search className="w-8 h-8 text-slate-400" />,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-slate-100 rounded-2xl bg-white/60 backdrop-blur-sm min-h-[260px]">
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4 text-slate-500">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
