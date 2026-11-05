// src/pages/admin/AdminPosts.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllPostsForAdmin, deletePost } from '../../services/postsService'
import Pagination from '../../components/Pagination'
import { IconDocument, IconCheckCircle, IconEdit } from '../../components/icons'

const PAGE_SIZE = 10

const TABS = [
  { key: 'all', label: 'All Posts' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
]

export default function AdminPosts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')
  const activeTab = statusFilter === 'published' || statusFilter === 'draft' ? statusFilter : 'all'
  // ← added: category comes from the same ?category= param the Dashboard's
  // "Posts by Category" card now links to
  const categoryFilter = searchParams.get('category')

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

  // ← added: posts scoped by category only — used so the status-tab counts stay
  // accurate when a category is already selected
  const categoryScopedPosts = categoryFilter
    ? posts.filter((post) => (post.categories?.name ?? 'Uncategorized') === categoryFilter)
    : posts

  const filteredPosts = statusFilter
    ? categoryScopedPosts.filter((post) => post.status === statusFilter)
    : categoryScopedPosts

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter])

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

  // ← changed: tab/category selectors now merge, instead of overwrite, the
  // other active filter — picking a status keeps the current category and
  // vice versa
  function selectTab(key) {
    const next = {}
    if (key !== 'all') next.status = key
    if (categoryFilter) next.category = categoryFilter
    setSearchParams(next)
  }

  function selectCategory(value) {
    const next = {}
    if (statusFilter) next.status = statusFilter
    if (value !== 'all') next.category = value
    setSearchParams(next)
  }

  const totalCount = categoryScopedPosts.length
  const publishedCount = categoryScopedPosts.filter((p) => p.status === 'published').length
  const draftCount = categoryScopedPosts.filter((p) => p.status === 'draft').length
  const tabCounts = { all: totalCount, published: publishedCount, draft: draftCount }

  // ← added: distinct category names across all posts, for the filter dropdown
  const categoryNames = Array.from(
    new Set(posts.map((p) => p.categories?.name ?? 'Uncategorized'))
  ).sort((a, b) => a.localeCompare(b))

  const emptyMessage = (() => {
    const statusLabel = activeTab === 'published' ? 'published' : activeTab === 'draft' ? 'draft' : null
    if (statusLabel && categoryFilter) return `No ${statusLabel} posts in "${categoryFilter}".`
    if (statusLabel) return `No ${statusLabel} posts.`
    if (categoryFilter) return `No posts in "${categoryFilter}".`
    return 'No posts yet.'
  })()

  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
              <IconDocument className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage Posts</h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Write, edit, and publish Peakstar's articles | track what's live and what's still in draft, all in one place.
              </p>
            </div>
          </div>

          <Link
            to="/admin/posts/new"
            className="flex shrink-0 items-center justify-center gap-1.5 self-start rounded-md bg-[#1B5E4F] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#154A3F] sm:self-auto"
          >
            <IconPlus className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {/* ← changed: status tabs and the new category filter sit side by side,
            wrapping to their own rows on narrow screens */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => selectTab(tab.key)}
                  className={
                    activeTab === tab.key
                      ? 'cursor-pointer whitespace-nowrap rounded-md bg-[#1B5E4F] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition'
                      : 'cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900'
                  }
                >
                  {tab.label} <span className={activeTab === tab.key ? 'text-white/70' : 'text-gray-400'}>({tabCounts[tab.key]})</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex shrink-0 items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-gray-500">
              <IconFilter className="h-4 w-4 text-[#1B5E4F]" />
              Category
            </span>
            <select
              value={categoryFilter ?? 'all'}
              onChange={(e) => selectCategory(e.target.value)}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]"
            >
              <option value="all">All Categories</option>
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-8 text-gray-500">Loading…</p>
        ) : (
          <div className="mt-5 rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            {/* mobile card list — sm:hidden */}
            <ul className="divide-y divide-gray-100 px-4 py-2 sm:hidden">
              {paginatedPosts.map((post) => {
                const isPublished = post.status === 'published'
                return (
                  <li key={post.id} className="py-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: isPublished ? '#1B5E4F' : '#94A3B8' }}
                      >
                        {isPublished ? (
                          <IconCheckCircle className="h-3 w-3 text-white" />
                        ) : (
                          <IconEdit className="h-3 w-3 text-white" />
                        )}
                      </span>
                      <p className="min-w-0 flex-1 break-words font-medium text-gray-900">{post.title}</p>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 pl-8">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex items-center gap-1 truncate text-xs text-gray-500">
                          <IconTag className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="truncate">{post.categories?.name ?? '—'}</span>
                        </span>
                        <span
                          className={
                            isPublished
                              ? 'shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                              : 'shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                          }
                        >
                          {post.status}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link
                          to={`/admin/posts/${post.id}/edit`}
                          aria-label="Edit post"
                          title="Edit"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#1B5E4F] transition hover:bg-[#EAF5F1]"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          aria-label="Delete post"
                          title="Delete"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}

              {filteredPosts.length === 0 && (
                <p className="py-6 text-center text-gray-500">{emptyMessage}</p>
              )}
            </ul>

            {/* desktop/tablet table — hidden below sm */}
            <div className="hidden p-5 sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-gray-500">
                  <tr>
                    <th className="pb-2">Post</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPosts.map((post) => {
                    const isPublished = post.status === 'published'
                    return (
                      <tr key={post.id} className="border-b border-gray-100">
                        <td className="py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: isPublished ? '#1B5E4F' : '#94A3B8' }}
                            >
                              {isPublished ? (
                                <IconCheckCircle className="h-3 w-3 text-white" />
                              ) : (
                                <IconEdit className="h-3 w-3 text-white" />
                              )}
                            </span>
                            <span className="truncate font-medium text-gray-900">{post.title}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <IconTag className="h-3.5 w-3.5 text-gray-400" />
                            {post.categories?.name ?? '—'}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={
                              isPublished
                                ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                                : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                            }
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/admin/posts/${post.id}/edit`}
                              aria-label="Edit post"
                              title="Edit"
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#1B5E4F] transition hover:bg-[#EAF5F1]"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              aria-label="Delete post"
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

              {filteredPosts.length === 0 && (
                <p className="py-6 text-center text-gray-500">{emptyMessage}</p>
              )}
            </div>
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

function IconPlus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconFilter(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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