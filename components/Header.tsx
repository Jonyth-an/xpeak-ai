'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { Button, Select, Text, Card } from '@/app/components/ui';
import LanguageSelectorMenu from '@/app/components/molecules/LanguageSelectorMenu';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';

// Context for hero background color
export const HeroBackgroundContext = createContext<string | null>(null);

export const useHeroBackground = () => useContext(HeroBackgroundContext);

interface HeaderProps {
  heroBackgroundColor?: string;
}

export default function Header({ heroBackgroundColor }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({ label: 'English', code: 'EN', flag: '🇺🇸' });
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      console.log('Header: Starting sign out...');
      await signOut();
      console.log('Header: Sign out completed');
    } catch (error) {
      console.error('Header: Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  // Check if current user is an admin
  const { roles } = useRoles();
  const isAdmin = roles.includes('admin');

  // Get hero background color from context or props
  const contextHeroColor = useHeroBackground();
  const finalHeroColor = heroBackgroundColor || contextHeroColor;

  // Determine header background based on scroll state and hero color
  const getHeaderBackground = () => {
    if (isScrolled) {
      return 'bg-white shadow-token-md';
    }
    
    if (finalHeroColor) {
      return 'backdrop-blur-sm';
    }
    
    return 'bg-transparent backdrop-blur-sm';
  };

  const getHeaderStyle = () => {
    if (isScrolled) {
      return {};
    }
    
    if (finalHeroColor) {
      return { background: finalHeroColor };
    }
    
    return {};
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getHeaderBackground()}`}
      style={getHeaderStyle()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center">
              <Text variant="h2" as="span" className="text-token-primary">
                Xpeak AI
              </Text>
            </Link>
          </div>

          {/* Removed navigation tabs for all users */}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelectorMenu
                className="h-10 px-4 text-base font-medium rounded-lg border border-token-border bg-token-surface"
                options={[
                  { label: 'English', code: 'EN', flag: '🇺🇸' },
                  { label: 'Español', code: 'ES', flag: '🇪🇸' },
                  { label: '中文', code: 'ZH', flag: '🇨🇳' },
                  { label: '日本語', code: 'JA', flag: '🇯🇵' }
                ]}
                value={selectedLanguage.code}
                onSelect={setSelectedLanguage}
              />
            </div>

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle variant="button" />
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-x-2">
              {/* Loading state */}
              {loading ? (
                <div className="flex items-center gap-x-2">
                  <div className="animate-pulse bg-token-gray-200 h-10 w-16 rounded-lg"></div>
                  <div className="animate-pulse bg-token-gray-200 h-10 w-20 rounded-lg"></div>
                </div>
              ) : user ? (
                // Logged in state
                <div className="flex items-center gap-x-2">
                  <div className="hidden md:flex items-center gap-x-2">
                    {/* User Avatar with Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="relative focus:outline-none">
                          <img
                            src={user.user_metadata?.avatar_url || '/images/default-avatar.svg'}
                            alt="User avatar"
                            className="w-8 h-8 rounded-full object-cover border-2 border-token-border cursor-pointer hover:ring-2 hover:ring-token-primary transition"
                            onError={(e) => {
                              e.currentTarget.src = '/images/default-avatar.svg';
                            }}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        {roles.includes('student') && (
                          <DropdownMenuItem asChild>
                            <Link href="/tutors">Book Tutors</Link>
                          </DropdownMenuItem>
                        )}
                        {roles.includes('tutor') && (
                          <DropdownMenuItem asChild>
                            <Link href="/tutor">Tutor Dashboard</Link>
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/admin/dashboard" className="text-token-secondary font-medium">
                                Admin Dashboard
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/admin/roles" className="text-token-secondary font-medium">
                                Manage Roles
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
                  </div>
                </div>
              ) : (
                // Logged out state
                <Link href="/login">
                  <Button variant="outline" size="sm" className="h-10 px-4 text-base font-medium">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}