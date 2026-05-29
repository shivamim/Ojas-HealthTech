import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientList from './pages/PatientList'
import PatientDetail from './pages/PatientDetail'
import Enrollment from './pages/Enrollment'
import Escalations from './pages/Escalations'
import Hospitals from './pages/SuperAdmin/Hospitals'
import AuditLogs from './pages/SuperAdmin/AuditLogs'
import AcceptInvite from './pages/AcceptInvite'

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 lg:ml-0 min-w-0">
      {children}
    </main>
  </div>
)

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />
  return <Layout>{children}</Layout>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
      <Route path="/patients/new" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR']}><Enrollment /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/escalations" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR']}><Escalations /></ProtectedRoute>} />

      <Route path="/superadmin/hospitals" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Hospitals /></ProtectedRoute>} />
      <Route path="/superadmin/audit" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AuditLogs /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
)

export default App
