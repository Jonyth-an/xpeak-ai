'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Home, User } from 'lucide-react';

export default function MobileHeader() {
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('MobileHeader: Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  // Check if current user is an admin
  const { roles } = useRoles();
  const isAdmin = roles.includes('admin');

  return (
    <header className="block md:hidden fixed top-0 left-0 right-0 z-50 bg-white text-black border-b border-gray-200 h-14">
      <div className="flex items-center justify-between w-full px-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href={user ? (roles.includes('admin') ? '/admin/dashboard' : roles.includes('tutor') ? '/tutor' : '/student/dashboard') : "/"} className="flex items-center">
            <span className="font-bold text-xl tracking-tight flex items-center gap-2">
              <Home className="w-6 h-6" />
              Xpeak
            </span>
          </Link>
        </div>

        {/* Profile/Login Button */}
        <div className="flex items-center">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded-lg"></div>
          ) : user ? (
            // Logged in state
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative focus:outline-none">
                  <img
                    src={user.user_metadata?.avatar_url || '/images/default-avatar.svg'}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                    onError={(e) => {
                      e.currentTarget.src = '/images/default-avatar.svg';
                    }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={roles.includes('admin') ? '/admin/dashboard' : roles.includes('tutor') ? '/tutor' : '/student/dashboard'}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={roles.includes('tutor') ? '/tutor/profile' : '/student/profile'}>Profile</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="text-blue-600 font-medium">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={signingOut} className="text-red-600">
                  {signingOut ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Signing Out...
                    </div>
                  ) : (
                    'Sign Out'
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Logged out state
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
                <User className="w-4 h-4 mr-1" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 