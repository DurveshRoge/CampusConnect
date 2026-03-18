import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/ui/EmptyState'
import { ProjectCardSkeleton } from '../components/ui/Skeleton'
import useAuth from '../hooks/useAuth'
import { getProjects, toggleLikeProject } from '../services/projectService'
import { staggerContainer, staggerItem } from '../lib/motion'

const TECH_TAGS = ['React', 'Python', 'Node.js', 'Flutter', 'Machine Learning', 'Java', 'Vue', 'Django']

// Tech stack color mapping
const getTechColor = (tech) => {
  const techLower = tech.toLowerCase()
  if (techLower.includes('react') || techLower.includes('vue') || techLower.includes('angular')) {
    return 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40'
  }
  if (techLower.includes('python') || techLower.includes('django')) {
    return 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40'
  }
  if (techLower.includes('node') || techLower.includes('express')) {
    return 'bg-green-900/40 text-green-300 border-green-700/40'
  }
  if (techLower.includes('flutter') || techLower.includes('dart')) {
    return 'bg-blue-900/40 text-blue-300 border-blue-700/40'
  }
  if (techLower.includes('machine') || techLower.includes('ml') || techLower.includes('ai')) {
    return 'bg-purple-900/40 text-purple-300 border-purple-700/40'
  }
  if (techLower.includes('java')) {
    return 'bg-orange-900/40 text-orange-300 border-orange-700/40'
  }
  return 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

function ProjectCard({ project, onLikeToggle, currentUserId }) {
  const [isLiked, setIsLiked] = useState(project.likes?.includes(currentUserId))
  const [likeCount, setLikeCount] = useState(project.likes?.length || 0)

  const handleLikeClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

    if (onLikeToggle) {
      onLikeToggle(project._id)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(79,70,229,0.2)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        to={`/projects/${project._id}`}
        className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/40 transition-all flex flex-col gap-3 group h-full"
      >
      {project.imageUrls?.[0] && (
        <img
          src={project.imageUrls[0]}
          alt={project.title}
          loading="lazy"
          className="w-full h-36 object-cover rounded-lg"
        />
      )}
      <div>
        <h3 className="text-white font-semibold text-base group-hover:text-indigo-300 transition-colors leading-snug">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
        )}
      </div>
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((t, idx) => (
            <span
              key={idx}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getTechColor(t)}`}
            >
              {t}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-xs text-gray-500 py-1">+{project.techStack.length - 4}</span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700/40">
        <div className="flex items-center gap-2">
          {project.createdBy?.avatarUrl ? (
            <img src={project.createdBy.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" loading="lazy" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
              {project.createdBy?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <span className="text-gray-500 text-xs truncate">{project.createdBy?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeClick}
            className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
            aria-label={isLiked ? 'Unlike project' : 'Like project'}
          >
            <motion.span
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isLiked ? '❤️' : '🤍'}
            </motion.span>
            {likeCount}
          </motion.button>
          <span>{timeAgo(project.createdAt)}</span>
        </div>
      </div>
    </Link>
    </motion.div>
  )
}

function ProjectsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [techFilter, setTechFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', techFilter],
    queryFn: () => getProjects(techFilter || undefined),
    placeholderData: (prev) => prev,
  })

  const likeMutation = useMutation({
    mutationFn: toggleLikeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const handleLikeToggle = (projectId) => {
    likeMutation.mutate(projectId)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Project Showcase</h1>
              <p className="text-gray-400 text-sm mt-1">Discover what your campus is building</p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/projects/create"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
              >
                + New Project
              </Link>
            </motion.div>
          </motion.div>

          {/* Search + Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-3"
          >
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); setTechFilter(searchInput.trim()) }}
            >
              <input
                type="text"
                placeholder="Filter by technology..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Filter
              </motion.button>
              {techFilter && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => { setTechFilter(''); setSearchInput('') }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Clear
                </motion.button>
              )}
            </form>
            <div className="flex flex-wrap gap-2">
              {TECH_TAGS.map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSearchInput(tag); setTechFilter(tag) }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    techFilter === tag
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                      : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              type="projects"
              title={techFilter ? 'No matching projects' : 'No projects yet'}
              description={techFilter
                ? `No projects found with "${techFilter}". Try a different filter.`
                : 'Be the first to showcase your project!'}
              actionLabel={techFilter ? 'Clear Filter' : '+ Add Project'}
              onAction={techFilter ? () => { setTechFilter(''); setSearchInput('') } : undefined}
              actionTo={techFilter ? undefined : '/projects/create'}
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {projects.map((p) => (
                <motion.div key={p._id} variants={staggerItem}>
                  <ProjectCard
                    project={p}
                    currentUserId={user?._id || user?.id}
                    onLikeToggle={handleLikeToggle}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ProjectsPage
