import Link from 'next/link';
import { Home, Globe, Moon, User } from 'lucide-react';

export function DesktopNav() {
  return (
    <nav className="hidden md:flex fixed top-0 left-0 w-full bg-white text-black z-50 shadow-md h-16 items-center px-6">
      {/* Logo + Home */}
      <div className="flex items-center gap-3 mr-8">
        <Link href="/">
          <span className="font-bold text-xl tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6" /> Xpeak
          </span>
        </Link>
      </div>
      
      {/* Spacer to push right elements */}
      <div className="flex-1" />
      
      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-sm">Engl...</span>
        </button>
        
        {/* Theme Toggle */}
        <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
          <Moon className="w-4 h-4" />
        </button>
        
        {/* Login */}
        <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
          <User className="w-4 h-4" />
          <span className="text-sm">Login</span>
        </Link>
        
        {/* Sign Up */}
        <Link href="/signup" className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors">
          <span className="text-sm font-medium">Sign Up</span>
        </Link>
      </div>
    </nav>
  );
} 