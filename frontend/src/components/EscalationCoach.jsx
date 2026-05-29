import { Lightbulb, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const EscalationCoach = ({ suggestions }) => {
  const [copied, setCopied] = useState(null)

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!suggestions?.length) return null

  return (
    <div className="card mt-4 border-l-4 border-l-ojas-500">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={18} className="text-ojas-600" />
        <h3 className="font-semibold text-gray-900">AI Suggested Actions</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 p-3 bg-ojas-50 rounded-lg">
            <span className="text-ojas-600 font-bold mt-0.5">{i + 1}.</span>
            <p className="text-sm text-gray-700 flex-1">{s}</p>
            <button
              onClick={() => handleCopy(s, i)}
              className="text-gray-400 hover:text-ojas-600 transition-colors"
              title="Copy"
            >
              {copied === i ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EscalationCoach
