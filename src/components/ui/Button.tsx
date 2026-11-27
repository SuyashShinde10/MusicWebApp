import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#f97316] hover:bg-[#ea580c] text-white border border-orange-500/30 shadow-sm',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#181b22] dark:hover:bg-[#20242e] dark:text-gray-200 dark:border-white/10',
  ghost:
    'bg-transparent hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 dark:hover:bg-white/[0.07] dark:text-gray-300 dark:hover:text-white border border-transparent',
  danger:
    'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 border border-rose-500/25 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-300 dark:hover:text-rose-200 dark:border-rose-500/30',
  outline:
    'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-orange-500/50 dark:bg-[#15171c] dark:hover:bg-[#1c1f26] dark:text-gray-200 dark:border-white/10 dark:hover:border-orange-500/40',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
  icon: 'w-9 h-9 rounded-full p-0 justify-center',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
