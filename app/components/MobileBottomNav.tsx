import Link from 'next/link';
import { Home, Users, Sparkles, Puzzle, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 w-full bg-token-surface border-t border-token-border z-50 h-16 shadow-lg">
      <div className="flex justify-around items-center w-full h-full text-xs">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/') 
              ? 'text-token-primary' 
              : 'text-token-text-secondary hover:text-token-primary'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span>Home</span>
        </Link>
        <Link 
          href="/meet-sagea" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/meet-sagea') 
              ? 'text-token-primary' 
              : 'text-token-text-secondary hover:text-token-primary'
          }`}
        >
          <Users className="w-6 h-6 mb-1" />
          <span>Sagea</span>
        </Link>
        <Link 
          href="/topic-spark" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/topic-spark') 
              ? 'text-token-primary' 
              : 'text-token-text-secondary hover:text-token-primary'
          }`}
        >
          <Sparkles className="w-6 h-6 mb-1" />
          <span>Spark</span>
        </Link>
        <Link 
          href="/word-maze" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/word-maze') 
              ? 'text-token-primary' 
              : 'text-token-text-secondary hover:text-token-primary'
          }`}
        >
          <Puzzle className="w-6 h-6 mb-1" />
          <span>Maze</span>
        </Link>
        <Link 
          href="/pricing" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/pricing') 
              ? 'text-token-primary' 
              : 'text-token-text-secondary hover:text-token-primary'
          }`}
        >
          <DollarSign className="w-6 h-6 mb-1" />
          <span>Pricing</span>
        </Link>
      </div>
    </nav>
  );
} 