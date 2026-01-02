'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gradient-to-r from-slate-grey/20 via-slate-grey/30 to-slate-grey/20',
    {
      'rounded-full': variant === 'circular',
      'rounded-sm': variant === 'rectangular',
      'rounded-sm h-4': variant === 'text',
    },
    className
  );

  if (animation === 'wave') {
    return (
      <motion.div
        className={baseClasses}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    );
  }

  return (
    <motion.div
      className={baseClasses}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="p-4 bg-white rounded-md border border-slate-grey/10 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" className="w-5 h-5" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton variant="circular" className="w-8 h-8" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}
