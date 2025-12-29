'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-medium ease-smooth',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]'
    );

    const variants = {
      primary: cn(
        'bg-brand-gradient shadow-brand',
        'hover:shadow-lg hover:brightness-110',
        'active:translate-y-[1px]',
        '!text-[#FFFFFF]'
      ),
      secondary: cn(
        'bg-gradient-to-b from-white to-offwhite border border-slate-grey',
        'hover:border-brand-blue hover:shadow-elevation-1',
        '!text-heading'
      ),
      ghost: cn(
        'bg-transparent',
        'hover:bg-brand-blue/10',
        '!text-brand-blue'
      ),
      danger: cn(
        'bg-danger',
        'hover:bg-danger/90',
        '!text-[#FFFFFF]'
      ),
    };

    const sizes = {
      sm: 'h-9 px-3 text-small',
      md: 'h-11 px-4 text-body',
      lg: 'h-14 px-6 text-body',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
