import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { getProjectById, toggleLikeProject, deleteProject } from '../services/projectService'

function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProjectById(id),
  })

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/projects')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6 max-w-3xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/2" />
              <div className="h-48 bg-gray-700 rounded-xl" />
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-5/6" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="text-center py-20">
              <p className="text-white font-semibold">Project not found.</p>
              <Link to="/projects" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                ← Back to projects
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const isOwner = project.createdBy?._id === user?._id || project.createdBy?._id?.toString() === user?._id?.toString()
  const isLiked = project.likes?.some((id) => id === user?._id || id?.toString() === user?._id?.toString())

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-3xl">
          {/* Back */}
          <Link to="/projects" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-5 transition-colors">
            ← Back to Projects
          </Link>

          <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6 space-y-5">
            {/* Title + actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-white leading-snug">{project.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isLiked
                      ? 'bg-red-900/40 text-red-300 border border-red-700/40'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  }`}
                >
                  ❤️ {project.likes?.length || 0}
                </button>
                {isOwner && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this project?')) deleteMutation.mutate()
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 hover:bg-red-900/40 text-gray-400 hover:text-red-300 border border-gray-600 transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Images */}
            {project.imageUrls?.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {project.imageUrls.map((url, i) => (
                  <img key={i} src={url} alt={`screenshot ${i + 1}`} className="w-full rounded-lg object-cover max-h-64" />
                ))}
              </div>
            )}

            {/* Description */}
            {project.description && (
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            )}

            {/* Tech Stack */}
            {project.techStack?.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((t) => (
                    <span key={t} className="text-sm bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 px-3 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(project.githubUrl || project.demoUrl) && (
              <div className="flex gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    GitHub →
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Live Demo →
                  </a>
                )}
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-700/40">
              {project.createdBy?.avatarUrl ? (
                <img src={project.createdBy.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm text-white font-bold">
                  {project.createdBy?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <Link to={`/profile/${project.createdBy?._id}`} className="text-white font-medium text-sm hover:text-indigo-300 transition-colors">
                  {project.createdBy?.name}
                </Link>
                <p className="text-gray-500 text-xs">
                  {project.createdBy?.branch} {project.createdBy?.year && `• Year ${project.createdBy.year}`}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProjectDetailPage
