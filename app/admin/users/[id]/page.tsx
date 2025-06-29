'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../../components/Layout';
import { Card, Button, Text } from '@/app/components/ui';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AdminLayout from '../../AdminLayout';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LANGUAGE_MAP: Record<string, string> = {
  EN: 'English',
  ES: 'Spanish',
  FR: 'French',
  DE: 'German',
  ZH: 'Chinese',
  JA: 'Japanese',
  KO: 'Korean',
  IT: 'Italian',
  PT: 'Portuguese',
  RU: 'Russian',
  AR: 'Arabic',
  HI: 'Hindi',
  // Add more as needed
};

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata: any;
  app_metadata: any;
}

interface UserSubscription {
  user_email: string;
  status: string;
  stripe_subscription_id: string;
  created_at: string;
  updated_at?: string;
  plan_features?: string[];
  billing_cycle?: string;
  total_amount_paid?: number;
  last_payment_date?: string;
  next_billing_date?: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // Fetch user from admin API
      const session = await supabase.auth.getSession();
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
        setSubscription(data.subscription || null);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-red-600">
              User Not Found
            </Text>
            <Text variant="body" className="text-gray-600 mb-6">
              The user you are looking for does not exist.
            </Text>
            <Link href="/admin/users">
              <Button variant="primary">
                Back to User Management
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const meta = user.user_metadata || {};

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Text variant="h1" as="h1" className="mb-2">
                Student Details
              </Text>
              <Text variant="lead" className="text-gray-600">
                View and manage user profile, preferences, and subscription
              </Text>
            </div>
            <Link href="/admin/users">
              <Button variant="secondary">← Back</Button>
            </Link>
          </div>

          {/* Profile Overview */}
          <Card className="p-8 mb-4">
            <div className="flex items-center gap-8">
              <img
                src={meta.avatar_url || meta.picture || '/images/default-avatar.svg'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border object-cover"
              />
              <div>
                <Text variant="h2" as="h2" className="mb-1">
                  {meta.full_name || meta.name || user.email}
                </Text>
                <div className="text-gray-600 mb-1">{user.email}</div>
                <div className="flex gap-2 mb-1 flex-wrap">
                  {user.email_confirmed_at ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Email Verified</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Email Not Verified</span>
                  )}
                  {meta.phone_verified ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Phone Verified</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Phone Not Verified</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-1">User ID: {user.id}</div>
                <div className="text-xs text-gray-500 mb-1">Joined: {new Date(user.created_at).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</div>
              </div>
            </div>
          </Card>

          {/* Learning Preferences */}
          <Card className="p-8 mb-4">
            <Text variant="h3" as="h3" className="mb-4">Learning Preferences</Text>
            <div className="mb-3">
              <b>Current Level:</b> {meta.current_level || 'N/A'}
            </div>
            <div className="mb-3">
              <b>Preferred Languages:</b>{' '}
              {Array.isArray(meta.preferred_languages) && meta.preferred_languages.length > 0 ? (
                meta.preferred_languages.map((lang: string) => (
                  <span key={lang} className="inline-block px-2 py-1 mr-2 mb-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                    {LANGUAGE_MAP[lang.toUpperCase()] || lang}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </div>
            <div className="mb-3">
              <b>Learning Goals:</b>
              {Array.isArray(meta.learning_goals) && meta.learning_goals.length > 0 ? (
                <ul className="list-disc list-inside mt-1 ml-4">
                  {meta.learning_goals.map((goal: string) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 ml-2">None</span>
              )}
            </div>
            <div className="mb-2">
              <b>Topic Interests:</b>{' '}
              {Array.isArray(meta.topic_interests) && meta.topic_interests.length > 0 ? (
                meta.topic_interests.map((topic: string) => (
                  <span key={topic} className="inline-block px-2 py-1 mr-2 mb-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </div>
          </Card>

          {/* Subscription */}
          <Card className="p-8 mb-4">
            <Text variant="h3" as="h3" className="mb-4">Subscription</Text>
            {subscription ? (
              <>
                <div className="mb-2"><b>Status:</b> {subscription.status}</div>
                <div className="mb-2"><b>Stripe Subscription ID:</b> {subscription.stripe_subscription_id}</div>
                <div className="mb-2"><b>Created:</b> {new Date(subscription.created_at).toLocaleString()}</div>
                {subscription.updated_at && (
                  <div className="mb-2"><b>Updated:</b> {new Date(subscription.updated_at).toLocaleString()}</div>
                )}
                {subscription.billing_cycle && (
                  <div className="mb-2"><b>Billing Cycle:</b> {subscription.billing_cycle}</div>
                )}
                {subscription.plan_features && subscription.plan_features.length > 0 && (
                  <div className="mb-2"><b>Plan Features:</b> {subscription.plan_features.join(', ')}</div>
                )}
                {subscription.total_amount_paid !== undefined && (
                  <div className="mb-2"><b>Total Paid:</b> ${(subscription.total_amount_paid / 100).toFixed(2)}</div>
                )}
                {subscription.last_payment_date && (
                  <div className="mb-2"><b>Last Payment:</b> {new Date(subscription.last_payment_date).toLocaleString()}</div>
                )}
                {subscription.next_billing_date && (
                  <div className="mb-2"><b>Next Billing:</b> {new Date(subscription.next_billing_date).toLocaleString()}</div>
                )}
              </>
            ) : (
              <div>No subscription found.</div>
            )}
          </Card>

          {/* Account Actions */}
          <Card className="p-8 mb-4">
            <Text variant="h3" as="h3" className="mb-2">Account Actions</Text>
            <div className="flex gap-4 flex-wrap">
              <Button variant="secondary" disabled>Reset Password</Button>
              <Button variant="secondary" disabled>Suspend Account</Button>
              <Button variant="secondary" disabled>Email User</Button>
            </div>
            <div className="text-xs text-gray-400 mt-2">(Actions coming soon)</div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 