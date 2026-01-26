'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/transfers', label: 'Transferencias' },
  { href: '/admin/clients', label: 'Clientes' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // No shell on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen" style={{ backgroundColor: '#100235' }}>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            <aside
              className="rounded-2xl border p-4 h-fit"
              style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(15, 17, 23, 0.6)' }}
            >
              <p className="text-sm font-semibold mb-3 font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
                Panel Admin
              </p>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 rounded-lg text-sm font-semibold font-[var(--font-dm-sans)]"
                      style={{
                        background: active ? 'rgba(168, 62, 245, 0.22)' : 'transparent',
                        border: active ? '1px solid rgba(168, 62, 245, 0.35)' : '1px solid transparent',
                        color: '#FFFFFF',
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <section
              className="rounded-2xl border p-6"
              style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(15, 17, 23, 0.6)' }}
            >
              {children}
            </section>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

