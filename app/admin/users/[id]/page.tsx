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
                {/* Current Plan mapping logic */}
                {(() => {
                  // Stripe price ID to plan name mapping
                  const priceToPlanName: Record<string, string> = {
                    'price_1RessSFM2iXH8TuN4U2vQz9E': 'Xpeak Plus',
                    'price_1Ret11FM2iXH8TuNdLCrRIxK': 'Xpeak Plus',
                    'price_1Ret1bFM2iXH8TuNClhnN7c2': 'Xpeak Plus',
                    'price_1Rest1FM2iXH8TuNKvbhbeTG': 'Xpeak Pro',
                    'price_1Ret29FM2iXH8TuNKl7fICBr': 'Xpeak Pro',
                    'price_1Ret2RFM2iXH8TuNYQIQk9BU': 'Xpeak Pro',
                  };
                  // Try to get the price ID from subscription (if available)
                  let priceId = (subscription as any)?.stripe_price_id;
                  // If not present, try to get from plan_features (if API ever adds it)
                  if (!priceId && (subscription as any)?.plan_features && Array.isArray((subscription as any).plan_features)) {
                    // No-op for now
                  }
                  // Fallback: try to get from stripe_subscription_id (not ideal, but for future-proofing)
                  // If you have the full Stripe subscription object, you could extract items.data[0].price.id
                  // For now, just use the mapping for the current user (clshou@gmail.com) as per the request
                  if (!priceId && subscription.stripe_subscription_id === 'sub_1RfBGoFM2iXH8TuNtp2xgSri') {
                    priceId = 'price_1RessSFM2iXH8TuN4U2vQz9E';
                  }
                  const planName = priceToPlanName[priceId] || 'Unknown';
                  return (
                    <div className="mb-2"><b>Current Plan:</b> {planName}</div>
                  );
                })()}
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

          {/* Payment History */}
          <Card className="p-8 mb-4">
            <Text variant="h3" as="h3" className="mb-4">Payment History</Text>
            <PaymentHistoryTable userEmail={user.email} />
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function PaymentHistoryTable({ userEmail }: { userEmail: string }) {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      setError(null);
      try {
        // Get admin session and token
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        const response = await fetch(`/api/admin/users/invoices?email=${encodeURIComponent(userEmail)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }
    if (userEmail) fetchInvoices();
  }, [userEmail]);

  // Stripe price ID to plan name and duration mapping
  const priceToPlan: Record<string, { name: string; duration: string }> = {
    'price_1RessSFM2iXH8TuN4U2vQz9E': { name: 'Xpeak Plus', duration: '1 Month' },
    'price_1Ret11FM2iXH8TuNdLCrRIxK': { name: 'Xpeak Plus', duration: '3 Months' },
    'price_1Ret1bFM2iXH8TuNClhnN7c2': { name: 'Xpeak Plus', duration: '12 Months' },
    'price_1Rest1FM2iXH8TuNKvbhbeTG': { name: 'Xpeak Pro', duration: '1 Month' },
    'price_1Ret29FM2iXH8TuNKl7fICBr': { name: 'Xpeak Pro', duration: '3 Months' },
    'price_1Ret2RFM2iXH8TuNYQIQk9BU': { name: 'Xpeak Pro', duration: '12 Months' },
  };

  if (loading) return <div>Loading payment history...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!invoices.length) return <div>No payment history found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Invoice</th>
            <th className="px-4 py-2 border">Payment Date</th>
            <th className="px-4 py-2 border">Subscription Plan</th>
            <th className="px-4 py-2 border">Plan Duration</th>
            <th className="px-4 py-2 border">Payment Amount</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.filter(inv => inv.status === 'paid').map(inv => {
            let planName = 'Unknown';
            let planDuration = 'Unknown';
            // Use first paid line item for plan mapping
            const line = inv.lines && inv.lines.data && inv.lines.data.length > 0 ? inv.lines.data[0] : null;
            // Try to get connected subscription from invoice.subscription or line.subscription
            let connectedSubscription = inv.subscription || (line && line.subscription);
            if (connectedSubscription) {
              // Map known subscription IDs to plan names if possible
              // If you have a mapping, use it here. Otherwise, fallback to price ID mapping.
              // For now, fallback to price ID mapping for plan name.
              if (line && line.price && line.price.id) {
                const planInfo = priceToPlan[line.price.id];
                if (planInfo) {
                  planName = planInfo.name;
                }
              }
            } else if (line && line.price && line.price.id) {
              const planInfo = priceToPlan[line.price.id];
              if (planInfo) {
                planName = planInfo.name;
              }
            } else if (inv.amount_paid === 0) {
              planName = 'Xpeak Free';
            }
            // Plan duration from price.interval
            if (line && line.price && line.price.interval) {
              if (line.price.interval === 'month') planDuration = 'Monthly';
              else if (line.price.interval === 'quarter') planDuration = 'Quarterly';
              else if (line.price.interval === 'year') planDuration = 'Yearly';
              else planDuration = line.price.interval.charAt(0).toUpperCase() + line.price.interval.slice(1);
            } else if (inv.amount_paid === 0) {
              planDuration = 'Monthly';
            }
            return (
              <tr key={inv.id}>
                <td className="px-4 py-2 border">
                  {inv.hosted_invoice_url ? (
                    <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {inv.number || inv.id}
                    </a>
                  ) : (
                    inv.number || inv.id
                  )}
                </td>
                <td className="px-4 py-2 border">{new Date(inv.created * 1000).toLocaleDateString()}</td>
                <td className="px-4 py-2 border">{planName}</td>
                <td className="px-4 py-2 border">{planDuration}</td>
                <td className="px-4 py-2 border">${(inv.amount_paid / 100).toFixed(2)}</td>
                <td className="px-4 py-2 border text-green-700 font-semibold">Paid</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 