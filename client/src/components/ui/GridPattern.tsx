'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GridPatternProps {
  className?: string;
  animate?: boolean;
}

export function GridPattern({ className, animate = false }: GridPatternProps) {
  if (animate) {
    return (
      <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(203, 213, 225, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(203, 213, 225, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 0%, rgba(248, 249, 250, 0.8) 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(203, 213, 225, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}
