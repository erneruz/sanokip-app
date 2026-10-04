// src/pages/admin/AdminProjects.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProjectsForAdmin, deleteProject } from '../../services/projectsService'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  completed: 'bg-gray-900 text-white',
  ongoing: 'bg-blue-600 text-white',
  upcoming: 'bg-gray-100 text-gray-700',
}

export default function AdminProjects() {
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

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE))
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const paginatedProjects = projects.slice(
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

  return (
    <main className="px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
        <Link to="/admin/projects/new" className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white">
          + New Project
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        <div className="mt-8 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="pb-2">Title</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Featured</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100">
                  <td className="py-3">{project.title}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CONFIG[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{project.featured ? 'Yes' : '—'}</td>
                  <td className="py-3 text-right">
                    <Link to={`/admin/projects/${project.id}/edit`} className="mr-4 cursor-pointer text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="cursor-pointer text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {projects.length === 0 && (
            <p className="py-6 text-center text-gray-500">No projects yet.</p>
          )}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </main>
  )
}