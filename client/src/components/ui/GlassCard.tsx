'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  blur = 'md',
  hover = true,
  ...props
}: GlassCardProps) {
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-md bg-white/70 border border-white/20',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]',
        blurStyles[blur],
        className
      )}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
