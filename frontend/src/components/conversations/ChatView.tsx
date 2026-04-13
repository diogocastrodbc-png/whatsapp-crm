'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Conversation, Message } from '@/types';

export function ChatView({ conversation: initial }: { conversation: Conversation }) {
  const [messages, setMessages] = useState<Message[]>(initial.messages ?? []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on('message:new', (data: { message: Message; conversationId: string }) => {
      if (data.conversationId === initial.id) {
        setMessages((prev) => [...prev, data.message]);
      }
    });
    return () => {
      socket.off('message:new');
    };
  }, [initial.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const message = await api.conversations.sendMessage(initial.id, input.trim());
      setMessages((prev) => [...prev, message]);
      setInput('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900">
          {initial.contact.name ?? initial.contact.phone}
        </p>
        <p className="text-sm text-gray-500">{initial.contact.phone}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                msg.direction === 'OUTBOUND'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 shadow rounded-bl-sm'
              }`}
            >
              <p>{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.direction === 'OUTBOUND' ? 'text-indigo-200' : 'text-gray-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-3">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
