import { NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

// Grouped navigation structure
const navSections = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/announcements', icon: '📢', label: 'Announcements' },
    ],
  },
  {
    label: 'DISCOVER',
    items: [
      { to: '/team-finder', icon: '🔍', label: 'Team Finder' },
      { to: '/events', icon: '📅', label: 'Events' },
      { to: '/projects', icon: '🚀', label: 'Projects' },
      { to: '/resources', icon: '📚', label: 'Resources' },
      { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    ],
  },
  {
    label: 'CAMPUS',
    items: [
      { to: '/marketplace', icon: '🛒', label: 'Marketplace' },
      { to: '/lost-found', icon: '📍', label: 'Lost & Found' },
      { to: '/placement', icon: '🧑‍💼', label: 'Placement Hub' },
    ],
  },
  {
    label: 'SOCIAL',
    items: [
      { to: '/connections', icon: '🔗', label: 'Connections' },
      { to: '/messages', icon: '💬', label: 'Messages' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/workspace', icon: '🗂', label: 'Workspace' },
      { to: '/study-rooms', icon: '🕐', label: 'Study Rooms' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/profile', icon: '👤', label: 'My Profile' },
    ],
  },
]

function Sidebar() {
  const location = useLocation()

  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-gray-900/80 backdrop-blur-md border-r border-gray-800/50 fixed left-0 top-16 bottom-0 z-40 overflow-y-auto"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <div className="flex flex-col flex-1 py-5 px-3">
        {navSections.map((section, sectionIdx) => (
          <div key={section.label} className={sectionIdx > 0 ? 'mt-6' : ''}>
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-2 px-3">
              {section.label}
            </p>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/profile' && location.pathname.startsWith(item.to + '/'))

                return (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/profile' || item.to === '/dashboard'}
                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute inset-0 bg-indigo-600 rounded-lg shadow-glow-indigo"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`text-base leading-none relative z-10 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  </RouterNavLink>
                )
              })}
            </nav>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-700/60">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-2 px-3">
            Quick Actions
          </p>
          <div className="space-y-0.5">
            <RouterNavLink
              to="/marketplace/create"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base leading-none">➕</span>
              <span>New Listing</span>
            </RouterNavLink>
            <RouterNavLink
              to="/projects/create"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base leading-none">🚀</span>
              <span>New Project</span>
            </RouterNavLink>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-700/60">
        <p className="text-xs text-gray-600 text-center">CampusConnect v1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
