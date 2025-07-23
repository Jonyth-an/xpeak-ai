import React from 'react'

interface MessageButtonProps {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function MessageButton({ label, onClick, icon, disabled = false, loading = false, className = '' }: MessageButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {loading ? 'Loading...' : label}
    </button>
  )
} 