import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import EventCard from '../components/EventCard'
import EmptyState from '../components/ui/EmptyState'
import { EventCardSkeleton } from '../components/ui/Skeleton'
import useAuth from '../hooks/useAuth'
import { getEvents } from '../services/eventService'
import { staggerContainer, staggerItem } from '../lib/motion'

function EventsPage() {
  const { user } = useAuth()
  const isCommittee = user?.role === 'committee'

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date())
  const pastEvents = events.filter((e) => new Date(e.date) < new Date())

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Events</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Stay updated with events happening at your college.
              </p>
            </div>
            {isCommittee && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/events/create"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
                >
                  + Broadcast Event
                </Link>
              </motion.div>
            )}
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              type="events"
              title="No events yet"
              description={isCommittee
                ? 'Be the first to broadcast an event to your campus!'
                : 'No events have been announced yet. Check back soon!'}
              actionLabel={isCommittee ? '+ Create First Event' : undefined}
              actionTo={isCommittee ? '/events/create' : undefined}
            />
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-white font-semibold text-lg">Upcoming Events</h2>
                    <span className="px-2.5 py-0.5 bg-indigo-600/20 text-indigo-400 text-xs font-medium rounded-full">
                      {upcomingEvents.length}
                    </span>
                  </div>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {upcomingEvents.map((event) => (
                      <motion.div key={event.id || event._id} variants={staggerItem}>
                        <EventCard event={event} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}

              {pastEvents.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-gray-400 font-semibold text-lg">Past Events</h2>
                    <span className="px-2.5 py-0.5 bg-gray-700/60 text-gray-500 text-xs font-medium rounded-full">
                      {pastEvents.length}
                    </span>
                  </div>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-60"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {pastEvents.map((event) => (
                      <motion.div key={event.id || event._id} variants={staggerItem}>
                        <EventCard event={event} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default EventsPage
