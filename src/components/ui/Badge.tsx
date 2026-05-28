import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700',
      className
    )}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

interface GenericBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  className?: string
}

export function Badge({ children, variant = 'default', className }: GenericBadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    outline: 'border border-slate-200 text-slate-700',
    blue: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  }
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
