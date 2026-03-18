import { cn } from '../../lib/utils'

// Base skeleton with shimmer animation
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] rounded',
        className
      )}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      {...props}
    />
  )
}

// Card skeleton for events, projects, etc.
export function CardSkeleton({ hasImage = true, lines = 3 }) {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 space-y-4">
      {hasImage && <Skeleton className="h-40 w-full rounded-lg" />}
      <Skeleton className="h-6 w-3/4" />
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 15}%` }} />
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

// User card skeleton
export function UserCardSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

// List item skeleton
export function ListItemSkeleton({ hasAvatar = true }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
      {hasAvatar && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Project card skeleton
export function ProjectCardSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 space-y-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  )
}

// Resource item skeleton
export function ResourceSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-10 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

// Profile header skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Add shimmer keyframes to global styles
export const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`
