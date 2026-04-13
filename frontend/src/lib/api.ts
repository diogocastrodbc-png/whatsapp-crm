import type { Contact, Conversation, Message, WhatsAppSession } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  contacts: {
    list: () => request<Contact[]>('/contacts'),
    get: (id: string) => request<Contact>(`/contacts/${id}`),
    create: (data: Partial<Contact>) =>
      request<Contact>('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Contact>) =>
      request<Contact>(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
  },

  conversations: {
    list: (status?: string) =>
      request<Conversation[]>(`/conversations${status ? `?status=${status}` : ''}`),
    get: (id: string) => request<Conversation>(`/conversations/${id}`),
    sendMessage: (id: string, content: string) =>
      request<Message>(`/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    updateStatus: (id: string, status: string) =>
      request<Conversation>(`/conversations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    assign: (id: string, userId: string) =>
      request<Conversation>(`/conversations/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      }),
  },

  sessions: {
    list: () => request<WhatsAppSession[]>('/sessions'),
    create: (sessionId: string) =>
      request<void>('/sessions', { method: 'POST', body: JSON.stringify({ sessionId }) }),
    delete: (sessionId: string) =>
      request<void>(`/sessions/${sessionId}`, { method: 'DELETE' }),
    getQr: (sessionId: string) =>
      request<{ sessionId: string; qr: string }>(`/sessions/${sessionId}/qr`),
  },
};
