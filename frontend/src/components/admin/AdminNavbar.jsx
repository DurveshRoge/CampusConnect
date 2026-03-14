import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAdminStore from '../../store/adminStore'

export default function AdminNavbar() {
  const navigate = useNavigate()
  const { admin, logout } = useAdminStore()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <p className="text-gray-400 text-sm">Super Admin Dashboard</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-gray-300 text-sm font-medium">{admin?.name || 'Admin'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  )
}
