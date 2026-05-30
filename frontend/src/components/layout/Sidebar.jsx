import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  AlertTriangle,
  FileText,
  Building2,
  ClipboardList,
  LogOut,
  X,
  Stethoscope
} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isSuperAdmin, isHospitalAdmin, isCoordinator, isDoctor } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR'] },
    { path: '/patients', label: 'Patients', icon: Users, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR'] },
    { path: '/patients/new', label: 'New Patient', icon: UserPlus, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR'] },
    { path: '/escalations', label: 'Escalations', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR'] },
    { path: '/reports', label: 'NABH Reports', icon: FileText, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    { path: '/superadmin/hospitals', label: 'Hospitals', icon: Building2, roles: ['SUPER_ADMIN'] },
    { path: '/superadmin/audit', label: 'Audit Logs', icon: ClipboardList, roles: ['SUPER_ADMIN'] },
  ]

  const visibleNav = navItems.filter(item => item.roles.includes(user?.role))

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col z-40">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ojas-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 leading-tight">Ojas</h1>
              <p className="text-xs text-gray-500">Post-Discharge Care</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-ojas-50 text-ojas-700 border border-ojas-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-ojas-600 bg-ojas-50 px-2 py-0.5 rounded">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex-col z-50 transform transition-transform lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ojas-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Ojas</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-ojas-50 text-ojas-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => { setIsOpen(false); logout() }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
