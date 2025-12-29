'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from '@/stores/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import { Sparkles, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-offwhite flex items-center justify-center border border-slate-grey/20">
            <Sparkles className="w-4 h-4 text-brand-blue" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 rounded-lg',
            isUser
              ? 'bg-brand-gradient text-white rounded-br-sm'
              : 'bg-white text-heading border border-slate-grey/10 rounded-bl-sm shadow-elevation-1',
            message.isStreaming && 'animate-pulse-soft'
          )}
        >
          <MessageContent content={message.content} isUser={isUser} />

          {/* Streaming cursor */}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
          )}
        </div>

        {/* Timestamp */}
        <span className="text-tiny text-body mt-1">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

function MessageContent({ content, isUser }: MessageContentProps) {
  // Simple markdown-like parsing for basic formatting
  const lines = content.split('\n');

  return (
    <div className={cn('text-small whitespace-pre-wrap', isUser ? 'text-white' : 'text-heading')}>
      {lines.map((line, i) => {
        // Check for list items
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span>•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }

        // Check for numbered list
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span>{numberedMatch[1]}.</span>
              <span>{numberedMatch[2]}</span>
            </div>
          );
        }

        // Regular line
        return (
          <p key={i} className={line === '' ? 'h-2' : ''}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
