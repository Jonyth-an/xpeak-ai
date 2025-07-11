import React from "react";
import { Clock, Eye, CheckCircle, XCircle, PauseCircle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  pending: {
    icon: <Clock className="w-4 h-4" />, label: "Pending", color: "text-token-warning", bg: "bg-token-warning/10",
  },
  reviewing: {
    icon: <Eye className="w-4 h-4" />, label: "Reviewing", color: "text-token-info", bg: "bg-token-info/10",
  },
  approved: {
    icon: <CheckCircle className="w-4 h-4" />, label: "Approved", color: "text-token-success", bg: "bg-token-success/10",
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />, label: "Rejected", color: "text-token-error", bg: "bg-token-error/10",
  },
  waitlist: {
    icon: <PauseCircle className="w-4 h-4" />, label: "Waitlist", color: "text-token-accent", bg: "bg-token-accent/10",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["pending"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color} ${config.bg}`}
      style={{ minWidth: 80 }}
    >
      {config.icon}
      {config.label}
    </span>
  );
} 