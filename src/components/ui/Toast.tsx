import { Check, Info, AlertCircle, X } from 'lucide-react';
import type { ToastItem } from '../../types/music';

interface ToastProps {
  toast: ToastItem | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const iconMap = {
    success: <Check className="w-3.5 h-3.5 text-brand-400" />,
    info: <Info className="w-3.5 h-3.5 text-sky-400" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
  };

  const ringMap = {
    success: 'border-brand-500/40',
    info: 'border-sky-500/40',
    error: 'border-rose-500/40',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-sm z-[60] pointer-events-auto"
    >
      <div
        className={`bg-surface-card/95 backdrop-blur-xl border ${ringMap[toast.variant]} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            {iconMap[toast.variant]}
          </div>
          <span className="text-xs font-semibold truncate">{toast.message}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-gray-400 hover:text-white p-1 rounded-lg transition shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
