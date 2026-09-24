// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../../services/dashboardService'
import { getAllPostsForAdmin } from '../../services/postsService'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, posts] = await Promise.all([
          getDashboardStats(),
          getAllPostsForAdmin(),
        ])
        setStats(statsData)
        setRecentPosts(posts.slice(0, 5))
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <main className="px-8 py-10 text-gray-500">Loading dashboard…</main>
  }

  const cards = [
    { label: 'Total Posts', value: stats.totalPosts },
    { label: 'Published', value: stats.publishedPosts },
    { label: 'Drafts', value: stats.draftPosts },
    { label: 'Comments', value: stats.totalComments },
    { label: 'Likes', value: stats.totalLikes },
    { label: 'Dislikes', value: stats.totalDislikes },
  ]

  return (
    <main className="px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">A summary of your blog's activity.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-gradient-to-br from-black to-gray-700 p-5 text-white shadow-sm"
          >
            <p className="text-xs text-white/60">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Posts</h2>
          <Link to="/admin/posts" className="text-sm text-gray-500 hover:text-gray-900">
            View all →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500">No posts yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 last:border-b-0">
                  <td className="px-6 py-3">{post.title}</td>
                  <td className="px-6 py-3 text-gray-500">{post.categories?.name ?? '—'}</td>
                  <td className="px-6 py-3">
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
                  <td className="px-6 py-3 text-right">
                    <Link to={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}