"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { useRoles } from "@/lib/RolesContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, Button, Text, Input, Select } from "@/app/components/ui";
import { Search, Download, Eye, CheckCircle, XCircle, Clock, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/app/components/StatusBadge";
import Image from "next/image";

interface TutorApplication {
  id: string;
  user_email: string;
  full_name: string;
  native_language: string;
  current_country: string;
  weekly_hours: string;
  certificates: string[];
  certificate_count: number;
  status: "pending" | "reviewing" | "approved" | "rejected" | "waitlist";
  created_at: string;
  updated_at: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  waitlist_reason?: string;
  avatar_url?: string;
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
      console.log("Loading applications with params:", params.toString());
      const response = await fetch(`/api/admin/tutor-applications?${params}`, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      console.log("API response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("API applications response:", data); // Debug log
        console.log("Applications array length:", data.applications?.length || 0);
        console.log("Applications array:", data.applications);
        setApplications(data.applications || []);
      } else {
        console.error("API response not ok:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error loading applications:", error); // Debug error
    }
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
                  Tutor Application Review
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
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-token p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => window.location.href = `/admin/tutor-applications/${application.id}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Profile image/avatar */}
                    {application.avatar_url ? (
                      <Image
                        src={application.avatar_url}
                        alt={application.full_name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover border border-token-border bg-token-surface"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-token-surface flex items-center justify-center text-token-text-muted text-2xl font-bold">
                        {application.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-token-primary">{application.full_name}</span>
                        {/* Status badge */}
                        <StatusBadge status={application.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-token-text-secondary">
                        {/* Native Language */}
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" /> {application.native_language}
                        </span>
                        {/* Location */}
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="location">🌍</span> {application.current_country}
                        </span>
                        {/* Time Commitment */}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {application.weekly_hours || 'Not specified'}
                        </span>
                        {/* Date (updated_at, date only) */}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {new Date(application.updated_at).toLocaleDateString()}
                        </span>
                        {/* Certificate count */}
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {application.certificate_count} cert{application.certificate_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[100px]">
                    <span className="text-xs text-token-text-secondary">ID: {application.id.slice(0, 8).toUpperCase()}</span>
                    <Button variant="outline" size="sm" className="text-token-primary">
                      <Eye className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
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