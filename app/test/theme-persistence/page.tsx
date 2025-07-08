'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { ThemeService, themeUtils } from '@/lib/services/themeService';

export default function ThemePersistenceTest() {
  const { theme, setTheme, customTheme, setCustomTheme, clearCustomTheme } = useTheme();
  const [themeInfo, setThemeInfo] = useState<any>(null);
  const [exportData, setExportData] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update theme info when theme changes
      setThemeInfo(ThemeService.getThemeInfo());
    }
  }, [theme, customTheme, mounted]);

  const handleExport = () => {
    const data = ThemeService.exportThemeData();
    setExportData(data);
  };

  const handleImport = () => {
    if (exportData) {
      const success = ThemeService.importThemeData(exportData);
      if (success) {
        // Reload page to apply imported theme
        window.location.reload();
      } else {
        alert('Failed to import theme data');
      }
    }
  };

  const handleClearAll = () => {
    ThemeService.clearAllThemes();
    clearCustomTheme();
    setTheme('system');
    window.location.reload();
  };

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Theme Persistence Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Theme Persistence Test</h1>
      
      {/* Current Theme Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-token-surface border border-token-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Theme State</h2>
          <div className="space-y-2">
            <p><strong>Base Theme:</strong> {theme}</p>
            <p><strong>Resolved Theme:</strong> {theme === 'system' ? themeUtils.getSystemTheme() : theme}</p>
            <p><strong>Custom Theme:</strong> {customTheme ? customTheme.name : 'None'}</p>
            <p><strong>Theme Category:</strong> {customTheme ? customTheme.category : 'N/A'}</p>
            <p><strong>Is Official:</strong> {customTheme ? customTheme.isOfficial ? 'Yes' : 'No' : 'N/A'}</p>
          </div>
        </div>

        <div className="p-6 bg-token-surface border border-token-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Storage Status</h2>
          <div className="space-y-2">
            <p><strong>Base Theme Saved:</strong> {themeInfo?.baseTheme || 'None'}</p>
            <p><strong>Custom Theme Saved:</strong> {themeInfo?.hasCustomTheme ? 'Yes' : 'No'}</p>
            <p><strong>Storage Keys:</strong></p>
            <ul className="text-sm ml-4">
              <li>• xpeak-theme: {typeof window !== 'undefined' ? (localStorage.getItem('xpeak-theme') || 'Not set') : 'Loading...'}</li>
              <li>• xpeak-custom-theme: {typeof window !== 'undefined' ? (localStorage.getItem('xpeak-custom-theme') ? 'Set' : 'Not set') : 'Loading...'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Theme Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-token-surface border border-token-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Base Theme Controls</h2>
          <div className="space-y-2">
            <button
              onClick={() => setTheme('light')}
              className="w-full px-4 py-2 bg-token-primary text-white rounded-lg hover:bg-token-primary-hover transition-colors"
            >
              Set Light Theme
            </button>
            <button
              onClick={() => setTheme('dark')}
              className="w-full px-4 py-2 bg-token-primary text-white rounded-lg hover:bg-token-primary-hover transition-colors"
            >
              Set Dark Theme
            </button>
            <button
              onClick={() => setTheme('system')}
              className="w-full px-4 py-2 bg-token-primary text-white rounded-lg hover:bg-token-primary-hover transition-colors"
            >
              Set System Theme
            </button>
          </div>
        </div>

        <div className="p-6 bg-token-surface border border-token-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Custom Theme Controls</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                const testTheme = {
                  name: 'Test Theme',
                  category: 'test',
                  isOfficial: true,
                  variables: {
                    '--color-primary': '#ff0000',
                    '--color-accent': '#00ff00',
                    '--color-bg': '#f0f0f0',
                    '--color-surface': '#ffffff',
                  }
                };
                setCustomTheme(testTheme);
              }}
              className="w-full px-4 py-2 bg-token-primary text-white rounded-lg hover:bg-token-primary-hover transition-colors"
            >
              Apply Test Theme
            </button>
            <button
              onClick={clearCustomTheme}
              className="w-full px-4 py-2 bg-token-error text-white rounded-lg hover:bg-token-error-hover transition-colors"
            >
              Clear Custom Theme
            </button>
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 bg-token-warning text-white rounded-lg hover:bg-token-warning-hover transition-colors"
            >
              Clear All Themes
            </button>
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-token-surface border border-token-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Export Theme Data</h2>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 bg-token-primary text-white rounded-lg hover:bg-token-primary-hover transition-colors mb-4"
          >
            Export Theme Data
          </button>
          {exportData && (
            <textarea
              value={exportData}
              readOnly
              className="w-full h-32 p-2 bg-token-surface-subtle border border-token-border rounded-lg text-sm font-mono"
            />
          )}
        </div>

        <div className="p-6 bg-token-surface border border-token-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Import Theme Data</h2>
          <textarea
            value={exportData}
            onChange={(e) => setExportData(e.target.value)}
            placeholder="Paste exported theme data here..."
            className="w-full h-32 p-2 bg-token-surface-subtle border border-token-border rounded-lg text-sm font-mono mb-4"
          />
          <button
            onClick={handleImport}
            disabled={!exportData}
            className="w-full px-4 py-2 bg-token-primary text-white rounded-lg hover:bg-token-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Theme Data
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-6 bg-token-surface border border-token-border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <pre className="bg-token-surface-subtle p-4 rounded-lg text-sm font-mono overflow-auto">
          {JSON.stringify(themeInfo, null, 2)}
        </pre>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-token-surface-accent border border-token-border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-token-text-secondary">
          <li>Apply a custom theme from the theme picker</li>
          <li>Refresh the page - the theme should persist</li>
          <li>Change the base theme (light/dark/system) - custom theme should remain</li>
          <li>Clear the custom theme - it should be removed from storage</li>
          <li>Export theme data and import it on another device/browser</li>
        </ol>
      </div>
    </div>
  );
} 