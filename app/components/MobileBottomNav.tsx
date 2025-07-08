import Link from 'next/link';
import { Home, Users, Sparkles, Puzzle, DollarSign } from 'lucide-react';

export function MobileBottomNav() {
  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 w-full bg-white border-t z-50 h-16">
      <div className="flex justify-around items-center w-full h-full text-xs">
        <Link href="/" className="flex flex-col items-center justify-center flex-1 py-2 hover:text-blue-600 transition-colors">
          <Home className="w-6 h-6 mb-1" />
          <span>Home</span>
        </Link>
        <Link href="/meet-sagea" className="flex flex-col items-center justify-center flex-1 py-2 hover:text-blue-600 transition-colors">
          <Users className="w-6 h-6 mb-1" />
          <span>Sagea</span>
        </Link>
        <Link href="/topic-spark" className="flex flex-col items-center justify-center flex-1 py-2 hover:text-blue-600 transition-colors">
          <Sparkles className="w-6 h-6 mb-1" />
          <span>Spark</span>
        </Link>
        <Link href="/word-maze" className="flex flex-col items-center justify-center flex-1 py-2 hover:text-blue-600 transition-colors">
          <Puzzle className="w-6 h-6 mb-1" />
          <span>Maze</span>
        </Link>
        <Link href="/pricing" className="flex flex-col items-center justify-center flex-1 py-2 hover:text-blue-600 transition-colors">
          <DollarSign className="w-6 h-6 mb-1" />
          <span>Pricing</span>
        </Link>
      </div>
    </nav>
  );
} 