'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Copy, MoreVertical, Trash2, Plus, User, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, Button, Text } from '@/app/components/ui';

interface PrivilegedUser {
  id: string;
  email: string;
  roles: string[];
  avatar_url?: string;
  name?: string;
  uuid?: string;
}

const AVAILABLE_ROLES = ['admin', 'marketer', 'tutor', 'reviewer'];

export default function RoleAccessManagement() {
  const [privilegedUsers, setPrivilegedUsers] = useState<PrivilegedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [debug, setDebug] = useState<any>({});
  const [menuOpenUserId, setMenuOpenUserId] = useState<string | null>(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [roleActionError, setRoleActionError] = useState<string | null>(null);
  const [addRole, setAddRole] = useState('');
  const [pendingRemove, setPendingRemove] = useState<{ userId: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPrivilegedUsers() {
      let debugInfo: any = {};
      console.log('🔍 RoleAccessManagement: Starting fetchPrivilegedUsers');
      
      const PRIVILEGED_ROLES = ['admin', 'marketer', 'tutor approver'];
      console.log('🔍 RoleAccessManagement: Privileged roles to search for:', PRIVILEGED_ROLES);
      console.log('🔍 RoleAccessManagement: Lowercase roles:', PRIVILEGED_ROLES.map(r => r.toLowerCase()));
      
      try {
        // First, test if user_roles table exists and has any data
        console.log('🔍 RoleAccessManagement: Testing user_roles table access...');
        const { data: testData, error: testError } = await supabase
          .from('user_roles')
          .select('*')
          .limit(1);
        
        console.log('🔍 RoleAccessManagement: Test query result:', { testData, testError });
        
        if (testError) {
          console.error('❌ RoleAccessManagement: Cannot access user_roles table:', testError);
          setPrivilegedUsers([]);
          setLoading(false);
          return;
        }

        // First, get all user_roles for privileged roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', PRIVILEGED_ROLES.map(r => r.toLowerCase()));
        debugInfo.roleData = roleData;
        debugInfo.roleError = roleError;
        if (!roleData) debugInfo.roleData = [];

        console.log('🔍 RoleAccessManagement: Role data query result:', { roleData, roleError });
        
        if (roleError) {
          console.error('❌ RoleAccessManagement: Role query error:', roleError);
          setPrivilegedUsers([]);
          setLoading(false);
          return;
        }

        if (!roleData || roleData.length === 0) {
          console.log('🔍 RoleAccessManagement: No role data found');
          setPrivilegedUsers([]);
          setLoading(false);
          return;
        }

        // Get unique user IDs
        const userIds = Array.from(new Set((roleData || []).map(row => row.user_id)));
        debugInfo.userIds = userIds;
        console.log('🔍 RoleAccessManagement: Unique user IDs found:', userIds);

        // Fetch user emails and metadata from admin API endpoint as fallback
        let userEmailMap: Record<string, string> = {};
        let userMetaMap: Record<string, any> = {};
        let adminApiError = null;
        let adminApiData = null;
        try {
          const session = await supabase.auth.getSession();
          const response = await fetch('/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${session.data.session?.access_token}`
            }
          });
          if (response.ok) {
            const adminData = await response.json();
            adminApiData = adminData;
            (adminData.users || []).forEach((user: any) => {
              if (userIds.includes(user.id)) {
                userEmailMap[user.id] = user.email;
                userMetaMap[user.id] = user.user_metadata || {};
              }
            });
          } else {
            adminApiError = `Status: ${response.status}`;
          }
        } catch (apiError) {
          adminApiError = apiError;
        }
        debugInfo.adminApiData = adminApiData;
        debugInfo.adminApiError = adminApiError;

        // Fetch profile data for all privileged users
        let profileMap: Record<string, any> = {};
        let profilesError = null;
        let profilesData = null;
        if (userIds.length > 0) {
          const { data: profiles, error: profilesErrorObj } = await supabase
            .from('profiles')
            .select('id, avatar_url, full_name')
            .in('id', userIds);
          profilesError = profilesErrorObj;
          profilesData = profiles;
          if (!profilesError && profiles) {
            profiles.forEach((profile: any) => {
              profileMap[profile.id] = profile;
            });
          }
        }
        debugInfo.profilesData = profilesData;
        debugInfo.profilesError = profilesError;

        // Combine role data with user emails and profile info
        const userMap: Record<string, PrivilegedUser & { avatar_url?: string; name?: string; email: string; uuid: string; }> = {};
        (roleData || []).forEach((row: any, index: number) => {
          if (!userMap[row.user_id]) {
            const profile = profileMap[row.user_id] || {};
            const meta = userMetaMap[row.user_id] || {};
            const name = profile.full_name || meta.full_name || userEmailMap[row.user_id] || `User ${row.user_id.slice(0, 8)}...`;
            const email = userEmailMap[row.user_id] || '';
            const avatar_url = profile.avatar_url || '';
            userMap[row.user_id] = {
              id: row.user_id,
              uuid: row.user_id,
              email,
              name,
              avatar_url,
              roles: [],
            };
          }
          const role = row.role.toLowerCase();
          userMap[row.user_id].roles.push(role);
        });
        const finalUsers = Object.values(userMap);
        debugInfo.finalUsers = finalUsers;
        setDebug(debugInfo);
        setPrivilegedUsers(finalUsers);
        setLoading(false);
        
        console.log('✅ RoleAccessManagement: fetchPrivilegedUsers completed successfully');
      } catch (err) {
        setDebug({ error: err });
        setPrivilegedUsers([]);
        setLoading(false);
      }
    }
    fetchPrivilegedUsers();
  }, []);

  // Add role to user
  async function handleAddRole(userId: string, role: string) {
    setRoleActionLoading(true);
    setRoleActionError(null);
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: role.toLowerCase() }]);
    setRoleActionLoading(false);
    if (error) {
      setRoleActionError('Failed to add role');
      console.error('Error adding role:', error);
    } else {
      // Refresh the user list
      window.location.reload();
    }
  }

  // Remove role from user
  async function handleRemoveRole(userId: string, role: string) {
    setRoleActionLoading(true);
    setRoleActionError(null);
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role.toLowerCase());
    setRoleActionLoading(false);
    if (error) {
      setRoleActionError('Failed to remove role');
      console.error('Error removing role:', error);
    } else {
      // Refresh the user list
      window.location.reload();
    }
  }

  // Filter users based on search and role filter
  const filteredUsers = privilegedUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.roles.includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h1" as="h1" className="mb-2 text-token-primary">
              Roles & Access Management
            </Text>
            <Text variant="lead" className="text-token-text-secondary">
              Manage privileged user roles and access permissions
            </Text>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-token rounded-lg bg-token-surface text-token-text-primary placeholder-token-text-secondary focus:outline-none focus:ring-2 focus:ring-token-primary focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-token rounded-lg bg-token-surface text-token-text-primary focus:outline-none focus:ring-2 focus:ring-token-primary focus:border-transparent"
          >
            <option value="All Roles">All Roles</option>
            <option value="admin">Admin</option>
            <option value="marketer">Marketer</option>
            <option value="tutor approver">Tutor Approver</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {roleActionError && (
        <div className="mb-4 p-4 bg-token-error-light border border-token-error rounded-lg text-token-error">
          {roleActionError}
        </div>
      )}

      {/* Users Table */}
      <Card className="p-6 bg-token-surface border border-token">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-token-text-secondary">
              {loading ? 'Loading privileged users...' : 'No privileged users found.'}
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-token">
                  <th className="text-left py-3 px-4 font-medium text-token-text-primary">User</th>
                  <th className="text-left py-3 px-4 font-medium text-token-text-primary">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-token-text-primary">Roles</th>
                  <th className="text-left py-3 px-4 font-medium text-token-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-token hover:bg-token-surface-subtle">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-token-primary-light flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <User className="w-5 h-5 text-token-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-token-text-primary">{user.name}</div>
                          <div className="text-sm text-token-text-secondary">ID: {user.uuid?.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-token-text-secondary" />
                        <span className="text-token-text-primary">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 ? (
                          <span className="text-token-text-tertiary text-sm">No roles</span>
                        ) : (
                          user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-token-info-light text-token-info"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {/* Add Role */}
                        <select
                          className="px-3 py-1 border border-token rounded text-sm bg-token-surface text-token-text-primary"
                          value={addRole}
                          onChange={(e) => setAddRole(e.target.value)}
                          disabled={roleActionLoading}
                        >
                          <option value="">Add role...</option>
                          {AVAILABLE_ROLES.filter(role => !user.roles.includes(role)).map(role => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!addRole || roleActionLoading}
                          onClick={() => handleAddRole(user.id, addRole)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        {/* Remove Role */}
                        {user.roles.length > 0 && (
                          <select
                            className="px-3 py-1 border border-token rounded text-sm bg-token-surface text-token-text-primary"
                            onChange={(e) => {
                              if (e.target.value) {
                                setPendingRemove({ userId: user.id, role: e.target.value });
                              }
                            }}
                            disabled={roleActionLoading}
                          >
                            <option value="">Remove role...</option>
                            {user.roles.map(role => (
                              <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* View User Details */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Debug Panel (only show in development) */}
      {process.env.NODE_ENV === 'development' && Object.keys(debug).length > 0 && (
        <Card className="mt-6 p-4 bg-token-surface border border-token">
          <Text variant="h3" as="h3" className="mb-2 text-token-primary">Debug Info</Text>
          <pre className="text-xs text-token-text-secondary overflow-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </Card>
      )}

      {/* Confirmation Modal for Role Removal */}
      {pendingRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-token-surface p-6 rounded-lg max-w-md w-full mx-4">
            <Text variant="h3" as="h3" className="mb-4 text-token-primary">Confirm Role Removal</Text>
            <Text variant="body" className="mb-6 text-token-text-secondary">
              Are you sure you want to remove the "{pendingRemove.role}" role from this user?
            </Text>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setPendingRemove(null)}
                disabled={roleActionLoading}
              >
                Cancel
              </Button>
                              <Button
                  variant="warning"
                  onClick={() => {
                    handleRemoveRole(pendingRemove.userId, pendingRemove.role);
                    setPendingRemove(null);
                  }}
                  disabled={roleActionLoading}
                >
                  Remove Role
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 