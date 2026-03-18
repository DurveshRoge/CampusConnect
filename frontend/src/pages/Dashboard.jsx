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
  academic:   'bg-blue-900/40 text-blue-300 border-blue-700/40',
  placements: 'bg-green-900/40 text-green-300 border-green-700/40',
  events:     'bg-purple-900/40 text-purple-300 border-purple-700/40',
  general:    'bg-gray-700/60 text-gray-300 border-gray-600/40',
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
    indigo: 'bg-indigo-900/40 border-indigo-700/40 text-indigo-400',
    green:  'bg-green-900/40 border-green-700/40 text-green-400',
    blue:   'bg-blue-900/40 border-blue-700/40 text-blue-400',
    purple: 'bg-purple-900/40 border-purple-700/40 text-purple-400',
  }
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(99,102,241,0.2)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        to={href}
        className="block bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/50 transition-all group"
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-gray-400 text-sm font-medium mb-1 truncate">{label}</p>
            <p className="text-3xl font-bold text-white">
              {value !== undefined && value !== null ? (
                <CountUp end={value} duration={1.5} />
              ) : (
                '—'
              )}
            </p>
            <p className="text-indigo-400 text-xs mt-2 group-hover:text-indigo-300 transition-colors">View all →</p>
          </div>
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl shrink-0 ${colorMap[color]}`}>
            {icon}
          </div>
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
        <main id="main-content" className="flex-1 md:ml-64 max-w-full" role="main">
          {/* Hero Greeting Strip */}
          <div className="bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-purple-600/20 border-b border-indigo-700/30 px-6 py-6">
            <div className="flex items-center gap-4 max-w-full">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden ring-4 ring-indigo-500/30 flex-shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <span>{getInitials(user?.name || 'U')}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {getGreeting()}, {firstName}! 👋
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-700/40 px-3 py-1 rounded-full">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-yellow-300 text-sm font-semibold">{user?.points || 0} points</span>
                  </div>
                  {topBadge && (
                    <div className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 px-3 py-1 rounded-full">
                      <span className="text-indigo-300 text-sm font-semibold">🏆 {topBadge}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
              <div className="mb-6 space-y-2">
                {pinnedAnnouncements.map((a) => (
                  <Link
                    key={a._id}
                    to="/announcements"
                    className="flex items-start gap-3 bg-indigo-950/50 border border-indigo-700/40 rounded-xl px-4 py-3 hover:border-indigo-500/60 transition-all"
                  >
                    <span className="text-lg shrink-0 mt-0.5">📢</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${CATEGORY_COLOR[a.category] || CATEGORY_COLOR.general}`}>
                          {a.category}
                        </span>
                        <span className="text-gray-500 text-xs">{timeAgo(a.createdAt)}</span>
                      </div>
                      <p className="text-white text-sm font-medium truncate">{a.title}</p>
                      <p className="text-gray-400 text-xs truncate">{a.body}</p>
                    </div>
                    <span className="text-gray-600 text-xs shrink-0 mt-1">View →</span>
                  </Link>
                ))}
              </div>
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