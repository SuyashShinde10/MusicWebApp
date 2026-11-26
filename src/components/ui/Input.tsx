import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  pill?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightElement, pill = false, className = '', id, ...rest }, ref) => {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full min-w-0">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            className={`w-full bg-surface-card text-sm text-gray-100 placeholder-gray-500 border transition focus:outline-none focus:ring-2 shadow-inner ${
              pill ? 'rounded-full' : 'rounded-xl'
            } ${leftIcon ? 'pl-10' : 'pl-3.5'} ${rightElement ? 'pr-12' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-rose-500/70 focus:ring-rose-500/40'
                : 'border-white/10 focus:border-brand-500/60 focus:ring-brand-500/40'
            } ${className}`}
            {...rest}
          />
          {rightElement && (
            <div className="absolute right-2.5 inset-y-0 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            role="alert"
            className="mt-1.5 text-xs font-medium text-rose-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
