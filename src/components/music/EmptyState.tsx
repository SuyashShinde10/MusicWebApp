import type { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="w-full rounded-2xl bg-[#12151b] border border-white/[0.06] px-5 py-5 sm:px-6 sm:py-6 text-center flex flex-col items-center justify-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
        {icon}
      </div>
      <div className="max-w-sm space-y-0.5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-0.5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
