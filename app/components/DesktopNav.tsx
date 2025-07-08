import Link from 'next/link';
import { Home, Users, Sparkles, Puzzle, DollarSign, User } from 'lucide-react';

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
      {/* Nav Links */}
      <div className="flex gap-6 items-center flex-1">
        <Link href="/meet-sagea" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Users className="w-5 h-5" /> Meet Sagea
        </Link>
        <Link href="/topic-spark" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Sparkles className="w-5 h-5" /> Topic Spark
        </Link>
        <Link href="/word-maze" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Puzzle className="w-5 h-5" /> Word Maze
        </Link>
        <Link href="/pricing" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <DollarSign className="w-5 h-5" /> Pricing
        </Link>
      </div>
      {/* Profile/Login/Signup */}
      <div className="ml-auto">
        <Link href="/login" className="flex items-center gap-1 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
          <User className="w-5 h-5" /> Login / Signup
        </Link>
      </div>
    </nav>
  );
} 