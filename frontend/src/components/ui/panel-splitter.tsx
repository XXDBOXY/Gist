import { cn } from '@/lib/utils'

interface PanelSplitterProps {
  isDragging?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onDoubleClick?: () => void
  className?: string
  tooltip?: string
}

export function PanelSplitter({
  isDragging,
  onMouseDown,
  onDoubleClick,
  className,
  tooltip,
}: PanelSplitterProps) {
  return (
    <div
      className={cn(
        'group relative flex w-1 shrink-0 cursor-ew-resize items-center justify-center z-10',
        'hover:bg-accent/30 transition-colors duration-200',
        isDragging && 'bg-accent/50',
        className
      )}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      title={tooltip}
    >
      <div
        className={cn(
          'w-0.5 rounded-full bg-border/40 transition-all duration-300 ease-out',
          'h-6 group-hover:h-10 group-hover:bg-muted-foreground/40',
          isDragging && 'h-full bg-primary/40 rounded-none w-[1px]'
        )}
      />
    </div>
  )
}
