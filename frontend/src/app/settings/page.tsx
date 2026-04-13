import { api } from '@/lib/api';
import { SessionManager } from '@/components/settings/SessionManager';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let sessions = [];
  try {
    sessions = await api.sessions.list();
  } catch {
    // backend may not be running during build
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <section>
        <h2 className="text-lg font-semibold mb-4">WhatsApp Sessions</h2>
        <SessionManager initialSessions={sessions} />
      </section>
    </div>
  );
}
