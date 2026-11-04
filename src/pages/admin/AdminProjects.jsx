// src/pages/admin/AdminProjects.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllProjectsForAdmin, deleteProject } from '../../services/projectsService'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  completed: { pill: 'bg-[#1B5E4F] text-white', badge: '#1B5E4F', icon: 'check' },
  ongoing: { pill: 'bg-blue-600 text-white', badge: '#2563EB', icon: 'clock' },
  upcoming: { pill: 'bg-gray-100 text-gray-700', badge: '#94A3B8', icon: 'calendar' },
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'upcoming', label: 'Upcoming' },
]

function StatusIcon({ status, className }) {
  const kind = STATUS_CONFIG[status]?.icon
  if (kind === 'check') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
  if (kind === 'clock') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function AdminProjects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')
  const activeTab = STATUS_CONFIG[statusFilter] ? statusFilter : 'all'

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  async function loadProjects() {
    setLoading(true)
    try {
      const data = await getAllProjectsForAdmin()
      setProjects(data)
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  const filteredProjects = statusFilter
    ? projects.filter((p) => p.status === statusFilter)
    : projects

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    try {
      await deleteProject(id)
      loadProjects()
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  function handlePageChange(page) {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  function selectTab(key) {
    if (key === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ status: key })
    }
  }

  const totalCount = projects.length
  const tabCounts = {
    all: totalCount,
    completed: projects.filter((p) => p.status === 'completed').length,
    ongoing: projects.filter((p) => p.status === 'ongoing').length,
    upcoming: projects.filter((p) => p.status === 'upcoming').length,
  }

  return (
    <main className="px-16 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
              <IconFolder className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage Projects</h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Showcase Peakstar's field work | track what's completed, what's in progress, and what's coming up next.
              </p>
            </div>
          </div>

          <Link
            to="/admin/projects/new"
            className="flex shrink-0 items-center gap-1.5 self-start rounded-md bg-[#1B5E4F] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#154A3F] sm:self-auto"
          >
            <IconPlus className="h-4 w-4" />
            New Project
          </Link>
        </div>

        <div className="mt-5 inline-flex rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className={
                activeTab === tab.key
                  ? 'cursor-pointer rounded-md bg-[#1B5E4F] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition'
                  : 'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900'
              }
            >
              {tab.label} <span className={activeTab === tab.key ? 'text-white/70' : 'text-gray-400'}>({tabCounts[tab.key]})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-gray-500">Loading…</p>
        ) : (
          <div className="mt-5 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="pb-2">Project</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Featured</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProjects.map((project) => {
                  const meta = STATUS_CONFIG[project.status]
                  return (
                    <tr key={project.id} className="border-b border-gray-100">
                      <td className="py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: meta?.badge ?? '#94A3B8' }}
                          >
                            <StatusIcon status={project.status} className="h-3 w-3 text-white" />
                          </span>
                          <span className="truncate font-medium text-gray-900">{project.title}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${meta?.pill ?? 'bg-gray-100 text-gray-600'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {project.featured ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                            <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/projects/${project.id}/edit`}
                            aria-label="Edit project"
                            title="Edit"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#1B5E4F] transition hover:bg-[#EAF5F1]"
                          >
                            <IconEdit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id, project.title)}
                            aria-label="Delete project"
                            title="Delete"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredProjects.length === 0 && (
              <p className="py-6 text-center text-gray-500">
                {activeTab !== 'all' ? `No ${activeTab} projects.` : 'No projects yet.'}
              </p>
            )}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </main>
  )
}

function IconFolder(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
    </svg>
  )
}
function IconPlus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconStar(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconEdit(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}