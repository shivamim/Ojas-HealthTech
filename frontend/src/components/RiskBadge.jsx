import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

const RiskBadge = ({ score, level, size = 'md' }) => {
  const config = {
    CRITICAL: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    HIGH: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    MEDIUM: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle },
    LOW: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle }
  }

  const c = config[level] || config.LOW
  const Icon = c.icon
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${c.color} ${sizeClasses}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      {level} {score > 0 && `(${score})`}
    </span>
  )
}

export default RiskBadge
