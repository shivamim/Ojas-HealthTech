import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'sonner'
import Layout from './components/layout/Layout'

// Lazy load all pages for code splitting - 40-60% reduction in initial bundle
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const PatientList = lazy(() => import('./pages/PatientList'))
const PatientDetail = lazy(() => import('./pages/PatientDetail'))
const Enrollment = lazy(() => import('./pages/Enrollment'))
const Escalations = lazy(() => import('./pages/Escalations'))
const Reports = lazy(() => import('./pages/Reports'))
const Hospitals = lazy(() => import('./pages/SuperAdmin/Hospitals'))
const AuditLogs = lazy(() => import('./pages/SuperAdmin/AuditLogs'))
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'))

// Production-grade skeleton loader that mirrors actual layout
const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
    {/* Header skeleton */}
    <div className="h-16 bg-gray-200 dark:bg-gray-800" />
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
      {/* Content card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      {/* Table skeleton */}
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>
  </div>
)

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageSkeleton />
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
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
    </Suspense>
  )
}

const App = () => (
  <AuthProvider>
    <Toaster 
      position="top-right" 
      richColors 
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
    <AppRoutes />
  </AuthProvider>
)

export default App
