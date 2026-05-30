import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePermission } from '../../hooks/usePermission'
import {
  LayoutDashboard, Users, AlertTriangle, FileText, Settings,
  Building2, Shield, LogOut, Menu, X, Stethoscope
} from 'lucide-react'

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isSuperAdmin, isHospitalAdmin, isCoordinator, isDoctor } = useAuth()
  const { can } = usePermission()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    ...(isSuperAdmin ? [
      { path: '/superadmin', icon: Shield, label: 'Super Admin', sub: [
        { path: '/superadmin/hospitals', label: 'Hospitals' },
        { path: '/superadmin/audit', label: 'Audit Logs' }
      ]}
    ] : []),
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patients', icon: Users, label: 'Patients' },
    ...(can('escalation:view') || can('escalation:resolve') ? [
      { path: '/escalations', icon: AlertTriangle, label: 'Escalations' }
    ] : []),
    ...(can('report:view') ? [
      { path: '/reports', icon: FileText, label: 'NABH Reports' }
    ] : []),
    ...(isHospitalAdmin ? [
      { path: '/settings', icon: Settings, label: 'Settings' }
    ] : []),
  ]

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ojas-600 rounded-lg flex items-center justify-center">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">Ojas</h1>
            <p className="text-xs text-gray-500">Recovery Monitoring</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ojas-50 text-ojas-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
            {item.sub && location.pathname.startsWith(item.path) && (
              <div className="ml-8 mt-1 space-y-1">
                {item.sub.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={({ isActive }) =>
                      `block px-3 py-1.5 rounded-lg text-sm ${
                        isActive ? 'text-ojas-700 font-medium' : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || user?.email}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform lg:transform-none ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>
    </>
  )
}

export default Sidebar
