import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  placeholder = 'blur', // 'blur' | 'skeleton' | 'none'
  ...props
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={cn(
          'bg-gray-800 flex items-center justify-center text-gray-600',
          wrapperClassName,
          className
        )}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {/* Placeholder */}
      {!loaded && placeholder !== 'none' && (
        <div
          className={cn(
            'absolute inset-0',
            placeholder === 'blur' && 'bg-gray-700/50 backdrop-blur animate-pulse',
            placeholder === 'skeleton' && 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer'
          )}
        />
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={cn(className)}
        {...props}
      />
    </div>
  )
}

// Avatar with lazy loading
export function LazyAvatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  className = '',
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  }

  if (error || !src) {
    return (
      <div
        className={cn(
          'rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0',
          sizeClasses[size],
          className
        )}
      >
        {fallback || '?'}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeClasses[size], className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-full" />
      )}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
