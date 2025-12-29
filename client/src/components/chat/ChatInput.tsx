'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-md border border-slate-grey/30 resize-none',
              'bg-offwhite text-heading placeholder:text-slate-grey/60',
              'focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-blue',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-fast'
            )}
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center',
            'transition-all duration-fast',
            message.trim() && !disabled
              ? 'bg-brand-gradient text-white shadow-brand hover:shadow-lg active:scale-95'
              : 'bg-slate-grey/20 text-slate-grey cursor-not-allowed'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <p className="text-tiny text-body mt-2 text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
}
