'use client';

import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function PasswordChangeForm() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswords = () => {
    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return false;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowForm(false);
    setMessage(null);
  };

  return (
    <div className="token-surface-primary rounded-xl shadow-sm border token-border-primary overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b token-border-primary token-surface-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 token-accent-light rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold token-text-primary">Password Security</h3>
              <p className="text-sm token-text-secondary">Update your password to keep your account secure</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 token-accent text-white text-sm font-medium rounded-lg hover:token-accent-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-token-accent"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'token-success-light token-border-success token-text-success' 
              : 'token-error-light token-border-error token-text-error'
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

        {/* Password Change Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium token-text-primary mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border token-border-primary rounded-xl token-surface-primary token-text-primary placeholder-token-text-tertiary focus:outline-none focus:ring-2 focus:ring-token-accent focus:border-transparent transition-colors duration-200"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium token-text-primary mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border token-border-primary rounded-xl token-surface-primary token-text-primary placeholder-token-text-tertiary focus:outline-none focus:ring-2 focus:ring-token-accent focus:border-transparent transition-colors duration-200"
                placeholder="Confirm new password"
              />
            </div>

            {/* Password Strength Indicator */}
            {passwords.newPassword && (
              <div className="p-4 token-surface-secondary rounded-xl border token-border-primary">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium token-text-primary">Password Strength</span>
                  <span className={`text-sm font-medium ${
                    passwords.newPassword.length >= 8 ? 'token-success' : 
                    passwords.newPassword.length >= 6 ? 'token-warning' : 'token-error'
                  }`}>
                    {passwords.newPassword.length >= 8 ? 'Strong' : 
                     passwords.newPassword.length >= 6 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="w-full token-surface-tertiary rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwords.newPassword.length >= 8 ? 'token-success' : 
                      passwords.newPassword.length >= 6 ? 'token-warning' : 'token-error'
                    }`}
                    style={{ width: `${Math.min((passwords.newPassword.length / 8) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs token-text-tertiary">
                  Use at least 6 characters for a secure password
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 token-accent text-white text-sm font-medium rounded-xl hover:token-accent-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-token-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Password
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 token-surface-primary token-text-primary text-sm font-medium rounded-xl border token-border-primary hover:token-surface-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-token-border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Security Tips */}
        {!showForm && (
          <div className="mt-6 p-4 token-info-light rounded-xl border token-border-info">
            <div className="flex items-start">
              <svg className="w-5 h-5 token-info-dark mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium token-info-dark mb-1">Security Tips</h4>
                <p className="text-sm token-text-secondary">
                  Use a strong password with at least 6 characters. Consider using a mix of letters, numbers, and symbols for better security.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 