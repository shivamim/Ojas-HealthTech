import { useAuth } from '../context/AuthContext'

const PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  HOSPITAL_ADMIN: ['patient:create', 'patient:read', 'patient:update', 'report:view', 'user:manage', 'settings:view'],
  COORDINATOR: ['patient:create', 'patient:read', 'patient:update', 'escalation:resolve'],
  DOCTOR: ['patient:read', 'report:view', 'escalation:view']
}

export const usePermission = () => {
  const { user } = useAuth()

  const can = (action) => {
    if (!user) return false
    const perms = PERMISSIONS[user.role] || []
    return perms.includes('*') || perms.includes(action)
  }

  return { can }
}
