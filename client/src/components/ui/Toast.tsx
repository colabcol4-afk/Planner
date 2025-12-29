'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

// Global toast store
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastState: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toastState]));
}

export const toast = {
  add: (toastData: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toastData, id };
    toastState = [...toastState, newToast];
    notifyListeners();

    // Auto remove after duration
    const duration = toastData.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        toast.remove(id);
      }, duration);
    }
  },
  remove: (id: string) => {
    toastState = toastState.filter(t => t.id !== id);
    notifyListeners();
  },
  success: (title: string, description?: string) => {
    toast.add({ type: 'success', title, description });
  },
  error: (title: string, description?: string) => {
    toast.add({ type: 'error', title, description });
  },
  warning: (title: string, description?: string) => {
    toast.add({ type: 'warning', title, description });
  },
  info: (title: string, description?: string) => {
    toast.add({ type: 'info', title, description });
  },
};

function useToastStore(): Toast[] {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    setToasts([...toastState]);

    return () => {
      toastListeners = toastListeners.filter(l => l !== setToasts);
    };
  }, []);

  return toasts;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-success/10 border-success/20 text-success',
  error: 'bg-danger/10 border-danger/20 text-danger',
  warning: 'bg-warning/10 border-warning/20 text-warning',
  info: 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue',
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = icons[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={cn(
        'flex items-start gap-3 w-full max-w-sm p-4 rounded-md border shadow-elevation-2 bg-white',
      )}
    >
      <div className={cn('p-1 rounded-full', styles[t.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-heading">{t.title}</p>
        {t.description && (
          <p className="text-small text-body mt-1">{t.description}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded-sm hover:bg-offwhite transition-colors"
      >
        <X className="h-4 w-4 text-body" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <ToastItem
            key={t.id}
            toast={t}
            onRemove={() => toast.remove(t.id)}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
