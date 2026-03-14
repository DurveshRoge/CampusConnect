import { useEffect, useState } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Building2, Users, BookOpen, Calendar, Layers } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi from '../../services/adminApi'

function Badge({ active }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function CampusModal({ campus, onClose, onSave }) {
  const [form, setForm] = useState({
    name: campus?.name || '',
    domain: campus?.domain || '',
    city: campus?.city || '',
    location: campus?.location || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (campus) {
        await adminApi.patch(`/campuses/${campus._id}`, form)
      } else {
        await adminApi.post('/campuses', form)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-white font-semibold text-lg mb-5">
          {campus ? 'Edit Campus' : 'New Campus'}
        </h2>
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Campus Name', placeholder: 'MIT University', required: true },
            { key: 'domain', label: 'Email Domain', placeholder: 'mit.edu', required: true, disabled: !!campus },
            { key: 'city', label: 'City', placeholder: 'Cambridge' },
            { key: 'location', label: 'Full Location', placeholder: 'Cambridge, MA, USA' },
          ].map(({ key, label, placeholder, required, disabled }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : campus ? 'Save Changes' : 'Create Campus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { campus?: object }

  const fetchCampuses = () => {
    setLoading(true)
    adminApi.get('/campuses')
      .then(({ data }) => setCampuses(data.data.campuses))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCampuses() }, [])

  const toggleStatus = async (campus) => {
    try {
      await adminApi.patch(`/campuses/${campus._id}/status`)
      fetchCampuses()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Campuses</h1>
            <p className="text-gray-400 text-sm mt-0.5">{campuses.length} total campuses registered</p>
          </div>
          <button
            onClick={() => setModal({ campus: null })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Campus
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Campus</th>
                <th className="text-center px-3 py-3 font-medium"><Users size={13} className="inline mr-1" />Users</th>
                <th className="text-center px-3 py-3 font-medium"><BookOpen size={13} className="inline mr-1" />Resources</th>
                <th className="text-center px-3 py-3 font-medium"><Layers size={13} className="inline mr-1" />Teams</th>
                <th className="text-center px-3 py-3 font-medium"><Calendar size={13} className="inline mr-1" />Events</th>
                <th className="text-center px-3 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading campuses...</td></tr>
              ) : campuses.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">No campuses found.</td></tr>
              ) : (
                campuses.map((campus) => (
                  <tr key={campus._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                          <Building2 size={15} className="text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{campus.name}</p>
                          <p className="text-gray-500 text-xs">{campus.domain} · {campus.city || campus.location || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3.5 text-gray-300">{campus.stats?.students ?? 0}</td>
                    <td className="text-center px-3 py-3.5 text-gray-300">{campus.stats?.resources ?? 0}</td>
                    <td className="text-center px-3 py-3.5 text-gray-300">{campus.stats?.teams ?? 0}</td>
                    <td className="text-center px-3 py-3.5 text-gray-300">{campus.stats?.events ?? 0}</td>
                    <td className="text-center px-3 py-3.5"><Badge active={campus.isActive} /></td>
                    <td className="text-right px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ campus })}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleStatus(campus)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                          title={campus.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {campus.isActive ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <CampusModal
          campus={modal.campus}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchCampuses() }}
        />
      )}
    </AdminLayout>
  )
}
