"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { useRoles } from "@/lib/RolesContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, Button, Text, Input, Select } from "@/app/components/ui";
import { Search, Download, Eye, CheckCircle, XCircle, Clock, Globe, Calendar } from "lucide-react";
import Link from "next/link";

interface TutorApplication {
  id: string;
  user_email: string;
  full_name: string;
  native_language: string;
  current_country: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "waitlist";
  created_at: string;
  updated_at: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  waitlist_reason?: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  waitlist: number;
}

export default function TutorApplicationsPage() {
  const { user } = useAuth();
  const { roles } = useRoles();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    checkAdminAccess();
  }, [user, roles]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    try {
      const adminStatus = roles.includes("admin");
      setIsAdmin(adminStatus);
      if (adminStatus) {
        await loadApplications();
        await loadStats();
      }
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        language: languageFilter,
        sortBy,
        sortOrder,
      });
      const response = await fetch(`/api/admin/tutor-applications?${params}`, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {}
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/analytics?period=30d", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.tutorApplications || {
          total: 0,
          pending: 0,
          reviewing: 0,
          approved: 0,
          rejected: 0,
          waitlist: 0,
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (isAdmin) {
      loadApplications();
    }
  }, [searchTerm, statusFilter, languageFilter, sortBy, sortOrder]);

  const exportToCSV = async () => {
    try {
      const response = await fetch("/api/admin/tutor-applications/export", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tutor-applications.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {}
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-token-warning";
      case "reviewing":
        return "text-token-info";
      case "approved":
        return "text-token-success";
      case "rejected":
        return "text-token-error";
      case "waitlist":
        return "text-token-accent";
      default:
        return "text-token-text-secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "reviewing":
        return <Eye className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "waitlist":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-token-error">
              Access Denied
            </Text>
            <Text variant="body" className="text-token-text-secondary mb-6">
              You don&apos;t have permission to access this page.
            </Text>
            <Link href="/admin/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2 text-token-primary">
                  Tutor Applications
                </Text>
                <Text variant="lead" className="text-token-text-secondary">
                  Review and manage tutor applications
                </Text>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />Export CSV
                </Button>
                <Link href="/admin/dashboard">
                  <Button variant="primary">Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="p-4 bg-token-surface border border-token">
                <div className="text-center">
                  <Text variant="h4" as="h4" className="text-2xl font-bold text-token-primary">{stats.total}</Text>
                  <Text variant="small" className="text-token-text-secondary">Total</Text>
                </div>
              </Card>
              <Card className="p-4 bg-token-surface border border-token">
                <div className="text-center">
                  <Text variant="h4" as="h4" className="text-2xl font-bold text-token-warning">{stats.pending}</Text>
                  <Text variant="small" className="text-token-text-secondary">Pending</Text>
                </div>
              </Card>
              <Card className="p-4 bg-token-surface border border-token">
                <div className="text-center">
                  <Text variant="h4" as="h4" className="text-2xl font-bold text-token-info">{stats.reviewing}</Text>
                  <Text variant="small" className="text-token-text-secondary">Reviewing</Text>
                </div>
              </Card>
              <Card className="p-4 bg-token-surface border border-token">
                <div className="text-center">
                  <Text variant="h4" as="h4" className="text-2xl font-bold text-token-success">{stats.approved}</Text>
                  <Text variant="small" className="text-token-text-secondary">Approved</Text>
                </div>
              </Card>
              <Card className="p-4 bg-token-surface border border-token">
                <div className="text-center">
                  <Text variant="h4" as="h4" className="text-2xl font-bold text-token-error">{stats.rejected}</Text>
                  <Text variant="small" className="text-token-text-secondary">Rejected</Text>
                </div>
              </Card>
              <Card className="p-4 bg-token-surface border border-token">
                <div className="text-center">
                  <Text variant="h4" as="h4" className="text-2xl font-bold text-token-accent">{stats.waitlist}</Text>
                  <Text variant="small" className="text-token-text-secondary">Waitlist</Text>
                </div>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="p-6 bg-token-surface border border-token mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Text variant="small" className="text-token-text-secondary mb-2">Search</Text>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-token-text-muted" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Text variant="small" className="text-token-text-secondary mb-2">Status</Text>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlist">Waitlist</option>
                </Select>
              </div>
              <div>
                <Text variant="small" className="text-token-text-secondary mb-2">Language</Text>
                <Select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                  <option value="all">All Languages</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Chinese (Mandarin)">Chinese (Mandarin)</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </Select>
              </div>
              <div>
                <Text variant="small" className="text-token-text-secondary mb-2">Sort By</Text>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="created_at">Date Created</option>
                  <option value="updated_at">Last Updated</option>
                  <option value="full_name">Name</option>
                  <option value="status">Status</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Applications List */}
          <Card className="bg-token-surface border border-token">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-token-border">
                    <th className="text-left p-4">
                      <Text variant="small" className="font-semibold text-token-text-secondary">Applicant</Text>
                    </th>
                    <th className="text-left p-4">
                      <Text variant="small" className="font-semibold text-token-text-secondary">Language</Text>
                    </th>
                    <th className="text-left p-4">
                      <Text variant="small" className="font-semibold text-token-text-secondary">Location</Text>
                    </th>
                    <th className="text-left p-4">
                      <Text variant="small" className="font-semibold text-token-text-secondary">Status</Text>
                    </th>
                    <th className="text-left p-4">
                      <Text variant="small" className="font-semibold text-token-text-secondary">Date</Text>
                    </th>
                    <th className="text-left p-4">
                      <Text variant="small" className="font-semibold text-token-text-secondary">Actions</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id} className="border-b border-token-border hover:bg-token-surface-hover">
                      <td className="p-4">
                        <div>
                          <Text variant="body" className="font-medium text-token-primary">{application.full_name}</Text>
                          <Text variant="small" className="text-token-text-secondary">{application.user_email}</Text>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-token-text-muted mr-2" />
                          <Text variant="body">{application.native_language}</Text>
                        </div>
                      </td>
                      <td className="p-4">
                        <Text variant="body">{application.current_country}</Text>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className={`mr-2 ${getStatusColor(application.status)}`}>{getStatusIcon(application.status)}</span>
                          <Text variant="body" className={getStatusColor(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Text>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-token-text-muted mr-2" />
                          <Text variant="small" className="text-token-text-secondary">{new Date(application.created_at).toLocaleDateString()}</Text>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/tutor-applications/${application.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && (
                <div className="text-center py-12">
                  <Text variant="body" className="text-token-text-secondary">No applications found matching your criteria.</Text>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 