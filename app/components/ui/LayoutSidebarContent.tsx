import React from 'react';

interface LayoutSidebarContentProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function LayoutSidebarContent({ sidebar, children, className }: LayoutSidebarContentProps) {
  return (
    <div className={`relative lg:flex lg:min-h-[600px] ${className || ''}`}>
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="sticky top-24">
          {sidebar}
        </div>
      </div>
      {/* Main Content */}
      <div className="lg:ml-8 flex-1">
        {children}
      </div>
    </div>
  );
} 