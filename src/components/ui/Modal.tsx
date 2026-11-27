import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { prefersReducedMotion } from '../../utils/gsapAnimations';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  maxWidthClass?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidthClass = 'max-w-lg',
  children,
  footer,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
      }
      if (dialogRef.current) {
        gsap.fromTo(
          dialogRef.current,
          { opacity: 0, y: 16, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.28,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );
      }
    });
    return () => ctx.revert();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={`w-full ${maxWidthClass} bg-white border border-slate-200 text-slate-900 dark:bg-[#141821] dark:border-white/10 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 id="modal-title" className="text-base sm:text-lg font-bold truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition active:scale-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 overflow-y-auto no-scrollbar flex-1 min-h-0">{children}</div>

        {footer && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
