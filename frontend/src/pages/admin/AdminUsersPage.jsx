import { useEffect, useState, useCallback } from 'react'
import { Search, ShieldCheck, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi from '../../services/adminApi'

const ROLE_BADGES = {
  student: 'bg-blue-500/15 text-blue-400',
  committee: 'bg-amber-500/15 text-amber-400',
  campusAdmin: 'bg-violet-500/15 text-violet-400',
  admin: 'bg-gray-500/15 text-gray-400',
}

const ROLE_OPTIONS = ['student', 'committee', 'campusAdmin']

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGES[role] || 'bg-gray-700 text-gray-300'}`}>
      {role}
    </span>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [campuses, setCampuses] = useState([])
  const [filters, setFilters] = useState({ search: '', campusId: '', role: '' })
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = useCallback((page = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 15 })
    if (filters.search) params.append('search', filters.search)
    if (filters.campusId) params.append('campusId', filters.campusId)
    if (filters.role) params.append('role', filters.role)
    adminApi.get(`/users?${params}`)
      .then(({ data }) => {
        setUsers(data.data.users)
        setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    adminApi.get('/campuses').then(({ data }) => setCampuses(data.data.campuses)).catch(console.error)
  }, [])

  const toggleSuspend = async (user) => {
    setActionLoading(user._id + '_suspend')
    try {
      await adminApi.patch(`/users/${user._id}/suspend`)
      fetchUsers(pagination.page)
    } catch (err) { console.error(err) }
    finally { setActionLoading(null) }
  }

  const changeRole = async (user, role) => {
    setActionLoading(user._id + '_role')
    try {
      await adminApi.patch(`/users/${user._id}/role`, { role })
      fetchUsers(pagination.page)
    } catch (err) { console.error(err) }
    finally { setActionLoading(null) }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-0.5">{pagination.total} total users across all campuses</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Search name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <select
            value={filters.campusId}
            onChange={(e) => setFilters({ ...filters, campusId: e.target.value })}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Campuses</option>
            {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">User</th>
                <th className="text-left px-3 py-3 font-medium">Campus</th>
                <th className="text-center px-3 py-3 font-medium">Role</th>
                <th className="text-center px-3 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className={`hover:bg-gray-800/40 transition-colors ${user.isSuspended ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-300 text-xs font-bold">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 text-xs">
                      {user.collegeId?.name || '—'}
                    </td>
                    <td className="text-center px-3 py-3.5">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user, e.target.value)}
                        disabled={!!actionLoading}
                        className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r} className="bg-gray-900">{r}</option>
                        ))}
                      </select>
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="text-center px-3 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isSuspended ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="text-right px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleSuspend(user)}
                          disabled={actionLoading === user._id + '_suspend'}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors bg-gray-800 hover:bg-gray-700 text-gray-300"
                          title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {user.isSuspended
                            ? <><CheckCircle size={12} className="text-emerald-400" /> Unsuspend</>
                            : <><Ban size={12} className="text-red-400" /> Suspend</>
                          }
                        </button>
                        <button
                          onClick={() => changeRole(user, 'campusAdmin')}
                          disabled={user.role === 'campusAdmin' || !!actionLoading}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40"
                          title="Promote to Campus Admin"
                        >
                          <ShieldCheck size={12} className="text-violet-400" /> Promote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">
                Page {pagination.page} of {pagination.pages} ({pagination.total} users)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
