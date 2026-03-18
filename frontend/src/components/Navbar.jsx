import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../hooks/useAuth'
import { getInitials } from '../utils/helpers'
import NotificationsDropdown from './NotificationsDropdown'
import { getNotifications } from '../services/notificationService'

function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className="relative px-3 py-2 text-sm font-medium transition-colors text-gray-300 hover:text-white group"
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      {!isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      )}
    </Link>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    setDropdownOpen(false)
    setNotifOpen(false)
    logout()
    navigate('/login')
  }

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <nav
        className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/20"
        role="navigation"
        aria-label="Main navigation"
      >
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-white font-bold text-lg hidden md:block tracking-tight">
                CampusConnect
              </span>
            </Link>
          </div>

          {/* Nav links — desktop only */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/team-finder">Team Finder</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/marketplace">Marketplace</NavLink>
            <NavLink to="/connections">Connections</NavLink>
          </div>

          {/* Right: Bell + User avatar */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((prev) => !prev)
                  setDropdownOpen(false)
                }}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-0.5 leading-none"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {notifOpen && (
                <NotificationsDropdown onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* User avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setDropdownOpen((prev) => !prev)
                  setNotifOpen(false)
                }}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(user?.name || 'U')}</span>
                  )}
                </div>
                <span className="text-gray-300 text-sm hidden md:block max-w-32 truncate">
                  {user?.name}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-black/40 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-gray-700 mb-1">
                    <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                    {user?.role === 'committee' && (
                      <span className="inline-block mt-1 text-xs bg-amber-900/40 text-amber-400 border border-amber-700/40 px-1.5 py-0.5 rounded-full">
                        Committee Head
                      </span>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>👤</span>
                    My Profile
                  </Link>
                  <Link
                    to="/connections"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>🔗</span>
                    Connections
                  </Link>
                  <hr className="border-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}

export default Navbar
