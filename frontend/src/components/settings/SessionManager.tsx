'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { WhatsAppSession } from '@/types';

const statusStyles: Record<string, string> = {
  CONNECTED: 'bg-green-100 text-green-800',
  DISCONNECTED: 'bg-red-100 text-red-800',
  QR_PENDING: 'bg-yellow-100 text-yellow-800',
};

export function SessionManager({ initialSessions }: { initialSessions: WhatsAppSession[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [newId, setNewId] = useState('');
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // On mount, fetch QR for any session already in QR_PENDING state
  useEffect(() => {
    initialSessions.forEach(async (s) => {
      if (s.status === 'QR_PENDING' || s.qrCode) {
        try {
          const data = await api.sessions.getQr(s.sessionId);
          if (data?.qr) setQrCodes((prev) => ({ ...prev, [s.sessionId]: data.qr }));
        } catch {
          // no QR available yet
        }
      }
    });
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on('session:qr', ({ sessionId, qr }: { sessionId: string; qr: string }) => {
      setQrCodes((prev) => ({ ...prev, [sessionId]: qr }));
      setSessions((prev) =>
        prev.map((s) => (s.sessionId === sessionId ? { ...s, status: 'QR_PENDING', qrCode: qr } : s))
      );
    });

    socket.on('session:status', ({ sessionId, status }: { sessionId: string; status: WhatsAppSession['status'] }) => {
      setSessions((prev) =>
        prev.map((s) => (s.sessionId === sessionId ? { ...s, status } : s))
      );
      if (status === 'CONNECTED') {
        setQrCodes((prev) => {
          const next = { ...prev };
          delete next[sessionId];
          return next;
        });
      }
    });

    return () => {
      socket.off('session:qr');
      socket.off('session:status');
    };
  }, []);

  async function createSession() {
    if (!newId.trim()) return;
    await api.sessions.create(newId.trim());
    setNewId('');
    const updated = await api.sessions.list();
    setSessions(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Session ID (e.g. default)"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
        />
        <button
          onClick={createSession}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Add Session
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow p-4 flex items-start gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{session.sessionId}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[session.status]}`}
                >
                  {session.status}
                </span>
              </div>
              {qrCodes[session.sessionId] && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Escaneie o QR code no WhatsApp:</p>
                  <div className="inline-block p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <img
                      src={qrCodes[session.sessionId]}
                      alt="QR Code WhatsApp"
                      width={220}
                      height={220}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
