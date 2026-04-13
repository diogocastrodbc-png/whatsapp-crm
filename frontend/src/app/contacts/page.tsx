import { api } from '@/lib/api';
import type { Contact } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  let contacts: Contact[] = [];
  try {
    contacts = await api.contacts.list();
  } catch {
    // backend may not be running during build
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
      </div>

      {contacts.length === 0 ? (
        <p className="text-gray-500">No contacts yet. They will appear automatically when someone messages you.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.name ?? <span className="text-gray-400">Unknown</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.tags?.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1"
                        style={{ backgroundColor: tag.color + '22', color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
