/**
 * API client for the FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Chat
  chat: {
    sendMessage: (message: string, sessionId: string, token: string) =>
      request<{ response: string; session_id: string; tool_calls: unknown[] }>(
        '/api/v1/chat/message',
        {
          method: 'POST',
          body: JSON.stringify({ message, session_id: sessionId }),
          token,
        }
      ),

    getHistory: (sessionId: string, token: string) =>
      request<{ messages: unknown[]; session_id: string }>(
        `/api/v1/chat/history/${sessionId}`,
        { token }
      ),
  },

  // Tasks
  tasks: {
    list: (params: { status?: string; date?: string } = {}, token: string) => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.date) searchParams.set('due_date', params.date);

      return request<{ tasks: unknown[]; total: number }>(
        `/api/v1/tasks?${searchParams.toString()}`,
        { token }
      );
    },

    create: (task: { title: string; description?: string; due_date?: string; priority?: string }, token: string) =>
      request<unknown>('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
        token,
      }),

    update: (taskId: string, updates: Partial<{ title: string; status: string; priority: string }>, token: string) =>
      request<unknown>(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        token,
      }),

    delete: (taskId: string, token: string) =>
      request<{ success: boolean }>(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        token,
      }),
  },

  // Routines
  routines: {
    list: (token: string) =>
      request<{ routines: unknown[]; total: number }>('/api/v1/routines', { token }),

    create: (routine: { title: string; day_type: string; time_of_day?: string }, token: string) =>
      request<unknown>('/api/v1/routines', {
        method: 'POST',
        body: JSON.stringify(routine),
        token,
      }),
  },

  // Users
  users: {
    getProfile: (token: string) =>
      request<unknown>('/api/v1/users/me', { token }),

    updateProfile: (updates: { full_name?: string; timezone?: string }, token: string) =>
      request<unknown>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
        token,
      }),

    completeOnboarding: (token: string) =>
      request<{ success: boolean }>('/api/v1/users/onboarding/complete', {
        method: 'POST',
        token,
      }),
  },
};
