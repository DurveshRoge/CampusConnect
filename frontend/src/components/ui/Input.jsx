import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Reusable Input component with focus animations and error states
 * @param {object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional classes
 * @param {string} props.type - Input type
 */
const Input = forwardRef(({ label, error, className, type = 'text', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
          error
            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
            : 'border-gray-700 hover:border-gray-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
