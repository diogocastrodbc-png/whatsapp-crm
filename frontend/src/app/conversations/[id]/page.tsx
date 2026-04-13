import { api } from '@/lib/api';
import { ChatView } from '@/components/conversations/ChatView';

export const dynamic = 'force-dynamic';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await api.conversations.get(id);

  return <ChatView conversation={conversation} />;
}
