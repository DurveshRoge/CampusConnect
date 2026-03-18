import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import useUserStore from '../store/userStore'
import { updateProfile, uploadAvatar, uploadResume, deleteResume } from '../services/userService'
import { getInitials } from '../utils/helpers'

function ProfilePage() {
  const { user } = useAuth()
  const updateUser = useUserStore((state) => state.updateUser)
  const aiAnalyzing = useUserStore((state) => state.resumeAiAnalyzing)
  const setAiAnalyzing = useUserStore((state) => state.setResumeAiAnalyzing)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    projects: '',
  })
  const [formError, setFormError] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const resumeInputRef = useRef(null)
  const prevExtractedAt = useRef(user?.resumeData?.extractedAt ?? null)

  // Sync form with current user data
  useEffect(() => {
    if (!user) return
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      projects: Array.isArray(user.projects)
        ? user.projects
          .map((p) => (typeof p === 'string' ? p : p.title || p.name || ''))
          .filter(Boolean)
          .join('\n')
        : '',
    })
  }, [user])

  // When socket pushes resume:analyzed with success, show toast
  // (aiAnalyzing is cleared by useSocket.js via Zustand — works for both success and failure)
  useEffect(() => {
    const currentAt = user?.resumeData?.extractedAt ?? null
    if (currentAt && currentAt !== prevExtractedAt.current) {
      toast.success('AI analysis complete! Skills have been updated.')
    }
    prevExtractedAt.current = currentAt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.resumeData?.extractedAt])

  const { mutate: updateMutate, isPending: updating } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      // service returns the user object directly
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Profile updated successfully!')
      setFormError('')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update profile.'
      setFormError(msg)
      toast.error(msg)
    },
  })

  const { mutate: avatarMutate, isPending: uploadingAvatar } = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      // service returns { avatarUrl, user }
      updateUser({ avatarUrl: data.avatarUrl })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Profile picture updated!')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to upload avatar.'
      toast.error(msg)
    },
  })

  const { mutate: resumeMutate, isPending: uploadingResume } = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      // Backend responds immediately after Cloudinary — AI runs in background via socket
      // Update ONLY the resumeUrl field to avoid conflicts with stale data
      if (data.resumeUrl) {
        updateUser({ resumeUrl: data.resumeUrl })
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setResumeError('')
      setAiAnalyzing(true)   // socket 'resume:analyzed' (via useSocket.js) will clear this
      toast.success('Resume uploaded! AI analysis running...')
    },
    onError: (err) => {
      setAiAnalyzing(false)
      const msg = err.response?.data?.message || 'Failed to upload resume. Please try again.'
      setResumeError(msg)
      toast.error(msg)
    },
  })

  const { mutate: deleteMutate, isPending: deletingResume } = useMutation({
    mutationFn: deleteResume,
    onSuccess: (data) => {
      if (data.user) {
        updateUser(data.user)
      } else {
        updateUser({ resumeUrl: null, resumeData: null })
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setResumeError('')
      setAiAnalyzing(false)
      toast.success('Resume deleted successfully.')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete resume.'
      setResumeError(msg)
      toast.error(msg)
    },
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (formError) setFormError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Name is required.')
      return
    }

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const projectsArray = formData.projects
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => ({ title: p }))

    updateMutate({
      name: formData.name.trim(),
      bio: formData.bio.trim(),
      skills: skillsArray,
      projects: projectsArray,
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.')
      return
    }
    const fd = new FormData()
    fd.append('avatar', file)
    avatarMutate(fd)
  }

  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setResumeError('Invalid file type. Please upload a PDF, DOC, or DOCX file.')
      // Reset input after error
      if (resumeInputRef.current) resumeInputRef.current.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeError('File is too large. Maximum size is 10MB.')
      // Reset input after error
      if (resumeInputRef.current) resumeInputRef.current.value = ''
      return
    }

    setResumeError('')
    const fd = new FormData()
    fd.append('resume', file)
    resumeMutate(fd)
    // Reset input after successful submission so the same file can be re-selected next time
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  // Skill color mapping
  const getSkillColor = (index) => {
    const colors = [
      'bg-indigo-900/40 border-indigo-700/40 text-indigo-300',
      'bg-violet-900/40 border-violet-700/40 text-violet-300',
      'bg-blue-900/40 border-blue-700/40 text-blue-300',
      'bg-cyan-900/40 border-cyan-700/40 text-cyan-300',
      'bg-green-900/40 border-green-700/40 text-green-300',
      'bg-emerald-900/40 border-emerald-700/40 text-emerald-300',
      'bg-purple-900/40 border-purple-700/40 text-purple-300',
      'bg-pink-900/40 border-pink-700/40 text-pink-300',
    ]
    return colors[index % colors.length]
  }

  const previewSkills = formData.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64">

          {/* Cover Banner */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-600/30 via-violet-600/30 to-purple-600/30 border-b border-indigo-700/30">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/60" />
          </div>

          <div className="max-w-4xl mx-auto px-6 -mt-20 relative">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 mb-6"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl overflow-hidden ring-4 ring-indigo-600/30 flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user?.name || '')}</span>
                    )}
                  </div>
                  {/* Change photo button overlay */}
                  <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                    <span className="text-white text-xs font-medium">📷 Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
                  <p className="text-gray-400 text-sm mb-4">{user?.email}</p>

                  {/* Points & Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-700/40 px-4 py-2 rounded-full">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <div>
                        <p className="text-yellow-300 text-sm font-bold">{user?.points || 0}</p>
                        <p className="text-yellow-500 text-xs">Points</p>
                      </div>
                    </div>

                    {user?.badges && user.badges.length > 0 && (
                      <>
                        {user.badges.slice(0, 3).map((badge, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 px-4 py-2 rounded-full">
                            <span className="text-lg">🏆</span>
                            <span className="text-indigo-300 text-sm font-semibold">{badge}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Skills Preview */}
                  {user?.skills && user.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.slice(0, 8).map((skill, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getSkillColor(idx)}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 8 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-700/60 border-gray-600/40 text-gray-400">
                            +{user.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Error banners */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-5"
              >
                <span>⚠️</span>
                {formError}
              </motion.div>
            )}

            {/* Profile Info Form */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 mb-5">
              <h2 className="text-white font-semibold mb-5">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition-colors"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address
                    <span className="text-gray-500 font-normal ml-1">(cannot be changed)</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-700/40 border border-gray-700 text-gray-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Bio
                    <span className="text-gray-500 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell others about yourself, your interests, and what you're working on..."
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 resize-none transition-colors"
                    maxLength={500}
                  />
                  <p className="text-gray-600 text-xs mt-1">{formData.bio.length}/500</p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Skills
                    <span className="text-gray-500 font-normal ml-1">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Python, Machine Learning, Node.js, Java..."
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition-colors"
                  />
                  {/* Live skill preview */}
                  {previewSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {previewSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getSkillColor(idx)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Projects
                    <span className="text-gray-500 font-normal ml-1">(one per line)</span>
                  </label>
                  <textarea
                    name="projects"
                    value={formData.projects}
                    onChange={handleChange}
                    rows={4}
                    placeholder={`Campus Event App\nML Disease Detection Model\nHackathon Winner — Smart Traffic System`}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 resize-none transition-colors"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Each line will be added as a separate project entry.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  {updating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
              </form>
            </div>

            {/* Resume Section */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Resume / CV</h2>

              {user?.resumeUrl && (
                <div className="flex items-center gap-3 bg-gray-700/60 border border-gray-600 rounded-xl p-3 mb-4" key={user.resumeUrl}>
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm font-medium">Current resume</p>
                    <div className="flex gap-3 mt-1">
                      <a
                        href={user.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-xs underline inline-block"
                      >
                        View
                      </a>
                      <a
                        href={user.resumeUrl}
                        download
                        className="text-emerald-400 hover:text-emerald-300 text-xs underline inline-block"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deletingResume}
                        className="text-red-400 hover:text-red-300 text-xs underline disabled:opacity-50"
                      >
                        {deletingResume ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI analyzing banner */}
              {aiAnalyzing && (
                <div className="flex items-center gap-2.5 bg-indigo-900/30 border border-indigo-700/50 text-indigo-300 px-4 py-3 rounded-xl text-sm mb-4">
                  <span className="w-4 h-4 border-2 border-t-indigo-300 border-indigo-300/30 rounded-full animate-spin flex-shrink-0" />
                  Analyzing resume with AI... Skills will update automatically when done.
                </div>
              )}

              <label
                className={`cursor-pointer inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${uploadingResume ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {uploadingResume ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>📤 {user?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}</>
                )}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                  disabled={uploadingResume}
                />
              </label>
              <p className="text-gray-500 text-xs mt-2">
                Accepted formats: PDF, DOC, DOCX — max 10MB
              </p>
              {resumeError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <span>⚠️</span> {resumeError}
                </p>
              )}
            </div>

            {/* AI Resume Analysis */}
            {user?.resumeData?.extractedAt && (
              <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 mt-5">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">🤖</span>
                  <h2 className="text-white font-semibold">AI Resume Analysis</h2>
                  <span className="ml-auto text-xs text-gray-600">
                    {new Date(user.resumeData.extractedAt).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Summary */}
                {user.resumeData.summary && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Summary
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">{user.resumeData.summary}</p>
                  </div>
                )}

                {/* Extracted Skills */}
                {user.resumeData.skills?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Extracted Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.resumeData.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {user.resumeData.experience?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Experience
                    </p>
                    <div className="space-y-2">
                      {user.resumeData.experience.map((exp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-600 mt-0.5 flex-shrink-0">•</span>
                          <div>
                            <span className="text-gray-300 font-medium">{exp.role}</span>
                            {exp.company && (
                              <span className="text-gray-500"> @ {exp.company}</span>
                            )}
                            {exp.duration && (
                              <span className="text-gray-600 text-xs ml-2">({exp.duration})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {user.resumeData.education?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Education
                    </p>
                    <div className="space-y-2">
                      {user.resumeData.education.map((edu, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-600 mt-0.5 flex-shrink-0">•</span>
                          <div>
                            <span className="text-gray-300 font-medium">{edu.institution}</span>
                            {edu.degree && (
                              <span className="text-gray-500"> — {edu.degree}</span>
                            )}
                            {edu.year && (
                              <span className="text-gray-600 text-xs ml-2">({edu.year})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700/60">
                  <p className="text-xs text-gray-600">
                    ✨ AI-extracted skills have been automatically merged into your profile skills above.
                    Upload a new resume to refresh the analysis.
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white text-lg font-semibold mb-3">Delete Resume</h3>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to delete your resume? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingResume}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutate()
                  setShowDeleteModal(false)
                }}
                disabled={deletingResume}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deletingResume ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
