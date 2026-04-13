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

const statusLabels: Record<string, string> = {
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  QR_PENDING: 'Aguardando QR',
};

export function SessionManager({ initialSessions }: { initialSessions: WhatsAppSession[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  // On mount, fetch QR for any session in QR_PENDING state
  useEffect(() => {
    initialSessions.forEach(async (s) => {
      if (s.status === 'QR_PENDING' || s.qrCode) {
        try {
          const data = await api.sessions.getQr(s.sessionId);
          if (data?.qr) setQrCodes((prev) => ({ ...prev, [s.sessionId]: data.qr }));
        } catch {
          // QR not available yet
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

  async function refreshStatus() {
    setRefreshing(true);
    try {
      const updated = await api.sessions.list();
      setSessions(updated);
      // Re-fetch QR for pending sessions
      for (const s of updated) {
        if (s.status === 'QR_PENDING') {
          try {
            const data = await api.sessions.getQr(s.sessionId);
            if (data?.qr) setQrCodes((prev) => ({ ...prev, [s.sessionId]: data.qr }));
          } catch {
            // QR not available
          }
        }
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Como conectar o WhatsApp</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>Acesse <strong>app.z-api.io</strong> e abra a sua instância</li>
          <li>Clique em <strong>QR Code</strong> e escaneie com o WhatsApp no celular</li>
          <li>Após conectar, clique em <strong>Atualizar Status</strong> abaixo</li>
        </ol>
        <p className="mt-2 text-blue-600">
          Para receber mensagens localmente, configure um túnel público (ex: ngrok) e atualize
          o <code className="bg-blue-100 px-1 rounded">WEBHOOK_BASE_URL</code> no backend.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={refreshStatus}
          disabled={refreshing}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {refreshing ? 'Atualizando...' : 'Atualizar Status'}
        </button>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            Nenhuma sessão encontrada. O backend pode estar inicializando — clique em Atualizar Status.
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow p-4 flex items-start gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{session.sessionId}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[session.status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {statusLabels[session.status] ?? session.status}
                </span>
              </div>
              {qrCodes[session.sessionId] && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">QR Code (escaneie pelo app.z-api.io):</p>
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
              {session.status === 'CONNECTED' && (
                <p className="mt-2 text-sm text-green-700">
                  WhatsApp conectado e pronto para receber mensagens.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
