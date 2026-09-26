// src/pages/admin/AdminPosts.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllPostsForAdmin, deletePost } from '../../services/postsService'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 10

export default function AdminPosts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  async function loadPosts() {
    setLoading(true)
    try {
      const data = await getAllPostsForAdmin()
      setPosts(data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const filteredPosts = statusFilter
    ? posts.filter((post) => post.status === statusFilter)
    : posts

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    try {
      await deletePost(id)
      loadPosts()
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  function handlePageChange(page) {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  function clearFilter() {
    setSearchParams({})
  }

  const statusLabel =
    statusFilter === 'published' ? 'Published' : statusFilter === 'draft' ? 'Drafts' : null

  return (
    <main className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Posts</h1>

          {statusLabel && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-900 py-1 pl-3 pr-1 text-xs font-medium text-white">
              <span>{statusLabel} ({filteredPosts.length})</span>
              <button
                onClick={clearFilter}
                aria-label={`Clear ${statusLabel} filter`}
                className="cursor-pointer rounded-full p-1 opacity-70 transition hover:bg-white/20 hover:opacity-100"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <Link to="/admin/posts/new" className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white">
          + New Post
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
                <th className="pb-2">Category</th>
                <th className="pb-2">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100">
                  <td className="py-3">{post.title}</td>
                  <td className="py-3 text-gray-500">{post.categories?.name ?? '—'}</td>
                  <td className="py-3">
                    <span
                      className={
                        post.status === 'published'
                          ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                          : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                      }
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/admin/posts/${post.id}/edit`} className="mr-4 cursor-pointer text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="cursor-pointer text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <p className="py-6 text-center text-gray-500">
              {statusLabel ? `No ${statusLabel.toLowerCase()} posts.` : 'No posts yet.'}
            </p>
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