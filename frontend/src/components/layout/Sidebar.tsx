import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/conversations', label: 'Conversations' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-gray-200">
        <span className="font-bold text-indigo-600 text-lg">WhatsApp CRM</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
