'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const availableLanguages: Language[] = [
  { code: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'FR', name: 'French', flag: '🇫🇷' },
  { code: 'DE', name: 'German', flag: '🇩🇪' },
  { code: 'IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'PT', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'ZH', name: 'Chinese', flag: '🇨🇳' },
  { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
  { code: 'KO', name: 'Korean', flag: '🇰🇷' },
  { code: 'AR', name: 'Arabic', flag: '🇸🇦' },
  { code: 'HI', name: 'Hindi', flag: '🇮🇳' }
];

export default function LanguagePreferences() {
  const { user } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user's language preferences
  useEffect(() => {
    if (user) {
      const userLanguages = user.user_metadata?.preferred_languages || [];
      setSelectedLanguages(userLanguages);
    }
  }, [user]);

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageCode)) {
        return prev.filter(lang => lang !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          preferred_languages: selectedLanguages
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Language preferences updated successfully!' });
    } catch (error) {
      console.error('Error updating language preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update language preferences. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const userLanguages = user?.user_metadata?.preferred_languages || [];
    setSelectedLanguages(userLanguages);
    setMessage(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Learning Preferences</h3>
              <p className="text-sm text-gray-600">Choose the languages you want to learn and practice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Language Selection Grid */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Available Languages</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageToggle(language.code)}
                className={`p-4 rounded-xl border transition-all duration-200 text-left group ${
                  selectedLanguages.includes(language.code)
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{language.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{language.name}</div>
                    <div className="text-xs text-gray-500">{language.code}</div>
                  </div>
                  {selectedLanguages.includes(language.code) && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedLanguages.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Selected Languages ({selectedLanguages.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map((langCode) => {
                const language = availableLanguages.find(lang => lang.code === langCode);
                return (
                  <span
                    key={langCode}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {language?.flag} {language?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Preferences
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset to Original
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-gray-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">How it works</h4>
              <p className="text-sm text-gray-600">
                Select the languages you want to learn. We'll personalize your learning experience and recommend content based on your preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 