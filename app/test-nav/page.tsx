'use client';

import { useEffect, useState } from 'react';

export default function TestNavPage() {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Navigation Debug Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Screen Information:</h2>
        <p><strong>Width:</strong> {screenSize.width}px</p>
        <p><strong>Height:</strong> {screenSize.height}px</p>
        <p><strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'}</p>
        <p><strong>Breakpoint:</strong> {screenSize.width < 768 ? 'Mobile (< 768px)' : 'Desktop (≥ 768px)'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Expected Navigation:</h2>
        {isMobile ? (
          <div>
            <p>✅ <strong>Mobile Header</strong> should be visible at top</p>
            <p>✅ <strong>Mobile Bottom Nav</strong> should be visible at bottom</p>
            <p>❌ <strong>Desktop Nav</strong> should be hidden</p>
          </div>
        ) : (
          <div>
            <p>✅ <strong>Desktop Nav</strong> should be visible at top</p>
            <p>❌ <strong>Mobile Header</strong> should be hidden</p>
            <p>❌ <strong>Mobile Bottom Nav</strong> should be hidden</p>
          </div>
        )}
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">CSS Classes Test:</h2>
        <div className="space-y-2">
          <div className="hidden md:flex bg-green-200 p-2 rounded">
            This should be hidden on mobile, visible on desktop (hidden md:flex)
          </div>
          <div className="flex md:hidden bg-red-200 p-2 rounded">
            This should be visible on mobile, hidden on desktop (flex md:hidden)
          </div>
        </div>
      </div>

      <div className="bg-purple-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if the colored boxes above show correctly for your screen size</li>
          <li>If they don't, Tailwind CSS might not be loading properly</li>
          <li>Try refreshing the page and clearing browser cache</li>
          <li>Check browser developer tools for any CSS errors</li>
        </ol>
      </div>
    </div>
  );
} 