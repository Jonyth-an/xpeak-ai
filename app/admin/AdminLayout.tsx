import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BarChart2, FileText, Mail, Users, Activity, HeartPulse, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Avatar } from '@/app/components/ui';

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Audit Trail', href: '/admin/audit-trail', icon: FileText },
  { label: 'Email Monitoring', href: '/admin/email-monitoring', icon: Mail },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Usage Tracking', href: '/admin/usage', icon: Activity },
  { label: 'System Health', href: '/admin/health', icon: HeartPulse },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-6 px-4">
        <div className="mb-8 flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="text-primary">XPeak Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b bg-white shadow-sm">
          <div className="font-semibold text-lg hidden md:block">XPeak Admin</div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={user.user_metadata?.avatar_url} 
                    alt={user.email || 'User avatar'}
                    size="sm"
                  />
                  <span className="text-gray-700 text-sm font-medium">{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                  title="Logout"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
        {/* Minimal footer (hidden for now) */}
        {/* <footer className="h-8 text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} XPeak Admin</footer> */}
      </div>
    </div>
  );
} 