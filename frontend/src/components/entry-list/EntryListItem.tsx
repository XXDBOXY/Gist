import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Entry, Feed } from '@/types/api'

interface EntryListItemProps {
  entry: Entry
  feed?: Feed
  isSelected: boolean
  onClick: () => void
  style?: React.CSSProperties
  'data-index'?: number
}

export const EntryListItem = forwardRef<HTMLDivElement, EntryListItemProps>(
  function EntryListItem(
    { entry, feed, isSelected, onClick, style, 'data-index': dataIndex },
    ref
  ) {
  const publishedAt = entry.publishedAt ? formatRelativeTime(entry.publishedAt) : null
  const [iconError, setIconError] = useState(false)
  const showIcon = feed?.iconPath && !iconError

  return (
    <div
      ref={ref}
      className={cn(
        'px-4 py-3 cursor-pointer transition-colors',
        'hover:bg-item-hover',
        isSelected && 'bg-item-active',
        !entry.read && !isSelected && 'bg-accent/5'
      )}
      style={style}
      data-index={dataIndex}
      onClick={onClick}
    >
      {/* Line 1: icon + feed name + time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {showIcon ? (
          <img
            src={`/icons/${feed.iconPath}`}
            alt=""
            className="size-4 shrink-0 rounded"
            onError={() => setIconError(true)}
          />
        ) : (
          <FeedIcon className="size-4 shrink-0 text-muted-foreground/50" />
        )}
        <span className="truncate">{feed?.title || 'Unknown Feed'}</span>
        {publishedAt && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <span className="shrink-0">{publishedAt}</span>
          </>
        )}
      </div>

      {/* Line 2: title */}
      <div
        className={cn(
          'mt-1 text-sm line-clamp-2',
          !entry.read ? 'font-semibold' : 'font-medium text-muted-foreground'
        )}
      >
        {entry.title || 'Untitled'}
      </div>

      {/* Line 3: summary */}
      {entry.content && (
        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {stripHtml(entry.content).slice(0, 150)}
        </div>
      )}
    </div>
  )
  }
)

function FeedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.18 15.64a2.18 2.18 0 1 1 0 4.36 2.18 2.18 0 0 1 0-4.36zM4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44zm0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
    </svg>
  )
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString()
}
