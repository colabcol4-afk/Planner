'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';

interface UseChatOptions {
  onError?: (error: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const streamingMessageIdRef = useRef<string | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const {
    messages,
    sessionId,
    isConnected,
    isTyping,
    addMessage,
    updateMessage,
    appendToMessage,
    setIsConnected,
    setIsTyping,
    resetSession,
  } = useChatStore();

  // Store functions in refs to avoid stale closures
  const storeRef = useRef({
    addMessage,
    updateMessage,
    appendToMessage,
    setIsConnected,
    setIsTyping,
  });

  useEffect(() => {
    storeRef.current = {
      addMessage,
      updateMessage,
      appendToMessage,
      setIsConnected,
      setIsTyping,
    };
  }, [addMessage, updateMessage, appendToMessage, setIsConnected, setIsTyping]);

  const handleServerMessage = useCallback((data: Record<string, unknown>) => {
    const store = storeRef.current;

    switch (data.type) {
      case 'connected':
        console.log('Chat connected:', data.message);
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'stream': {
        const content = data.content as string;
        const isFinal = data.is_final as boolean;

        if (isFinal) {
          store.setIsTyping(false);
          if (streamingMessageIdRef.current) {
            store.updateMessage(streamingMessageIdRef.current, { isStreaming: false });
            streamingMessageIdRef.current = null;
          }
        } else if (content) {
          if (streamingMessageIdRef.current) {
            store.appendToMessage(streamingMessageIdRef.current, content);
          } else {
            const id = store.addMessage({
              role: 'assistant',
              content,
              isStreaming: true,
            });
            streamingMessageIdRef.current = id;
          }
        }
        break;
      }

      case 'tool_call': {
        const tool = data.tool as string;
        const status = data.status as string;
        if (status === 'executing') {
          console.log(`Executing tool: ${tool}`);
        }
        break;
      }

      case 'tool_result': {
        const tool = data.tool as string;
        const success = data.success as boolean;
        if (!success) {
          toast.error('Action failed', `Failed to execute ${tool}`);
        }
        break;
      }

      case 'error': {
        const message = data.message as string;
        console.error('Server error:', message);
        toast.error('Error', message);
        store.setIsTyping(false);
        optionsRef.current.onError?.(message);
        break;
      }

      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('Already connecting, skipping...');
      return;
    }

    // Check if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Already connected, skipping...');
      return;
    }

    isConnectingRef.current = true;

    try {
      // Get token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error('No access token available');
        isConnectingRef.current = false;
        return;
      }

      // Close existing connection cleanly
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Create WebSocket connection
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/api/v1/chat/stream?token=${session.access_token}`;
      console.log('Connecting to WebSocket...');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        storeRef.current.setIsConnected(true);
        isConnectingRef.current = false;

        // Start ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleServerMessage(data);
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        storeRef.current.setIsConnected(false);
        storeRef.current.setIsTyping(false);
        isConnectingRef.current = false;

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Reconnect after delay (unless intentionally closed or auth error)
        if (event.code !== 1000 && event.code !== 4001) {
          console.log('Will attempt to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect:', error);
      isConnectingRef.current = false;
    }
  }, [handleServerMessage]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected', 'Please wait for the connection to be established');
      return;
    }

    if (!content.trim()) return;

    // Add user message
    storeRef.current.addMessage({
      role: 'user',
      content: content.trim(),
    });

    // Reset streaming message ID for new response
    streamingMessageIdRef.current = null;
    storeRef.current.setIsTyping(true);

    // Send to server
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: content.trim(),
      session_id: sessionId,
    }));
  }, [sessionId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    sessionId,
    isConnected,
    isTyping,
    sendMessage,
    resetSession,
    reconnect: connect,
  };
}
