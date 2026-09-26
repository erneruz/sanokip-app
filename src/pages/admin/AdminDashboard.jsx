// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getDashboardStats } from '../../services/dashboardService'
import { getAllPostsForAdmin } from '../../services/postsService'
import {
  IconDocument, IconCheckCircle, IconEdit, IconChat, IconThumbsUp, IconThumbsDown,
  IconUsers, IconQuote, IconMail, IconBook, IconCalendar, IconWrench, IconFolder,
} from '../../components/icons'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, posts] = await Promise.all([
          getDashboardStats(),
          getAllPostsForAdmin(),
        ])
        setStats(statsData)
        setAllPosts(posts)
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
    { label: 'Total Posts', value: stats.totalPosts, icon: IconDocument },
    { label: 'Published', value: stats.publishedPosts, icon: IconCheckCircle },
    { label: 'Drafts', value: stats.draftPosts, icon: IconEdit },
    { label: 'Comments', value: stats.totalComments, icon: IconChat },
    { label: 'Likes', value: stats.totalLikes, icon: IconThumbsUp },
    { label: 'Dislikes', value: stats.totalDislikes, icon: IconThumbsDown },
    { label: 'Users', value: stats.totalUsers, icon: IconUsers },
    { label: 'Testimonials', value: stats.totalTestimonials, icon: IconQuote },
    { label: 'Messages', value: stats.totalMessages, icon: IconMail },
    { label: 'Publications', value: stats.totalPublications, icon: IconBook },
    { label: 'Events', value: stats.totalEvents, icon: IconCalendar },
    { label: 'Services', value: stats.totalServices, icon: IconWrench },
    { label: 'Projects', value: stats.totalProjects, icon: IconFolder },
  ]

  // Group posts by category name for the chart — computed here, not fetched separately,
  // since we already have every post's category from getAllPostsForAdmin.
  const categoryCounts = {}
  allPosts.forEach((post) => {
    const name = post.categories?.name ?? 'Uncategorized'
    categoryCounts[name] = (categoryCounts[name] ?? 0) + 1
  })
  const chartData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))

  const recentPosts = allPosts.slice(0, 5)

  return (
    <main className="px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">A summary of your blog's activity.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-gradient-to-br from-black to-gray-700 p-5 text-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/60">{card.label}</p>
              <card.icon className="h-4 w-4 text-white/40" />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Posts by Category</h2>
          <div className="mt-4 h-64">
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500">No posts yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#111827" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
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
      </div>
    </main>
  )
}