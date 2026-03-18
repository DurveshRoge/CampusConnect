import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { sendRequest } from '../services/connectionService'

function ConnectionButton({ userId, connectionStatus }) {
  const queryClient = useQueryClient()
  const [justSent, setJustSent] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => sendRequest(userId),
    onSuccess: () => {
      setJustSent(true)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['connections'] })

      // Show success toast
      toast.success('Connection request sent successfully! 🎉', {
        duration: 3000,
        icon: '✨',
      })

      // Reset the "just sent" state after 3 seconds
      setTimeout(() => setJustSent(false), 3000)
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to send request. Please try again.'
      toast.error(message, {
        duration: 3000,
        icon: '❌',
      })
    },
  })

  if (connectionStatus === 'accepted') {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/40 text-green-300 rounded-full text-xs font-bold uppercase tracking-wide shadow-md shadow-green-500/10"
      >
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </motion.svg>
        Connected
      </motion.span>
    )
  }

  if (connectionStatus === 'pending' || justSent) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wide shadow-md shadow-amber-500/10"
      >
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
        </motion.svg>
        {justSent ? 'Request Sent' : 'Pending'}
      </motion.span>
    )
  }

  if (connectionStatus === 'rejected') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => mutate()}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-indigo-600 hover:to-violet-600 border border-gray-600 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-md shadow-gray-600/20 hover:shadow-indigo-600/30"
      >
        {isPending ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
            />
            Sending...
          </>
        ) : (
          <>
            <span className="text-sm">➕</span>
            Connect
          </>
        )}
      </motion.button>
    )
  }

  // Default: no connection yet
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => mutate()}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50"
    >
      {isPending ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
          />
          Sending...
        </>
      ) : (
        <>
          <span className="text-sm">➕</span>
          Connect
        </>
      )}
    </motion.button>
  )
}

export default ConnectionButton
