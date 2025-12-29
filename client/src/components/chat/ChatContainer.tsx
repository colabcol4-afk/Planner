'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ChatContainer() {
  const { messages, isConnected, isTyping, sendMessage, reconnect } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    await reconnect();
    setTimeout(() => setIsReconnecting(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-offwhite">
      {/* Connection Status */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-grey/10">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              isConnected ? 'bg-success animate-pulse' : 'bg-danger'
            )}
          />
          <span className="text-small text-body">
            {isConnected ? 'Connected to AI' : 'Disconnected'}
          </span>
        </div>

        {!isConnected && (
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="flex items-center gap-1 text-small text-brand-blue hover:underline disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isReconnecting && "animate-spin")} />
            {isReconnecting ? 'Connecting...' : 'Reconnect'}
          </button>
        )}
      </div>

      {/* Backend Not Running Warning */}
      {!isConnected && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-small font-medium text-heading">Backend server not connected</p>
              <p className="text-tiny text-body mt-1">
                Make sure the backend server is running: <code className="bg-slate-grey/20 px-1 rounded">cd server && python main.py</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={sendMessage} isConnected={isConnected} />
        ) : (
          <>
            <MessageList messages={messages} />
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-grey/10 bg-white p-4">
        <ChatInput
          onSend={sendMessage}
          disabled={!isConnected}
          placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
        />
      </div>
    </div>
  );
}

function EmptyState({ onSuggestionClick, isConnected }: { onSuggestionClick: (text: string) => void; isConnected: boolean }) {
  const suggestions = [
    "Add a meeting with John tomorrow at 2pm",
    "What's on my schedule today?",
    "Create a task to review the proposal",
    "Show me my pending tasks",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="w-16 h-16 rounded-lg bg-brand-gradient flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>

      <h2 className="text-h3 text-heading mb-2">
        Hi! I&apos;m your Vibe Planner
      </h2>
      <p className="text-body mb-8 max-w-md">
        I can help you manage tasks, plan your day, and track your routines.
        Just tell me what you need!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => isConnected && onSuggestionClick(suggestion)}
            disabled={!isConnected}
            className={cn(
              "p-3 text-left text-small bg-white rounded-md border border-slate-grey/20 transition-all",
              isConnected
                ? "hover:border-brand-blue hover:shadow-elevation-1 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            &ldquo;{suggestion}&rdquo;
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
