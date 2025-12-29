'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-offwhite flex items-center justify-center border border-slate-grey/20">
          <Sparkles className="w-4 h-4 text-brand-blue" />
        </div>
      </div>

      {/* Typing dots */}
      <div className="bg-white border border-slate-grey/10 rounded-lg rounded-bl-sm px-4 py-3 shadow-elevation-1">
        <div className="flex items-center gap-1">
          <span className="typing-dot w-2 h-2 rounded-full bg-brand-blue" />
          <span className="typing-dot w-2 h-2 rounded-full bg-brand-blue" />
          <span className="typing-dot w-2 h-2 rounded-full bg-brand-blue" />
        </div>
      </div>
    </motion.div>
  );
}
