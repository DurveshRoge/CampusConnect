import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const illustrations = {
  events: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="20" y="30" width="80" height="70" rx="8" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="20" y="30" width="80" height="18" rx="8" className="fill-indigo-600/30"/>
      <circle cx="35" cy="39" r="4" className="fill-red-400"/>
      <circle cx="50" cy="39" r="4" className="fill-yellow-400"/>
      <circle cx="65" cy="39" r="4" className="fill-green-400"/>
      <rect x="30" y="58" width="25" height="8" rx="2" className="fill-gray-600"/>
      <rect x="30" y="72" width="40" height="8" rx="2" className="fill-gray-600"/>
      <rect x="30" y="86" width="30" height="8" rx="2" className="fill-gray-600"/>
      <path d="M75 65 L85 75 L105 55" className="stroke-indigo-400" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="15" y="25" width="90" height="70" rx="6" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="25" y="35" width="30" height="20" rx="3" className="fill-indigo-600/40"/>
      <rect x="25" y="60" width="50" height="6" rx="2" className="fill-gray-600"/>
      <rect x="25" y="72" width="35" height="6" rx="2" className="fill-gray-600"/>
      <circle cx="90" cy="80" r="18" className="fill-indigo-600/30 stroke-indigo-500" strokeWidth="2"/>
      <path d="M85 80 L90 85 L98 75" className="stroke-indigo-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  resources: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="30" y="20" width="60" height="80" rx="4" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="40" y="35" width="40" height="6" rx="2" className="fill-gray-500"/>
      <rect x="40" y="48" width="35" height="4" rx="1" className="fill-gray-600"/>
      <rect x="40" y="58" width="30" height="4" rx="1" className="fill-gray-600"/>
      <rect x="40" y="68" width="35" height="4" rx="1" className="fill-gray-600"/>
      <rect x="40" y="78" width="25" height="4" rx="1" className="fill-gray-600"/>
      <circle cx="85" cy="85" r="20" className="fill-emerald-600/20 stroke-emerald-500" strokeWidth="2"/>
      <path d="M78 85 L83 90 L93 78" className="stroke-emerald-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  connections: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <circle cx="40" cy="45" r="18" className="fill-indigo-600/30 stroke-indigo-500" strokeWidth="2"/>
      <circle cx="80" cy="45" r="18" className="fill-violet-600/30 stroke-violet-500" strokeWidth="2"/>
      <circle cx="60" cy="85" r="18" className="fill-purple-600/30 stroke-purple-500" strokeWidth="2"/>
      <line x1="52" y1="55" x2="68" y2="55" className="stroke-gray-500" strokeWidth="2" strokeDasharray="4 2"/>
      <line x1="45" y1="60" x2="55" y2="72" className="stroke-gray-500" strokeWidth="2" strokeDasharray="4 2"/>
      <line x1="75" y1="60" x2="65" y2="72" className="stroke-gray-500" strokeWidth="2" strokeDasharray="4 2"/>
      <circle cx="40" cy="45" r="8" className="fill-indigo-500"/>
      <circle cx="80" cy="45" r="8" className="fill-violet-500"/>
      <circle cx="60" cy="85" r="8" className="fill-purple-500"/>
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="20" y="30" width="60" height="45" rx="8" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <path d="M30 75 L30 90 L45 75" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="30" y="45" width="35" height="6" rx="2" className="fill-gray-500"/>
      <rect x="30" y="56" width="25" height="4" rx="1" className="fill-gray-600"/>
      <rect x="50" y="50" width="50" height="40" rx="8" className="fill-indigo-600/30 stroke-indigo-500" strokeWidth="2"/>
      <rect x="60" y="62" width="30" height="5" rx="2" className="fill-indigo-400/50"/>
      <rect x="60" y="72" width="22" height="4" rx="1" className="fill-indigo-500/30"/>
    </svg>
  ),
  marketplace: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="20" y="35" width="80" height="60" rx="8" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="30" y="45" width="30" height="25" rx="4" className="fill-indigo-600/30"/>
      <rect x="30" y="75" width="25" height="5" rx="2" className="fill-gray-500"/>
      <rect x="30" y="84" width="18" height="4" rx="1" className="fill-gray-600"/>
      <rect x="68" y="45" width="25" height="25" rx="4" className="fill-violet-600/30"/>
      <rect x="68" y="75" width="20" height="5" rx="2" className="fill-gray-500"/>
      <rect x="68" y="84" width="15" height="4" rx="1" className="fill-gray-600"/>
      <circle cx="95" cy="30" r="18" className="fill-yellow-500/20 stroke-yellow-500" strokeWidth="2"/>
      <text x="95" y="35" textAnchor="middle" className="fill-yellow-400 text-lg font-bold">$</text>
    </svg>
  ),
  lostfound: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <circle cx="60" cy="50" r="30" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <line x1="82" y1="72" x2="100" y2="90" className="stroke-gray-500" strokeWidth="6" strokeLinecap="round"/>
      <text x="60" y="58" textAnchor="middle" className="fill-gray-400 text-2xl">?</text>
      <rect x="65" y="80" width="40" height="25" rx="4" className="fill-emerald-600/30 stroke-emerald-500" strokeWidth="2"/>
      <path d="M72 92 L80 100 L98 82" className="stroke-emerald-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  workspace: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="15" y="25" width="90" height="70" rx="6" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="25" y="35" width="35" height="25" rx="3" className="fill-indigo-600/30 stroke-indigo-500" strokeWidth="1"/>
      <rect x="65" y="35" width="30" height="12" rx="2" className="fill-violet-600/20"/>
      <rect x="65" y="52" width="25" height="8" rx="2" className="fill-purple-600/20"/>
      <path d="M30 75 L45 65 L60 72 L75 60" className="stroke-indigo-400" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="30" cy="75" r="3" className="fill-indigo-400"/>
      <circle cx="45" cy="65" r="3" className="fill-indigo-400"/>
      <circle cx="60" cy="72" r="3" className="fill-indigo-400"/>
      <circle cx="75" cy="60" r="3" className="fill-indigo-400"/>
    </svg>
  ),
  studyroom: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <circle cx="60" cy="55" r="35" className="fill-gray-700/30 stroke-gray-600" strokeWidth="2"/>
      <circle cx="60" cy="55" r="28" className="fill-none stroke-indigo-500" strokeWidth="3"/>
      <path d="M60 35 L60 55 L75 65" className="stroke-indigo-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="60" cy="55" r="4" className="fill-indigo-500"/>
      <rect x="40" y="95" width="40" height="10" rx="5" className="fill-emerald-600/30 stroke-emerald-500" strokeWidth="1"/>
      <text x="60" y="103" textAnchor="middle" className="fill-emerald-400 text-xs font-medium">FOCUS</text>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <circle cx="50" cy="50" r="28" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <line x1="70" y1="70" x2="95" y2="95" className="stroke-gray-500" strokeWidth="6" strokeLinecap="round"/>
      <path d="M38 45 Q50 35, 62 45" className="stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="42" cy="52" r="3" className="fill-gray-500"/>
      <circle cx="58" cy="52" r="3" className="fill-gray-500"/>
      <path d="M45 60 Q50 65, 55 60" className="stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32 mx-auto">
      <rect x="25" y="30" width="70" height="60" rx="8" className="fill-gray-700/50 stroke-gray-600" strokeWidth="2"/>
      <rect x="35" y="45" width="50" height="8" rx="2" className="fill-gray-600"/>
      <rect x="35" y="60" width="35" height="6" rx="2" className="fill-gray-600"/>
      <rect x="35" y="72" width="40" height="6" rx="2" className="fill-gray-600"/>
    </svg>
  ),
}

export default function EmptyState({
  type = 'default',
  title = 'Nothing here yet',
  description = 'Check back later or try a different search.',
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) {
  const illustration = illustrations[type] || illustrations.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        {illustration}
      </motion.div>

      <h3 className="text-white font-semibold text-lg mt-6 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>

      {(actionLabel && (actionTo || onAction)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
