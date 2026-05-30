import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientList from './pages/PatientList'
import PatientDetail from './pages/PatientDetail'
import Enrollment from './pages/Enrollment'
import Escalations from './pages/Escalations'
import Reports from './pages/Reports'
import Hospitals from './pages/SuperAdmin/Hospitals'
import AuditLogs from './pages/SuperAdmin/AuditLogs'
import AcceptInvite from './pages/AcceptInvite'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ojas-600"></div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
      <Route path="/patients/new" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR']}>
          <Enrollment />
        </ProtectedRoute>
      } />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/escalations" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'COORDINATOR', 'DOCTOR']}>
          <Escalations />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
          <Reports />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/hospitals" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Hospitals /></ProtectedRoute>
      } />
      <Route path="/superadmin/audit" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AuditLogs /></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
)

export default App
