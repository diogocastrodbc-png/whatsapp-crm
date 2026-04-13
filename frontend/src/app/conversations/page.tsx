import Link from 'next/link';
import { api } from '@/lib/api';
import type { Conversation } from '@/types';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-gray-100 text-gray-600',
};

export default async function ConversationsPage() {
  let conversations: Conversation[] = [];
  try {
    conversations = await api.conversations.list();
  } catch {
    // backend may not be running during build
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Conversations</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const lastMessage = conv.messages?.[0];
            return (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="flex items-center justify-between bg-white rounded-lg shadow px-5 py-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {conv.contact.name ?? conv.contact.phone}
                  </p>
                  {lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {lastMessage.direction === 'OUTBOUND' ? 'You: ' : ''}
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[conv.status]}`}
                  >
                    {conv.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
