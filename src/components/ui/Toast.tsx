import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import type { ToastItem } from '../../types/music';
import { prefersReducedMotion } from '../../utils/gsapAnimations';

interface ToastProps {
  toast: ToastItem | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast || !cardRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: -12, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: 'back.out(1.7)',
        clearProps: 'transform,opacity',
      }
    );
  }, [toast]);

  if (!toast) return null;

  const iconMap = {
    success: <Check className="w-3.5 h-3.5 text-brand-400" />,
    info: <Info className="w-3.5 h-3.5 text-sky-400" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
  };

  const ringMap = {
    success: 'border-brand-500/35',
    info: 'border-sky-500/35',
    error: 'border-rose-500/35',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-sm z-[60] pointer-events-auto"
    >
      <div
        ref={cardRef}
        className={`bg-[#141821]/95 backdrop-blur-xl border ${ringMap[toast.variant]} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
            {iconMap[toast.variant]}
          </div>
          <span className="text-xs font-semibold truncate">{toast.message}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-gray-400 hover:text-white p-1 rounded-lg transition active:scale-90 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
