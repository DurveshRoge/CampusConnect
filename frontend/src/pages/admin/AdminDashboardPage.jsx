import { useEffect, useState } from 'react'
import { Building2, Users, BookOpen, Calendar, Layers, UserX, TrendingUp, Activity } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi from '../../services/adminApi'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/analytics')
      .then(({ data }) => setAnalytics(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const overview = analytics?.overview || {}
  const maxSignup = Math.max(...(analytics?.monthlySignups?.map((m) => m.count) || [1]))

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">Real-time statistics across all campuses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Building2} label="Total Campuses" value={overview.totalCampuses} color="bg-indigo-600" sub={`${overview.activeCampuses} active`} />
              <StatCard icon={Users} label="Total Users" value={overview.totalUsers} color="bg-emerald-600" sub={`${overview.suspendedUsers} suspended`} />
              <StatCard icon={BookOpen} label="Resources" value={overview.totalResources} color="bg-violet-600" />
              <StatCard icon={Calendar} label="Events" value={overview.totalEvents} color="bg-amber-600" />
              <StatCard icon={Layers} label="Teams / Workspaces" value={overview.totalTeams} color="bg-cyan-600" />
              <StatCard icon={UserX} label="Suspended Users" value={overview.suspendedUsers} color="bg-red-600" />
              <StatCard icon={Activity} label="Active Campuses" value={overview.activeCampuses} color="bg-green-600" />
              <StatCard icon={TrendingUp} label="Inactive Campuses" value={(overview.totalCampuses || 0) - (overview.activeCampuses || 0)} color="bg-gray-600" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Monthly Signups Bar Chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-4">Monthly User Signups (last 6 months)</h2>
                <div className="flex items-end gap-2 h-32">
                  {analytics?.monthlySignups?.length > 0 ? (
                    analytics.monthlySignups.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{m.count}</span>
                        <div
                          className="w-full bg-indigo-600 rounded-t-sm transition-all"
                          style={{ height: `${(m.count / maxSignup) * 100}%`, minHeight: '4px' }}
                        />
                        <span className="text-xs text-gray-500">{MONTHS[m._id.month - 1]}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm m-auto">No signup data yet</p>
                  )}
                </div>
              </div>

              {/* Top Campuses */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-4">Top Campuses by Users</h2>
                <div className="space-y-3">
                  {analytics?.topCampuses?.length > 0 ? (
                    analytics.topCampuses.map((c, i) => {
                      const maxC = analytics.topCampuses[0]?.count || 1
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs w-5">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300 text-xs truncate">{c.name}</span>
                              <span className="text-gray-400 text-xs">{c.count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${(c.count / maxC) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
