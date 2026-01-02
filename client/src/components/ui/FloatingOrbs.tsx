'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingOrbsProps {
  count?: number;
  className?: string;
}

export function FloatingOrbs({ count = 3, className }: FloatingOrbsProps) {
  const orbs = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {orbs.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-2xl opacity-30"
          style={{
            width: `${200 + i * 50}px`,
            height: `${200 + i * 50}px`,
            left: `${(i * 30) % 80}%`,
            top: `${(i * 40) % 60}%`,
            background:
              i % 3 === 0
                ? 'var(--brand-cyan)'
                : i % 3 === 1
                ? 'var(--brand-blue)'
                : 'var(--brand-violet)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}
