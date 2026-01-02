'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'mesh' | 'aurora';
  className?: string;
}

export function AnimatedBackground({
  variant = 'gradient',
  className
}: AnimatedBackgroundProps) {
  if (variant === 'gradient') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <motion.div
          className="absolute -inset-[100%] opacity-50"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(0, 210, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(106, 0, 244, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(58, 123, 213, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 60% 20%, rgba(0, 210, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(0, 210, 255, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (variant === 'mesh') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <motion.div
          className="absolute top-0 -left-4 w-72 h-72 bg-brand-cyan/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-0 -right-4 w-72 h-72 bg-brand-violet/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-blue/20 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  if (variant === 'aurora') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-offwhite via-white to-offwhite" />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, rgba(0,210,255,0.1) 0%, rgba(58,123,213,0.1) 50%, rgba(106,0,244,0.1) 100%)',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,210,255,0.05),transparent_60%)]" />
      </div>
    );
  }

  return null;
}
