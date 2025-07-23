import { MessageCircle } from 'lucide-react'

interface MessageIconProps {
  unreadCount?: number
  className?: string
}

export function MessageIcon({ unreadCount = 0, className = '' }: MessageIconProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <MessageCircle className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  )
} 