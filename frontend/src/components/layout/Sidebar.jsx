import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  FileText, 
  Shield, 
  LogOut,
  Stethoscope
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR'] },
    { path: '/escalations', icon: AlertTriangle, label: 'Escalations', roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR'] },
    { path: '/reports', icon: FileText, label: 'NABH Reports', roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
  ]

  const superAdminItems = [
    { path: '/superadmin/hospitals', icon: Shield, label: 'Super Admin', roles: ['SUPER_ADMIN'] },
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role))
  const filteredSuperAdmin = superAdminItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ojas</h1>
            <p className="text-xs text-gray-500">Recovery Monitoring</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}

        {/* Super Admin Section */}
        {filteredSuperAdmin.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            {filteredSuperAdmin.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path) || location.pathname.startsWith('/superadmin')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role || 'Unknown'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
