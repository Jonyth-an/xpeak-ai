import { Button } from './Button'
import { MessageIcon } from './MessageIcon'
import React from 'react'

interface MessageButtonProps extends React.ComponentProps<typeof Button> {
  label?: string
  icon?: React.ReactNode
  loading?: boolean
  unreadCount?: number
}

export function MessageButton({ label = 'Message', icon, loading = false, unreadCount = 0, ...props }: MessageButtonProps) {
  return (
    <Button {...props} variant={props.variant || 'outline'} size={props.size || 'sm'}>
      <span className="inline-flex items-center">
        {icon || <MessageIcon unreadCount={unreadCount} className="w-4 h-4 mr-2" />}
        {loading ? 'Loading...' : label}
      </span>
    </Button>
  )
} 