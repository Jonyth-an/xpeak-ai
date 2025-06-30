'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BarChart2, FileText, Mail, Users, Activity, HeartPulse, LogOut, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col py-6 px-4 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="text-primary">XPeak Admin</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
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
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div className="font-semibold text-lg">XPeak Admin</div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <Avatar 
                    src={user.user_metadata?.avatar_url} 
                    alt={user.email || 'User avatar'}
                    size="sm"
                  />
                  <span className="text-gray-700 text-sm font-medium">{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-2 lg:px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
} 