'use client';

import { forwardRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-tiny',
  sm: 'h-10 w-10 text-small',
  md: 'h-14 w-14 text-body',
  lg: 'h-22 w-22 text-h4',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = 'Avatar', fallback, size = 'md', className }, ref) => {
    const [imageError, setImageError] = useState(false);

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const showFallback = !src || imageError;

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden bg-offwhite flex items-center justify-center',
          sizes[size],
          className
        )}
      >
        {!showFallback ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          <span className="font-medium text-brand-blue">
            {getInitials(fallback)}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-slate-grey" />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
