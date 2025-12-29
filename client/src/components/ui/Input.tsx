'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-small font-medium text-heading mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-sm border text-body bg-white',
            'placeholder:text-slate-grey/60',
            'transition-all duration-fast ease-smooth',
            'focus:outline-none focus:ring-4 focus:ring-brand-cyan/12 focus:border-brand-blue',
            error
              ? 'border-danger focus:ring-danger/12 focus:border-danger'
              : 'border-slate-grey',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-offwhite',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-small text-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-small text-body">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
