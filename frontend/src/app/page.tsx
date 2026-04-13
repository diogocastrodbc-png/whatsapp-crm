import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/conversations"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Conversations</h2>
          <p className="text-gray-500 mt-1 text-sm">View and manage all chats</p>
        </Link>
        <Link
          href="/contacts"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Contacts</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage your contacts</p>
        </Link>
        <Link
          href="/settings"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Settings</h2>
          <p className="text-gray-500 mt-1 text-sm">Configure WhatsApp sessions</p>
        </Link>
      </div>
    </div>
  );
}
