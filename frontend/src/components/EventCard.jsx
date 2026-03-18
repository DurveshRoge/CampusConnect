import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDate, getInitials } from '../utils/helpers'

const CATEGORY_COLORS = {
  hackathon: 'bg-purple-900/40 text-purple-400 border-purple-700/40',
  workshop: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  seminar: 'bg-cyan-900/40 text-cyan-400 border-cyan-700/40',
  cultural: 'bg-pink-900/40 text-pink-400 border-pink-700/40',
  sports: 'bg-green-900/40 text-green-400 border-green-700/40',
  other: 'bg-gray-700/60 text-gray-400 border-gray-600/40',
}

// Calculate countdown for upcoming events
function getCountdown(targetDate) {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target - now

  if (diff < 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `Starts in ${days}d ${hours}h`
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`
  if (minutes > 0) return `Starts in ${minutes}m`
  return 'Starting soon'
}

function EventCard({ event }) {
  // Destructuring with fallbacks to prevent crashes
  const { 
    id, 
    _id, 
    title = 'Untitled Event', 
    description = '', 
    date, 
    venue = 'TBD', 
    category = 'other', 
    organizer, 
    imageUrl, 
    registeredUsers = [] 
  } = event || {}

  const eventId = id || _id
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  const isPast = date ? new Date(date) < new Date() : false
  const [countdown, setCountdown] = useState(getCountdown(date))

  // Update countdown every minute for upcoming events
  useEffect(() => {
    if (isPast || !date) return

    const interval = setInterval(() => {
      setCountdown(getCountdown(date))
    }, 60000)

    return () => clearInterval(interval)
  }, [date, isPast])

  // Improved check for registration status
  const isRegistered = Array.isArray(registeredUsers) && registeredUsers.length > 0

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(99,102,241,0.2)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        to={`/events/${eventId}`}
        className="block bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden hover:border-indigo-500/60 transition-all group relative"
      >
        {/* Registered indicator - Absolute Positioned */}
        {isRegistered && !isPast && (
          <div className="absolute top-2 right-2 z-20">
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg bg-emerald-500 text-white shadow-lg backdrop-blur-sm">
              ✓ Registered
            </span>
          </div>
        )}

        {/* Header/Image Section */}
        <div className="h-32 relative overflow-hidden bg-gray-900">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-gray-800 to-violet-900/40 flex items-center justify-center">
              <span className="text-4xl opacity-20">📅</span>
            </div>
          )}
          
          {/* Overlay Gradient for better badge visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

          {/* Category badge */}
          <span className={`absolute bottom-2 left-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded border z-10 ${colorClass}`}>
            {category}
          </span>

          {isPast && (
            <span className="absolute top-2 right-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-900/80 text-gray-400 border border-gray-700 z-10">
              Ended
            </span>
          )}
        </div>

        {/* Body Section */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors mb-3">
            {title}
          </h3>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="text-xs">🗓</span>
              <span className="text-xs font-medium">{formatDate(date)}</span>
            </div>
            
            {venue && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-xs">📍</span>
                <span className="text-xs truncate">{venue}</span>
              </div>
            )}

            {/* Countdown for upcoming events */}
            {!isPast && countdown && (
              <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 w-fit px-2 py-0.5 rounded-md mt-1">
                <span className="text-[10px]">⏱</span>
                <span className="text-[10px] font-bold uppercase">{countdown}</span>
              </div>
            )}
          </div>

          {description && (
            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
              {description}
            </p>
          )}

          {/* Organizer Footer */}
          {organizer && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-700/40">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0 ring-1 ring-white/10">
                {organizer.avatarUrl ? (
                  <img src={organizer.avatarUrl} alt={organizer.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(organizer.name || 'U')}</span>
                )}
              </div>
              <span className="text-gray-500 text-[11px] truncate font-medium">
                Organized by <span className="text-gray-400">{organizer.name}</span>
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default EventCard;