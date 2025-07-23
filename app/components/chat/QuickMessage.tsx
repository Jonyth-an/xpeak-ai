import React from 'react'

interface QuickMessageProps {
  sender: string
  message: string
  timestamp: string
  unread?: boolean
}

export function QuickMessage({ sender, message, timestamp, unread = false }: QuickMessageProps) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${unread ? 'font-bold' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm text-gray-900">{sender}: {message}</div>
        <div className="text-xs text-gray-400 truncate">{timestamp}</div>
      </div>
      {unread && <span className="w-2 h-2 bg-blue-500 rounded-full ml-2" />}
    </div>
  )
} 