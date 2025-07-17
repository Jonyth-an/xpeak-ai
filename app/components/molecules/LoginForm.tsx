"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';
import { rateLimiter, RATE_LIMIT_CONFIGS } from "@/lib/rateLimiter";
import { Card, Input, Button, Text } from "../ui";
import { signInWithOAuthWithPKCE } from "@/lib/pkceUtils";

export interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function LoginForm({
  onSubmit,
  onSuccess,
  onError,
}: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    resetTime: Date;
    isBlocked: boolean;
    retryAfter?: number;
  } | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUnverifiedEmail(null);
    setRateLimitStatus(null);

    const form = e.currentTarget as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit({ email, password });
      }

      // Sign in with Supabase
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        // Check if the error is due to unverified email
        if (
          signInError.message.includes("Email not confirmed") ||
          signInError.message.includes("Email not verified")
        ) {
          setUnverifiedEmail(email);
          setError("Please verify your email address before signing in.");
          // Load rate limit status for this email
          await loadRateLimitStatus(email);
        } else {
          throw signInError;
        }
        return;
      }

      // Check if user's email is verified
      if (data.user && !data.user.email_confirmed_at) {
        setUnverifiedEmail(email);
        setError("Please verify your email address before signing in.");
        // Load rate limit status for this email
        await loadRateLimitStatus(email);
        return;
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.user);
      }

      // Redirect to home page
      router.push("/");
      console.log("Login successful:", data.user);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRateLimitStatus = async (email: string) => {
    try {
      const status = await rateLimiter.getRateLimitStatus(
        email,
        "email_resend",
        RATE_LIMIT_CONFIGS.emailResend
      );
      setRateLimitStatus(status);
    } catch (error) {
      console.error("Error loading rate limit status:", error);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check rate limit before sending
      const rateLimitResult = await rateLimiter.checkRateLimit(
        unverifiedEmail,
        "email_resend",
        RATE_LIMIT_CONFIGS.emailResend
      );

      if (!rateLimitResult.allowed) {
        setError(
          rateLimitResult.message ||
            "Rate limit exceeded. Please try again later."
        );
        setRateLimitStatus({
          remaining: 0,
          resetTime: rateLimitResult.resetTime,
          isBlocked: true,
          retryAfter: rateLimitResult.retryAfter,
        });
        return;
      }

      // Also check per-minute limit
      const minuteLimitResult = await rateLimiter.checkRateLimit(
        unverifiedEmail,
        "email_resend_per_minute",
        RATE_LIMIT_CONFIGS.emailResendPerMinute
      );

      if (!minuteLimitResult.allowed) {
        setError("Please wait 1 minute before requesting another email.");
        return;
      }

      // Send the email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unverifiedEmail,
      });

      if (error) {
        throw error;
      }

      // Record successful attempt
      await rateLimiter.recordAttempt(unverifiedEmail, "email_resend");
      await rateLimiter.recordAttempt(
        unverifiedEmail,
        "email_resend_per_minute"
      );

      setError("Verification email sent! Please check your inbox.");
      setUnverifiedEmail(null);
      setRateLimitStatus(null);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToVerification = () => {
    router.push("/verify-email");
  };

  const getRateLimitMessage = () => {
    if (!rateLimitStatus) return null;

    if (rateLimitStatus.isBlocked) {
      const minutes = rateLimitStatus.retryAfter
        ? Math.ceil(rateLimitStatus.retryAfter / 60)
        : 15;
      return `Rate limit exceeded. Try again in ${minutes} minutes.`;
    }

    if (rateLimitStatus.remaining <= 2) {
      return `${rateLimitStatus.remaining} resend${
        rateLimitStatus.remaining === 1 ? "" : "s"
      } remaining this hour.`;
    }

    return null;
  };

  const isResendDisabled = () => {
    return isLoading || (rateLimitStatus?.isBlocked ?? false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      console.log('🔐 Starting Google OAuth flow with PKCE...');
      console.log('📍 Current origin:', window.location.origin);
      console.log('📍 Redirect URL:', `${window.location.origin}/auth/callback`);
      console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Try the built-in PKCE flow first, fallback to custom implementation
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          flow: 'pkce',
        } as any,
      });
      
      // If built-in PKCE fails, try custom implementation
      if (error || !data?.url) {
        console.log('🔄 Built-in PKCE failed, trying custom PKCE implementation...');
        const pkceResult = await signInWithOAuthWithPKCE(
          supabase,
          "google",
          `${window.location.origin}/auth/callback`
        );
        data = pkceResult.data;
        error = pkceResult.error;
      }
      
      console.log('🔐 OAuth response:', { data, error });
      
      if (error) {
        console.error('❌ OAuth error:', error);
        setError(error.message || "Google sign-in failed");
        setIsGoogleLoading(false);
      } else {
        console.log('✅ OAuth initiated successfully');
        console.log('🔗 OAuth URL:', data?.url);
        console.log('📋 User should be redirected to Google');
        
        // Log the full OAuth URL for debugging
        if (data?.url) {
          console.log('🔍 Full OAuth URL:', data.url);
          const url = new URL(data.url);
          console.log('🔍 OAuth URL params:', {
            client_id: url.searchParams.get('client_id'),
            redirect_uri: url.searchParams.get('redirect_uri'),
            response_type: url.searchParams.get('response_type'),
            scope: url.searchParams.get('scope'),
            state: url.searchParams.get('state'),
            code_challenge: url.searchParams.get('code_challenge') ? 'present' : 'missing',
            code_challenge_method: url.searchParams.get('code_challenge_method'),
          });
        }
      }
      // Note: If successful, the user will be redirected to Google
      // and then back to /auth/callback, so we don't need to handle
      // the success case here
    } catch (err: any) {
      console.error('❌ OAuth exception:', err);
      setError(err.message || "Google sign-in failed");
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true);
    setError(null);
    try {
      console.log('📘 Starting Facebook OAuth flow...');
      console.log('📍 Current origin:', window.location.origin);
      console.log('📍 Redirect URL:', `${window.location.origin}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
          },
        },
      });
      
      console.log('📘 Facebook OAuth response:', { data, error });
      
      if (error) {
        console.error('❌ Facebook OAuth error:', error);
        setError(error.message || "Facebook sign-in failed");
        setIsFacebookLoading(false);
      } else {
        console.log('✅ Facebook OAuth initiated successfully');
        console.log('🔗 Facebook OAuth URL:', data?.url);
        
        // Log the full OAuth URL for debugging
        if (data?.url) {
          console.log('🔍 Full Facebook OAuth URL:', data.url);
          const url = new URL(data.url);
          console.log('🔍 Facebook OAuth URL params:', {
            client_id: url.searchParams.get('client_id'),
            redirect_uri: url.searchParams.get('redirect_uri'),
            response_type: url.searchParams.get('response_type'),
            scope: url.searchParams.get('scope'),
            state: url.searchParams.get('state'),
            code_challenge: url.searchParams.get('code_challenge') ? 'present' : 'missing',
            code_challenge_method: url.searchParams.get('code_challenge_method'),
          });
        }
      }
    } catch (err: any) {
      console.error('❌ Facebook OAuth exception:', err);
      setError(err.message || "Facebook sign-in failed");
      setIsFacebookLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto rounded-token-lg shadow-token-lg">
      <form onSubmit={handleSubmit} className="space-y-token-lg">
        {/* Google Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-token-sm"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-token-text-muted mr-token-sm"></div>
              Signing in with Google...
            </div>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                className="mr-token-sm"
                aria-hidden="true"
              >
                <g>
                  <path
                    fill="#4285F4"
                    d="M43.611 20.083H42V20H24v8h11.303C33.972 32.833 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.803 0 5.377.99 7.409 2.626l6.591-6.591C34.583 5.14 29.617 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20c11.045 0 19.799-7.954 19.799-19 0-1.27-.138-2.507-.377-3.717z"
                  />
                  <path
                    fill="#34A853"
                    d="M6.306 14.691l6.571 4.819C14.655 16.104 19.001 13 24 13c2.803 0 5.377.99 7.409 2.626l6.591-6.591C34.583 5.14 29.617 3 24 3c-7.732 0-14.41 4.41-17.694 10.691z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M24 43c5.356 0 9.86-1.797 13.146-4.888l-6.066-4.966C29.418 36 24 36 24 36c-5.418 0-9.972-3.167-11.303-8.083l-6.591 6.591C9.59 40.59 16.268 45 24 45z"
                  />
                  <path
                    fill="#EA4335"
                    d="M43.611 20.083H42V20H24v8h11.303C34.418 32.833 29.418 36 24 36c-5.418 0-9.972-3.167-11.303-8.083l-6.591 6.591C9.59 40.59 16.268 45 24 45c7.732 0 14.41-4.41 17.694-10.691z"
                  />
                </g>
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Facebook Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-token-sm"
          onClick={handleFacebookLogin}
          disabled={isFacebookLoading || isLoading}
        >
          {isFacebookLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-token-text-muted mr-token-sm"></div>
              Signing in with Facebook...
            </div>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="mr-token-sm"
                aria-hidden="true"
              >
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Continue with Facebook
            </>
          )}
        </Button>
        
        {/* Divider */}
        <div className="flex items-center my-token-sm">
          <div className="flex-grow border-t border-token-border"></div>
          <span className="mx-token-sm text-token-text-muted text-token-xs">or</span>
          <div className="flex-grow border-t border-token-border"></div>
        </div>
        
        {error && (
          <div className="bg-token-error-surface border border-token-error text-token-error px-token-md py-token-md rounded-token-lg text-token-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-token-sm font-token-medium text-token-text-secondary mb-token-xs"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="mb-token-lg">
          <label
            htmlFor="password"
            className="block text-token-sm font-token-medium text-token-text-secondary mb-token-xs"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-token-sm"></div>
              Signing In...
            </div>
          ) : (
            "Log In"
          )}
        </Button>

        {/* Unverified email actions */}
        {unverifiedEmail && (
          <div className="bg-token-warning-surface border border-token-warning rounded-token-lg p-token-md space-y-token-md">
            <Text variant="small" className="text-token-warning font-token-medium">
              Email verification required
            </Text>

            {getRateLimitMessage() && (
              <div className="bg-token-warning-surface-light border border-token-warning text-token-warning px-token-md py-token-sm rounded-token-lg text-token-sm">
                {getRateLimitMessage()}
              </div>
            )}

            <div className="flex flex-col space-y-token-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResendDisabled()}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Resend Verification Email"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGoToVerification}
                className="w-full"
              >
                Go to Verification Page
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mt-token-sm">
          <a
            href="/password-reset"
            className="text-token-sm text-token-text-secondary hover:text-token-primary underline transition-colors"
          >
            Forgot your password?
          </a>
        </div>
        
        <div className="text-center mt-token-sm">
          <span className="text-token-sm text-token-text-secondary">
            Don't have an account?{" "}
          </span>
          <a
            href="/signup"
            className="text-token-sm text-token-primary hover:underline transition-colors"
          >
            Sign up
          </a>
        </div>
      </form>
    </Card>
  );
}
