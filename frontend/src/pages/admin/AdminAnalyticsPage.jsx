import { useEffect, useState } from 'react'
import { Building2, Users, BookOpen, Calendar, Layers, UserX, Activity } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi from '../../services/adminApi'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function MetricCard({ icon: Icon, label, value, note, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        {note && <p className="text-xs text-gray-500 mt-0.5">{note}</p>}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/analytics')
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ov = data?.overview || {}
  const maxSignup = Math.max(...(data?.monthlySignups?.map((m) => m.count) || [1]))
  const maxCampus = data?.topCampuses?.[0]?.count || 1

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Aggregated metrics across all campuses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon={Building2} label="Campuses" value={ov.totalCampuses} note={`${ov.activeCampuses} active`} color="bg-indigo-600" />
              <MetricCard icon={Users} label="Total Users" value={ov.totalUsers} color="bg-emerald-600" />
              <MetricCard icon={BookOpen} label="Resources" value={ov.totalResources} color="bg-violet-600" />
              <MetricCard icon={Calendar} label="Events" value={ov.totalEvents} color="bg-amber-600" />
              <MetricCard icon={Layers} label="Workspaces" value={ov.totalTeams} color="bg-cyan-600" />
              <MetricCard icon={UserX} label="Suspended" value={ov.suspendedUsers} color="bg-red-600" />
              <MetricCard icon={Activity} label="Active Campuses" value={ov.activeCampuses} note={`of ${ov.totalCampuses} total`} color="bg-teal-600" />
            </div>

            {/* Monthly Signups */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">User Signups — Last 6 Months</h2>
              <div className="flex items-end gap-3 h-40">
                {data?.monthlySignups?.length > 0 ? (
                  data.monthlySignups.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-gray-300 text-xs font-medium">{m.count}</span>
                      <div
                        className="w-full rounded-t-md bg-indigo-600 hover:bg-indigo-500 transition-colors"
                        style={{ height: `${(m.count / maxSignup) * 100}%`, minHeight: '6px' }}
                        title={`${MONTHS[m._id.month - 1]} ${m._id.year}: ${m.count} signups`}
                      />
                      <span className="text-gray-500 text-xs">{MONTHS[m._id.month - 1]}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No signup data in the last 6 months</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Campuses */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">Top Campuses by Students</h2>
              {data?.topCampuses?.length > 0 ? (
                <div className="space-y-4">
                  {data.topCampuses.map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-gray-500 text-sm w-6 text-right">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-gray-200 text-sm font-medium">{c.name}</span>
                          <span className="text-gray-400 text-sm">{c.count} students</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                            style={{ width: `${(c.count / maxCampus) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No campus data available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
