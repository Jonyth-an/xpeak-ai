'use client';
import Link from 'next/link';
import { Home, Users, Sparkles, Puzzle, DollarSign, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { roles } = useRoles();

  useEffect(() => {
    console.log('MobileBottomNav rendered, pathname:', pathname);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 h-16 shadow-lg" style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
      <div className="flex justify-around items-center w-full h-full text-xs">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/') 
              ? 'text-red-500' 
              : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span>Home</span>
        </Link>
        {user && roles.includes('student') && (
          <Link 
            href="/tutors" 
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              isActive('/tutors') 
                ? 'text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <User className="w-6 h-6 mb-1" />
            <span>Tutors</span>
          </Link>
        )}
        <Link 
          href="/meet-sagea" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/meet-sagea') 
              ? 'text-red-500' 
              : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Users className="w-6 h-6 mb-1" />
          <span>Sagea</span>
        </Link>
        <Link 
          href="/topic-spark" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/topic-spark') 
              ? 'text-red-500' 
              : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Sparkles className="w-6 h-6 mb-1" />
          <span>Spark</span>
        </Link>
        <Link 
          href="/word-maze" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/word-maze') 
              ? 'text-red-500' 
              : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Puzzle className="w-6 h-6 mb-1" />
          <span>Maze</span>
        </Link>
        <Link 
          href="/pricing" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/pricing') 
              ? 'text-red-500' 
              : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <DollarSign className="w-6 h-6 mb-1" />
          <span>Pricing</span>
        </Link>
      </div>
    </nav>
  );
} 