import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UserCard from '../components/UserCard'
import useAuth from '../hooks/useAuth'
import { getUsers } from '../services/userService'
import { getConnections } from '../services/connectionService'
import { getListings } from '../services/marketplaceService'
import { getEvents } from '../services/eventService'
import { getAnnouncements } from '../services/announcementService'
import { getRecommendations } from '../services/recommendationService'
import { getInitials } from '../utils/helpers'

const CATEGORY_COLOR = {
  academic:   'bg-gradient-to-r from-blue-600/40 to-cyan-600/40 text-blue-300 border-blue-500/40 shadow-md shadow-blue-600/20',
  placements: 'bg-gradient-to-r from-green-600/40 to-emerald-600/40 text-green-300 border-green-500/40 shadow-md shadow-green-600/20',
  events:     'bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-purple-300 border-purple-500/40 shadow-md shadow-purple-600/20',
  general:    'bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 border-gray-600/40 shadow-md shadow-gray-600/10',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({ label, value, icon, href, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-600/30 to-violet-600/30 border-indigo-500/40 text-indigo-300 shadow-indigo-600/20',
    green:  'from-green-600/30 to-emerald-600/30 border-green-500/40 text-green-300 shadow-green-600/20',
    blue:   'from-blue-600/30 to-cyan-600/30 border-blue-500/40 text-blue-300 shadow-blue-600/20',
    purple: 'from-purple-600/30 to-pink-600/30 border-purple-500/40 text-purple-300 shadow-purple-600/20',
  }
  const [colorGradient, colorBorder, colorText, colorShadow] = colorMap[color].split(' ')

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={href}
        className={`block bg-gradient-to-br ${colorGradient} to-gray-900/20 border ${colorBorder} rounded-2xl p-6 hover:border-indigo-400/60 transition-all group relative overflow-hidden shadow-lg ${colorShadow}`}
      >
        {/* Background glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">{label}</p>
            <p className="text-4xl font-black text-white mb-2">
              {value !== undefined && value !== null ? (
                <CountUp end={value} duration={1.5} />
              ) : (
                '—'
              )}
            </p>
            <motion.p
              whileHover={{ x: 4 }}
              className="text-indigo-300 text-xs font-bold uppercase tracking-wider group-hover:text-indigo-200 transition-colors"
            >
              View all →
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorGradient} border ${colorBorder} flex items-center justify-center text-2xl shrink-0 shadow-lg`}
          >
            {icon}
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-14" />
        <div className="h-5 bg-gray-700 rounded-full w-20" />
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Student'

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const { data: connections = [] } = useQuery({ queryKey: ['connections'], queryFn: getConnections })
  const { data: listings = [] } = useQuery({ queryKey: ['marketplace'], queryFn: getListings })
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents })
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: getAnnouncements })
  const { data: recommendations } = useQuery({ queryKey: ['recommendations'], queryFn: getRecommendations })

  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  const pinnedAnnouncements = announcements.slice(0, 2)
  const topBadge = user?.badges?.[0] || null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main id="main-content" className="flex-1 md:ml-64 max-w-full md:pb-0 pb-20" role="main">
          {/* Hero Greeting Strip - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-purple-900/40 border-b border-indigo-700/40 px-6 py-8 shadow-lg shadow-indigo-900/20"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-6 max-w-full">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-indigo-500/40 shadow-lg shadow-indigo-600/30 flex-shrink-0"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <span>{getInitials(user?.name || 'U')}</span>
                )}
              </motion.div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2 bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200 bg-clip-text">
                    {getGreeting()}, {firstName}! 👋
                  </h1>
                </motion.div>

                {/* Stats Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 flex-wrap mt-3"
                >
                  {/* Points */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-600/40 to-amber-600/40 border border-yellow-500/40 px-4 py-2 rounded-full shadow-md shadow-yellow-600/20 backdrop-blur-sm"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-xl"
                    >
                      ⭐
                    </motion.span>
                    <div className="flex flex-col">
                      <span className="text-yellow-300 text-xs font-bold uppercase tracking-wide">Points</span>
                      <span className="text-yellow-100 font-black text-lg leading-none">{user?.points || 0}</span>
                    </div>
                  </motion.div>

                  {/* Top Badge */}
                  {topBadge && (
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600/40 to-violet-600/40 border border-indigo-500/40 px-4 py-2 rounded-full shadow-md shadow-indigo-600/20 backdrop-blur-sm"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xl"
                      >
                        🏆
                      </motion.span>
                      <div className="flex flex-col">
                        <span className="text-indigo-300 text-xs font-bold uppercase tracking-wide">Badge</span>
                        <span className="text-indigo-100 font-black text-sm leading-none">{topBadge}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Connection Status */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600/40 to-green-600/40 border border-emerald-500/40 px-4 py-2 rounded-full shadow-md shadow-emerald-600/20 backdrop-blur-sm"
                  >
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xl"
                    >
                      🔗
                    </motion.span>
                    <div className="flex flex-col">
                      <span className="text-emerald-300 text-xs font-bold uppercase tracking-wide">Connected</span>
                      <span className="text-emerald-100 font-black text-sm leading-none">{connections.length}</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="p-6">
            {/* Pinned Announcements - Enhanced */}
            {pinnedAnnouncements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 space-y-3"
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">📌 Latest Announcements</h2>
                {pinnedAnnouncements.map((a, idx) => (
                  <motion.div
                    key={a._id}
                    whileHover={{ x: 8, boxShadow: '0 12px 30px rgba(99, 102, 241, 0.15)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to="/announcements"
                      className="flex items-start gap-4 bg-gradient-to-r from-indigo-950/60 to-violet-950/40 border border-indigo-700/50 rounded-2xl px-5 py-4 hover:border-indigo-500/70 transition-all group shadow-lg shadow-indigo-900/20"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                        className="text-2xl shrink-0 mt-0.5"
                      >
                        📢
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shadow-md ${CATEGORY_COLOR[a.category] || CATEGORY_COLOR.general}`}
                          >
                            {a.category}
                          </motion.span>
                          <span className="text-gray-500 text-xs font-medium">{timeAgo(a.createdAt)}</span>
                        </div>
                        <p className="text-white text-sm font-bold group-hover:text-indigo-300 transition-colors truncate">{a.title}</p>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{a.body}</p>
                      </div>
                      <motion.span
                        whileHover={{ x: 4 }}
                        className="text-indigo-400 text-xs shrink-0 mt-1 font-bold group-hover:text-indigo-300"
                      >
                        Read →
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Stats Cards Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <motion.div variants={item}><StatCard label="Connections" value={connections.length} icon="🔗" href="/connections" color="indigo" /></motion.div>
              <motion.div variants={item}><StatCard label="Marketplace" value={listings.length} icon="🛒" href="/marketplace" color="blue" /></motion.div>
              <motion.div variants={item}><StatCard label="Students" value={users.length} icon="🎓" href="/team-finder" color="green" /></motion.div>
              <motion.div variants={item}><StatCard label="Events" value={events.length} icon="📅" href="/events" color="purple" /></motion.div>
            </motion.div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Upcoming Events */}
              <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-xs uppercase tracking-widest text-gray-500">Upcoming Events</h2>
                  <Link to="/events" className="text-indigo-400 hover:text-indigo-300 text-xs">View all →</Link>
                </div>
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">No upcoming events found.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Link key={event._id} to={`/events/${event._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-indigo-900/40 border border-indigo-700/40 flex flex-col items-center justify-center shrink-0">
                          <span className="text-indigo-300 text-xs font-bold leading-none">{new Date(event.date).getDate()}</span>
                          <span className="text-indigo-400 text-[10px] uppercase">{new Date(event.date).toLocaleString('en', { month: 'short' })}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{event.title}</p>
                          <p className="text-gray-500 text-xs truncate">{event.venue || 'TBD'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
                <h2 className="font-semibold mb-4 text-xs uppercase tracking-widest text-gray-500">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { to: '/team-finder', icon: '🔍', label: 'Find Teammates', primary: true },
                    { to: '/projects/create', icon: '🚀', label: 'Share Project' },
                    { to: '/events', icon: '📅', label: 'Browse Events' },
                    { to: '/resources', icon: '📚', label: 'Browse Notes' },
                    { to: '/placement', icon: '💼', label: 'Placement Hub' },
                    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
                  ].map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.primary ? 'bg-indigo-600 hover:bg-indigo-500 text-white col-span-2' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      {action.icon} {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            {recommendations && (
              <div className="mb-8">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">For You <span className="text-sm font-normal text-gray-500">✨ Personalized picks</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {/* Events Recommendation */}
                  <div className="bg-gray-800 border border-gray-700/40 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Suggested Events</p>
                    <div className="space-y-2">
                      {recommendations.events?.slice(0, 2).map(ev => (
                        <Link key={ev._id} to={`/events/${ev._id}`} className="block text-sm text-gray-300 hover:text-white truncate">• {ev.title}</Link>
                      )) || <p className="text-xs text-gray-600">None found</p>}
                    </div>
                  </div>
                  {/* Resource Recommendation */}
                  <div className="bg-gray-800 border border-gray-700/40 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Study Material</p>
                    <div className="space-y-2">
                      {recommendations.resources?.slice(0, 2).map(r => (
                        <p key={r._id} className="text-sm text-gray-300 truncate">• {r.title}</p>
                      )) || <p className="text-xs text-gray-600">None found</p>}
                    </div>
                  </div>
                  {/* Teammate Recommendation */}
                  <div className="bg-gray-800 border border-gray-700/40 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Potential Teammates</p>
                    <div className="space-y-2">
                      {recommendations.teammates?.slice(0, 2).map(u => (
                        <Link key={u._id} to={`/profile/${u._id}`} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white truncate">
                          <div className="w-5 h-5 rounded-full bg-indigo-500 shrink-0 text-[10px] flex items-center justify-center font-bold text-white">{u.name?.[0]}</div>
                          {u.name}
                        </Link>
                      )) || <p className="text-xs text-gray-600">None found</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Discover Students */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Discover Students</h2>
                <Link to="/team-finder" className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</Link>
              </div>
              {usersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.slice(0, 6).map((u) => <UserCard key={u._id || u.id} user={u} />)}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard