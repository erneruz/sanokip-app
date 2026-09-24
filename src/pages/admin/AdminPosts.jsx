// src/pages/admin/AdminPosts.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllPostsForAdmin, deletePost } from '../../services/postsService'
import Pagination from '../../components/Pagination' // ← added

const PAGE_SIZE = 10 // ← added

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1) // ← added

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

  // ── added: clamp current page if it becomes out of range (e.g. after deleting the last post on a page) ──
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])
  // ─────────────────────────────────────────────────────────────────

  // ── added: slice posts for the current page ──
  const paginatedPosts = posts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )
  // ─────────────────────────────────────────────

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    try {
      await deletePost(id)
      loadPosts()
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  function handlePageChange(page) { // ← added
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <main className="px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Posts</h1>
        <Link to="/admin/posts/new" className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white">
          + New Post
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        // ── changed: wrapped table in a padded, visually distinct card ──
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
              {paginatedPosts.map((post) => ( // ← changed: was posts.map
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

          {posts.length === 0 && ( // ← added: empty state
            <p className="py-6 text-center text-gray-500">No posts yet.</p>
          )}
        </div>
        // ──────────────────────────────────────────────────────────────
      )}

      {/* ── added: pagination controls, only shown when there's more than one page ── */}
      {!loading && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────────────── */}
    </main>
  )
}