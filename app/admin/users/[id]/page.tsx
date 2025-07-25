'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../../../components/Layout';
import { Card, Button, Text } from '@/app/components/ui';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '../../AdminLayout';
import { Tabs } from '@/app/components/ui/Navigation';

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
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
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
  stripe_price_id?: string;
}

interface Invoice {
  id: string;
  number?: string;
  created: number;
  amount_paid: number;
  status: string;
  hosted_invoice_url?: string;
  subscription?: string;
  lines?: {
    data: Array<{
      price?: {
        id: string;
        interval?: string;
      };
      subscription?: string;
    }>;
  };
}

interface Conversation {
  id: string;
  type: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  unread_count: number;
  last_read_at: string;
  other_participant: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
  } | null;
  user_role: string;
  last_message: {
    message: string;
    created_at: string;
    sender_id: string;
  } | null;
}

const AVAILABLE_ROLES = ['admin', 'tutor', 'reviewer', 'marketer'];

export default function StudentDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [addRole, setAddRole] = useState('');
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchUserRoles();
    }
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    if (userId && activeTab === 'messages') {
      fetchConversations();
    }
  }, [userId, activeTab]);

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`/api/admin/users/${userId}/conversations`, {
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`/api/admin/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

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

  async function fetchUserRoles() {
    setRolesLoading(true);
    setRoleError(null);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    if (!error && data) {
      setUserRoles(data.map((r: { role: string }) => r.role.toLowerCase()));
    } else {
      setUserRoles([]);
      setRoleError('Failed to fetch roles');
    }
    setRolesLoading(false);
  }

  async function handleAddRole() {
    if (!addRole) return;
    setRoleActionLoading(true);
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: addRole.toLowerCase() }]);
    setRoleActionLoading(false);
    setAddRole('');
    fetchUserRoles();
  }

  async function handleRemoveRole(role: string) {
    setRoleActionLoading(true);
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role.toLowerCase());
    setRoleActionLoading(false);
    fetchUserRoles();
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-accent"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-token-error">
              User Not Found
            </Text>
            <Text variant="body" className="text-token-secondary mb-6">
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

  const meta = (user.user_metadata as Record<string, unknown>) || {};

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface">
        <div className="max-w-[1100px] mx-auto px-token-4 sm:px-token-8 lg:px-token-12 py-token-10 space-y-token-10">
          <div className="flex items-center justify-between mb-token-4">
            <div>
              <Text variant="h1" as="h1" className="mb-token-2 text-token-primary">
                Student Details
              </Text>
              <Text variant="lead" className="text-token-secondary">
                View and manage user profile, preferences, and subscription
              </Text>
            </div>
            <Link href="/admin/users">
              <Button variant="secondary">← Back</Button>
            </Link>
          </div>

          {/* Tabs Bar */}
          <Tabs
            items={[
              { label: 'Overview', value: 'overview' },
              { label: 'Learning Preferences', value: 'preferences' },
              { label: 'Subscription', value: 'subscription' },
              { label: 'Roles & Access', value: 'roles' },
              { label: 'Account Actions', value: 'actions' },
              { label: 'Payment History', value: 'payments' },
              { label: 'Messages', value: 'messages' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            variant="default"
            size="md"
            className="mb-token-8"
          />

          {/* Tab Panels */}
          {activeTab === 'overview' && (
            <Card className="p-token-8 mb-token-4 bg-token-elevated border border-token">
              {/* Profile Overview content */}
              <div className="flex items-center gap-token-8">
                <Image
                  src={(meta.avatar_url as string) || (meta.picture as string) || '/images/default-avatar.svg'}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full border border-token object-cover"
                />
                <div>
                  <Text variant="h2" as="h2" className="mb-token-1 text-token-primary">
                    {(meta.full_name as string) || (meta.name as string) || user.email}
                  </Text>
                  <div className="text-token-accent mb-token-1">{user.email}</div>
                  <div className="flex gap-token-2 mb-token-1 flex-wrap">
                    {user.email_confirmed_at ? (
                      <span className="px-token-2 py-token-1 text-xs rounded bg-token-success/20 text-token-success">Email Verified</span>
                    ) : (
                      <span className="px-token-2 py-token-1 text-xs rounded bg-token-warning/20 text-token-warning">Email Not Verified</span>
                    )}
                    {(meta.phone_verified as boolean) ? (
                      <span className="px-token-2 py-token-1 text-xs rounded bg-token-success/20 text-token-success">Phone Verified</span>
                    ) : (
                      <span className="px-token-2 py-token-1 text-xs rounded bg-token-secondary/10 text-token-secondary">Phone Not Verified</span>
                    )}
                  </div>
                  <div className="text-xs text-token-tertiary mb-token-1">User ID: {user.id}</div>
                  <div className="text-xs text-token-tertiary mb-token-1">Joined: {new Date(user.created_at).toLocaleString()}</div>
                  <div className="text-xs text-token-tertiary">Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card className="p-token-8 mb-token-4 bg-token-elevated border border-token">
              {/* Learning Preferences content */}
              <Text variant="h3" as="h3" className="mb-token-4 text-token-primary">Learning Preferences</Text>
              <div className="mb-token-3">
                <b>Current Level:</b> <span className="text-token-success">{typeof meta.current_level === 'string' && meta.current_level ? meta.current_level : 'N/A'}</span>
              </div>
              <div className="mb-token-3">
                <b>Preferred Languages:</b>{' '}
                {Array.isArray(meta.preferred_languages) && meta.preferred_languages.length > 0 ? (
                  meta.preferred_languages.map((lang: string) => (
                    <span key={lang} className="inline-block px-token-2 py-token-1 mr-token-2 mb-token-1 rounded bg-token-info/20 text-token-link text-xs font-medium">
                      {LANGUAGE_MAP[lang.toUpperCase()] || lang}
                    </span>
                  ))
                ) : (
                  <span className="text-token-tertiary">None</span>
                )}
              </div>
              <div className="mb-token-3">
                <b>Learning Goals:</b>
                {Array.isArray(meta.learning_goals) && meta.learning_goals.length > 0 ? (
                  <ul className="list-disc list-inside mt-token-1 ml-token-4 text-token-secondary">
                    {meta.learning_goals.map((goal: string) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-token-tertiary ml-token-2">None</span>
                )}
              </div>
              <div className="mb-token-2">
                <b>Topic Interests:</b>{' '}
                {Array.isArray(meta.topic_interests) && meta.topic_interests.length > 0 ? (
                  meta.topic_interests.map((topic: string) => (
                    <span key={topic} className="inline-block px-token-2 py-token-1 mr-token-2 mb-token-1 rounded bg-token-accent/20 text-token-accent text-xs font-medium">
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-token-tertiary">None</span>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'subscription' && (
            <Card className="p-token-8 mb-token-4 bg-token-elevated border border-token">
              {/* Subscription content */}
              <Text variant="h3" as="h3" className="mb-token-4 text-token-primary">Subscription</Text>
              {subscription ? (
                <>
                  {/* Current Plan mapping logic */}
                  {(() => {
                    const priceToPlanName: Record<string, string> = {
                      'price_1RessSFM2iXH8TuN4U2vQz9E': 'Xpeak Plus',
                      'price_1Ret11FM2iXH8TuNdLCrRIxK': 'Xpeak Plus',
                      'price_1Ret1bFM2iXH8TuNClhnN7c2': 'Xpeak Plus',
                      'price_1Rest1FM2iXH8TuNKvbhbeTG': 'Xpeak Pro',
                      'price_1Ret29FM2iXH8TuNKl7fICBr': 'Xpeak Pro',
                      'price_1Ret2RFM2iXH8TuNYQIQk9BU': 'Xpeak Pro',
                    };
                    let priceId = subscription?.stripe_price_id;
                    if (!priceId && subscription?.plan_features && Array.isArray(subscription.plan_features)) {}
                    if (!priceId && subscription.stripe_subscription_id === 'sub_1RfBGoFM2iXH8TuNtp2xgSri') {
                      priceId = 'price_1RessSFM2iXH8TuN4U2vQz9E';
                    }
                    const planName = priceToPlanName[priceId || ''] || 'Unknown';
                    return (
                      <div className="mb-token-2"><b>Current Plan:</b> {planName}</div>
                    );
                  })()}
                  <div className="mb-token-2"><b>Status:</b> {subscription.status}</div>
                  <div className="mb-token-2"><b>Stripe Subscription ID:</b> {subscription.stripe_subscription_id}</div>
                  <div className="mb-token-2"><b>Created:</b> {new Date(subscription.created_at).toLocaleString()}</div>
                  {subscription.updated_at && (
                    <div className="mb-token-2"><b>Updated:</b> {new Date(subscription.updated_at).toLocaleString()}</div>
                  )}
                  {subscription.billing_cycle && (
                    <div className="mb-token-2"><b>Billing Cycle:</b> {subscription.billing_cycle}</div>
                  )}
                  {subscription.plan_features && subscription.plan_features.length > 0 && (
                    <div className="mb-token-2"><b>Plan Features:</b> {subscription.plan_features.join(', ')}</div>
                  )}
                  {subscription.total_amount_paid !== undefined && (
                    <div className="mb-token-2"><b>Total Paid:</b> ${(subscription.total_amount_paid / 100).toFixed(2)}</div>
                  )}
                  {subscription.last_payment_date && (
                    <div className="mb-token-2"><b>Last Payment:</b> {new Date(subscription.last_payment_date).toLocaleString()}</div>
                  )}
                  {subscription.next_billing_date && (
                    <div className="mb-token-2"><b>Next Billing:</b> {new Date(subscription.next_billing_date).toLocaleString()}</div>
                  )}
                </>
              ) : (
                <div className="text-token-tertiary">No subscription found.</div>
              )}
            </Card>
          )}

          {activeTab === 'roles' && (
            <Card className="p-token-8 mb-token-4 bg-token-elevated border border-token">
              {/* Roles & Access content */}
              <Text variant="h3" as="h3" className="mb-token-4 text-token-primary">Roles & Access</Text>
              {rolesLoading ? (
                <div className="text-token-secondary">Loading roles...</div>
              ) : roleError ? (
                <div className="text-token-error">{roleError}</div>
              ) : (
                <div className="mb-token-4 flex flex-wrap gap-2">
                  {userRoles.length === 0 && <span className="text-token-tertiary">No roles assigned.</span>}
                  {userRoles.map(role => (
                    <span key={role} className="inline-flex items-center bg-token-info/20 text-token-info px-2 py-1 rounded text-xs mr-2 mb-1">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                      <button
                        className="ml-1 text-red-500 hover:text-red-700"
                        disabled={roleActionLoading}
                        onClick={() => handleRemoveRole(role)}
                        title="Remove role"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={addRole}
                  onChange={e => setAddRole(e.target.value)}
                  disabled={roleActionLoading || AVAILABLE_ROLES.filter(r => !userRoles.includes(r)).length === 0}
                >
                  <option value="">Add role...</option>
                  {AVAILABLE_ROLES.filter(r => !userRoles.includes(r)).map(role => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!addRole || roleActionLoading || AVAILABLE_ROLES.filter(r => !userRoles.includes(r)).length === 0}
                  onClick={handleAddRole}
                >
                  Add
                </Button>
                {AVAILABLE_ROLES.filter(r => !userRoles.includes(r)).length === 0 ? (
                  <span className="text-token-tertiary text-xs ml-2">All roles assigned</span>
                ) : null}
              </div>
            </Card>
          )}

          {activeTab === 'actions' && (
            <Card className="p-token-8 mb-token-4 bg-token-elevated border border-token">
              {/* Account Actions content */}
              <Text variant="h3" as="h3" className="mb-token-2 text-token-primary">Account Actions</Text>
              <div className="flex gap-token-4 flex-wrap">
                <Button variant="secondary" disabled>Reset Password</Button>
                <Button variant="secondary" disabled>Suspend Account</Button>
                <Button variant="secondary" disabled>Email User</Button>
              </div>
              <div className="text-xs text-token-tertiary mt-token-2">(Actions coming soon)</div>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card className="p-token-8 mb-token-4 bg-token-elevated border border-token">
              {/* Payment History content */}
              <Text variant="h3" as="h3" className="mb-token-4 text-token-primary">Payment History</Text>
              <PaymentHistoryTable userEmail={user.email} />
            </Card>
          )}

          {activeTab === 'messages' && (
            <div className="flex h-[600px] bg-token-surface border border-token-surface-alt rounded-lg overflow-hidden">
              {/* Left Panel - Conversation List */}
              <div className="w-1/3 border-r border-token-surface-alt bg-token-surface-subtle">
                <div className="p-4 border-b border-token-surface-alt">
                  <Text variant="h3" as="h3" className="text-token-primary">Conversations</Text>
                </div>
                
                <div className="overflow-y-auto h-full">
                  {conversationsLoading ? (
                    <div className="p-4 text-token-secondary">Loading conversations...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-token-tertiary">No conversations found.</div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conversation) => (
                        <div 
                          key={conversation.id} 
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id 
                              ? 'bg-token-primary text-white' 
                              : 'hover:bg-token-surface-alt'
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            fetchMessages(conversation.id);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-token-surface-alt flex items-center justify-center flex-shrink-0">
                              {conversation.other_participant?.avatar_url ? (
                                <Image
                                  src={conversation.other_participant.avatar_url}
                                  alt={conversation.other_participant.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-token-primary text-white flex items-center justify-center text-sm font-semibold">
                                  {conversation.other_participant?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold truncate ${
                                selectedConversation?.id === conversation.id 
                                  ? 'text-white' 
                                  : 'text-token-text-primary'
                              }`}>
                                {conversation.other_participant?.name || 'Unknown User'}
                              </div>
                              <div className={`text-xs truncate ${
                                selectedConversation?.id === conversation.id 
                                  ? 'text-white/80' 
                                  : 'text-token-text-secondary'
                              }`}>
                                {conversation.other_participant?.role === 'tutor' ? 'Tutor' : 'Student'}
                              </div>
                              {conversation.last_message && (
                                <div className={`text-xs truncate mt-1 ${
                                  selectedConversation?.id === conversation.id 
                                    ? 'text-white/70' 
                                    : 'text-token-text-muted'
                                }`}>
                                  {conversation.last_message.message.length > 30 
                                    ? conversation.last_message.message.substring(0, 30) + '...'
                                    : conversation.last_message.message
                                  }
                                </div>
                              )}
                            </div>
                            {conversation.unread_count > 0 && (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                selectedConversation?.id === conversation.id 
                                  ? 'bg-white text-token-primary' 
                                  : 'bg-token-primary text-white'
                              }`}>
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Chat Messages */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-token-surface-alt bg-token-surface-subtle">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-token-surface-alt flex items-center justify-center">
                          {selectedConversation.other_participant?.avatar_url ? (
                            <Image
                              src={selectedConversation.other_participant.avatar_url}
                              alt={selectedConversation.other_participant.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-token-primary text-white flex items-center justify-center text-xs font-semibold">
                              {selectedConversation.other_participant?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-token-text-primary">
                            {selectedConversation.other_participant?.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-token-text-secondary">
                            {selectedConversation.other_participant?.role === 'tutor' ? 'Tutor' : 'Student'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {messagesLoading ? (
                        <div className="text-center text-token-text-muted">
                          Loading messages...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-token-text-muted">
                          No messages in this conversation.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {messages.map((message) => {
                            const isTutorMessage = message.sender_id === selectedConversation.other_participant?.id && selectedConversation.other_participant?.role === 'tutor';
                            const isStudentMessage = message.sender_id === userId || (selectedConversation.other_participant?.role === 'student' && message.sender_id === selectedConversation.other_participant?.id);
                            const isRightAligned = isStudentMessage;
                            return (
                              <div key={message.id}>
                                {/* Centered timestamp */}
                                <div className="flex justify-center mb-1">
                                  <span className="text-xs text-token-text-muted">
                                    {new Date(message.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className={`flex items-start space-x-3 ${isRightAligned ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  {/* Avatar and Name */}
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-token-surface-alt flex items-center justify-center">
                                      {message.sender_avatar ? (
                                        <Image
                                          src={message.sender_avatar}
                                          alt={message.sender_name}
                                          width={32}
                                          height={32}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-token-primary text-white flex items-center justify-center text-xs font-semibold">
                                          {message.sender_name?.charAt(0) || 'U'}
                                        </div>
                                      )}
                                    </div>
                                    {/* Name next to avatar, right for student, left for tutor */}
                                    <span className={`mt-1 text-xs font-semibold text-token-text-primary ${isRightAligned ? 'text-right' : 'text-left'}`}>{message.sender_name}</span>
                                  </div>
                                  {/* Message bubble */}
                                  <div className={`flex-1 min-w-0 ${isRightAligned ? 'text-right' : ''}`}>                                  
                                    <div className={`rounded-lg p-3 ${
                                      isRightAligned 
                                        ? 'bg-token-primary text-white' 
                                        : 'bg-token-surface-subtle'
                                    }`}>
                                      {message.message_type === 'file' && message.file_url ? (
                                        <div className="flex items-center space-x-2">
                                          <div className="w-4 h-4 text-token-text-muted">
                                            📎
                                          </div>
                                          <a
                                            href={message.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-sm hover:underline ${
                                              isRightAligned ? 'text-white' : 'text-token-primary'
                                            }`}
                                          >
                                            {message.file_name || 'Shared File'} 
                                            {message.file_size && ` (${(message.file_size / 1024 / 1024).toFixed(2)} MB)`}
                                          </a>
                                        </div>
                                      ) : (
                                        <p className={`text-sm whitespace-pre-wrap ${
                                          isRightAligned ? 'text-white' : 'text-token-text-primary'
                                        }`}>
                                          {message.message}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-token-text-muted">
                      <div className="text-lg font-semibold mb-2">Select a conversation</div>
                      <div className="text-sm">Choose a conversation from the list to view messages</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


    </AdminLayout>
  );
}

function PaymentHistoryTable({ userEmail }: { userEmail: string }) {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices';
        setError(errorMessage);
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

  if (loading) return <div className="text-token-secondary">Loading payment history...</div>;
  if (error) return <div className="text-token-error">{error}</div>;
  if (!invoices.length) return <div className="text-token-tertiary">No payment history found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-token text-sm">
        <thead>
          <tr className="bg-token-surface">
            <th className="px-4 py-2 border-b border-token text-token-primary">Invoice</th>
            <th className="px-4 py-2 border-b border-token text-token-primary">Payment Date</th>
            <th className="px-4 py-2 border-b border-token text-token-primary">Subscription Plan</th>
            <th className="px-4 py-2 border-b border-token text-token-primary">Plan Duration</th>
            <th className="px-4 py-2 border-b border-token text-token-primary">Payment Amount</th>
            <th className="px-4 py-2 border-b border-token text-token-primary">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.filter(inv => inv.status === 'paid').map(inv => {
            let planName = 'Unknown';
            let planDuration = 'Unknown';
            // Use first paid line item for plan mapping
            const line = inv.lines && inv.lines.data && inv.lines.data.length > 0 ? inv.lines.data[0] : null;
            // Try to get connected subscription from invoice.subscription or line.subscription
            const connectedSubscription = inv.subscription || (line && line.subscription);
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
              <tr key={inv.id} className="bg-token-surface">
                <td className="px-4 py-2 border-b border-token">
                  {inv.hosted_invoice_url ? (
                    <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-token-link underline">
                      {inv.number || inv.id}
                    </a>
                  ) : (
                    inv.number || inv.id
                  )}
                </td>
                <td className="px-4 py-2 border-b border-token">{new Date(inv.created * 1000).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b border-token">{planName}</td>
                <td className="px-4 py-2 border-b border-token">{planDuration}</td>
                <td className="px-4 py-2 border-b border-token">${(inv.amount_paid / 100).toFixed(2)}</td>
                <td className="px-4 py-2 border-b border-token text-token-success font-semibold">Paid</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 