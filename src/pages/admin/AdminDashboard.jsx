// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getDashboardStats } from '../../services/dashboardService'
import { getAllPostsForAdmin } from '../../services/postsService'
import { getAllPublications } from '../../services/publicationsService'
import { getContactMessageCounts } from '../../services/contactMessagesService' // ← added
import { getCategory } from '../../constants/publications'
import { useAuth } from '../../context/AuthContext'
import { getFullProfile } from '../../services/profileService'
import {
  IconDocument, IconCheckCircle, IconEdit, IconChat, IconThumbsUp, IconThumbsDown,
  IconUsers, IconQuote, IconMail, IconCalendar, IconWrench, IconFolder, IconBook,
} from '../../components/icons'

const LIGHT_GREY = '#94A3B8'
const DARK_SLATE = '#334155'

const CATEGORY_PALETTE = [
  '#0F3D32', '#17533F', '#1B5E4F', '#237A62', '#2F9678', '#4FB28E', '#7AC9AA', '#A9DFC8',
]

function withPaletteColor(items) {
  return items.map((item, i) => ({ ...item, color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }))
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function BreakdownLink({ label, value, icon: Icon, to, color }) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2 text-gray-600">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Icon className="h-3 w-3 text-white" />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-semibold text-gray-900">{value}</span>
    </>
  )

  if (!to) {
    return <div className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm">{content}</div>
  }

  return (
    <Link to={to} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-[#EAF5F1]">
      {content}
    </Link>
  )
}

function PieBreakdownCard({ title, total, slices, items }) {
  const hasData = slices.some((s) => s.value > 0)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

      {!hasData ? (
        <p className="mt-6 text-sm text-gray-500">No data yet.</p>
      ) : (
        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-28 w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={34}
                  outerRadius={52}
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke="none"
                >
                  {slices.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-900">{total}</span>
              <span className="text-[9px] uppercase tracking-wide text-gray-400">Total</span>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            {items.map((item) => (
              <BreakdownLink key={item.label} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RecentPostsTable({ posts }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Recent Posts</h2>
        <Link to="/admin/posts" className="text-xs font-medium text-[#1B5E4F] hover:underline">
          View all →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No posts yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="pb-2">Post</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const isPublished = post.status === 'published'
                return (
                  <tr key={post.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: isPublished ? '#1B5E4F' : LIGHT_GREY }}
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
                    <td className="py-2.5 text-gray-500">{post.categories?.name ?? '—'}</td>
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
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        aria-label="Edit post"
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#1B5E4F] transition hover:bg-[#EAF5F1]"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [allPosts, setAllPosts] = useState([])
  const [allPublications, setAllPublications] = useState([]) // ← added
  const [messageCounts, setMessageCounts] = useState(null) // ← added
  const [adminProfile, setAdminProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, posts, publications, profileData, msgCounts] = await Promise.all([
          getDashboardStats(),
          getAllPostsForAdmin(),
          getAllPublications(), // ← added
          user?.id ? getFullProfile(user.id).catch(() => null) : Promise.resolve(null),
          getContactMessageCounts().catch(() => null), // ← added: a failure here never breaks the dashboard
        ])
        setStats(statsData)
        setAllPosts(posts)
        setAllPublications(publications) // ← added
        setMessageCounts(msgCounts) // ← added
        setAdminProfile(profileData?.profile ?? null)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  if (loading) {
    return <main className="px-4 py-8 text-gray-500 sm:px-6 lg:px-8">Loading dashboard…</main>
  }

  const recentPosts = allPosts.slice(0, 5)

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const adminDisplayName =
    `${adminProfile?.first_name ?? ''} ${adminProfile?.last_name ?? ''}`.trim() || user?.email || 'Admin'

  const postsItems = [
    { label: 'Total Posts', value: stats.totalPosts, icon: IconDocument, to: '/admin/posts', color: LIGHT_GREY },
    { label: 'Published', value: stats.publishedPosts, icon: IconCheckCircle, to: '/admin/posts?status=published', color: '#1B5E4F' },
    { label: 'Drafts', value: stats.draftPosts, icon: IconEdit, to: '/admin/posts?status=draft', color: DARK_SLATE },
  ]
  const postsSlices = [
    { label: 'Published', value: stats.publishedPosts, color: '#1B5E4F' },
    { label: 'Draft', value: stats.draftPosts, color: DARK_SLATE },
  ]

  const postCategoryCounts = {}
  allPosts.forEach((post) => {
    const name = post.categories?.name ?? 'Uncategorized'
    postCategoryCounts[name] = (postCategoryCounts[name] ?? 0) + 1
  })
  const postCategoryEntries = withPaletteColor(
    Object.entries(postCategoryCounts).map(([name, count]) => ({ name, count }))
  )
  const postsByCategoryData = postCategoryEntries.map((c) => ({ label: c.name, value: c.count, color: c.color }))
  const postsByCategoryItems = [
    { label: 'Total Posts', value: stats.totalPosts, icon: IconDocument, to: '/admin/posts', color: LIGHT_GREY },
    ...postCategoryEntries.map((c) => ({
      label: c.name,
      value: c.count,
      icon: IconTag,
      to: `/admin/posts?category=${encodeURIComponent(c.name)}`,
      color: c.color,
    })),
  ]

  // ← added: same pattern as Posts by Category, built from the publications
  // list using the same getCategory() label lookup AdminPublications uses
  const pubCategoryCounts = {}
  allPublications.forEach((pub) => {
    const label = getCategory(pub.category)?.label || pub.category || 'Uncategorized'
    pubCategoryCounts[label] = (pubCategoryCounts[label] ?? 0) + 1
  })
  const pubCategoryEntries = withPaletteColor(
    Object.entries(pubCategoryCounts).map(([name, count]) => ({ name, count }))
  )
  const publicationsByCategoryData = pubCategoryEntries.map((c) => ({ label: c.name, value: c.count, color: c.color }))
  const publicationsByCategoryItems = [
    { label: 'Total Publications', value: stats.totalPublications, icon: IconBook, to: '/admin/publications', color: LIGHT_GREY },
    ...pubCategoryEntries.map((c) => ({
      label: c.name,
      value: c.count,
      icon: IconTag,
      to: `/admin/publications?category=${encodeURIComponent(c.name)}`,
      color: c.color,
    })),
  ]

  const engagementTotal = stats.totalComments + stats.totalLikes + stats.totalDislikes
  const engagementSlices = [
    { label: 'Comments', value: stats.totalComments, color: '#2563EB' },
    { label: 'Likes', value: stats.totalLikes, color: '#1B5E4F' },
    { label: 'Dislikes', value: stats.totalDislikes, color: '#DC2626' },
  ]
  const engagementItems = [
    { label: 'Total Reactions', value: engagementTotal, icon: IconActivity, color: LIGHT_GREY },
    { label: 'Comments', value: stats.totalComments, icon: IconChat, color: '#2563EB' },
    { label: 'Likes', value: stats.totalLikes, icon: IconThumbsUp, color: '#1B5E4F' },
    { label: 'Dislikes', value: stats.totalDislikes, icon: IconThumbsDown, color: '#DC2626' },
  ]

  const publicationsItems = [
    { label: 'Total Publications', value: stats.totalPublications, icon: IconDocument, to: '/admin/publications', color: LIGHT_GREY },
    { label: 'Published', value: stats.publishedPublications, icon: IconCheckCircle, to: '/admin/publications?status=published', color: '#1B5E4F' },
    { label: 'Drafts', value: stats.draftPublications, icon: IconEdit, to: '/admin/publications?status=draft', color: DARK_SLATE },
  ]
  const publicationsSlices = [
    { label: 'Published', value: stats.publishedPublications, color: '#1B5E4F' },
    { label: 'Draft', value: stats.draftPublications, color: DARK_SLATE },
  ]

  const projectsItems = [
    { label: 'Total Projects', value: stats.totalProjects, icon: IconFolder, to: '/admin/projects', color: LIGHT_GREY },
    { label: 'Completed', value: stats.completedProjects, icon: IconCheckCircle, to: '/admin/projects?status=completed', color: '#1B5E4F' },
    { label: 'Ongoing', value: stats.ongoingProjects, icon: IconClock, to: '/admin/projects?status=ongoing', color: '#2563EB' },
    { label: 'Upcoming', value: stats.upcomingProjects, icon: IconCalendar, to: '/admin/projects?status=upcoming', color: DARK_SLATE },
  ]
  const projectsSlices = [
    { label: 'Completed', value: stats.completedProjects, color: '#1B5E4F' },
    { label: 'Ongoing', value: stats.ongoingProjects, color: '#2563EB' },
    { label: 'Upcoming', value: stats.upcomingProjects, color: DARK_SLATE },
  ]

  const serviceCategoryEntries = withPaletteColor(stats.servicesByCategory ?? [])
  const servicesByCategoryData = serviceCategoryEntries.map((c) => ({ label: c.category, value: c.count, color: c.color }))
  const servicesItems = [
    { label: 'Total Services', value: stats.totalServices, icon: IconWrench, to: '/admin/services', color: LIGHT_GREY },
    ...serviceCategoryEntries.map((c) => ({ label: c.category, value: c.count, icon: IconTag, to: '/admin/services', color: c.color })),
  ]

  const serviceRequestsItems = [
    { label: 'Total Requests', value: stats.totalServiceRequests, icon: IconInbox, to: '/admin/service-requests', color: LIGHT_GREY },
    { label: 'New', value: stats.newRequests, icon: IconMail, to: '/admin/service-requests', color: '#2563EB' },
    { label: 'Contacted', value: stats.contactedRequests, icon: IconChat, to: '/admin/service-requests', color: '#D97706' },
    { label: 'In Progress', value: stats.inProgressRequests, icon: IconClock, to: '/admin/service-requests', color: '#7C3AED' },
    { label: 'Resolved', value: stats.resolvedRequests, icon: IconCheckCircle, to: '/admin/service-requests', color: '#1B5E4F' },
    { label: 'Archived', value: stats.archivedRequests, icon: IconArchive, to: '/admin/service-requests', color: DARK_SLATE },
  ]
  const serviceRequestsData = [
    { label: 'New', value: stats.newRequests, color: '#2563EB' },
    { label: 'Contacted', value: stats.contactedRequests, color: '#D97706' },
    { label: 'In Progress', value: stats.inProgressRequests, color: '#7C3AED' },
    { label: 'Resolved', value: stats.resolvedRequests, color: '#1B5E4F' },
    { label: 'Archived', value: stats.archivedRequests, color: DARK_SLATE },
  ]

  // ← added: messages from the "Write to us" form, by status. Each status link
  // opens the Messages page showing only that status (?status=...).
  const mc = messageCounts ?? { new: 0, read: 0, replied: 0, archived: 0, total: 0 }
  const messagesItems = [
    { label: 'Total Messages', value: mc.total, icon: IconChat, to: '/admin/messages', color: LIGHT_GREY },
    { label: 'New', value: mc.new, icon: IconMail, to: '/admin/messages?status=new', color: '#2563EB' },
    { label: 'Read', value: mc.read, icon: IconEye, to: '/admin/messages?status=read', color: '#D97706' },
    { label: 'Replied', value: mc.replied, icon: IconReply, to: '/admin/messages?status=replied', color: '#1B5E4F' },
    { label: 'Archived', value: mc.archived, icon: IconArchive, to: '/admin/messages?status=archived', color: DARK_SLATE },
  ]
  const messagesSlices = [
    { label: 'New', value: mc.new, color: '#2563EB' },
    { label: 'Read', value: mc.read, color: '#D97706' },
    { label: 'Replied', value: mc.replied, color: '#1B5E4F' },
    { label: 'Archived', value: mc.archived, color: DARK_SLATE },
  ]

  // ← changed: the Messages line now uses the real message total
  const otherModulesTotal = stats.totalUsers + stats.totalTestimonials + mc.total + stats.totalEvents
  const otherModulesSlices = [
    { label: 'Users', value: stats.totalUsers, color: '#4F46E5' },
    { label: 'Testimonials', value: stats.totalTestimonials, color: '#DB2777' },
    { label: 'Messages', value: mc.total, color: '#0891B2' },
    { label: 'Events', value: stats.totalEvents, color: '#EA580C' },
  ]
  const otherModuleItems = [
    { label: 'Total Modules', value: otherModulesTotal, icon: IconDashboardGrid, color: LIGHT_GREY },
    { label: 'Users', value: stats.totalUsers, icon: IconUsers, to: '/admin/users', color: '#4F46E5' },
    { label: 'Testimonials', value: stats.totalTestimonials, icon: IconQuote, to: '/admin/testimonials', color: '#DB2777' },
    { label: 'Messages', value: mc.total, icon: IconMail, to: '/admin/messages', color: '#0891B2' },
    { label: 'Events', value: stats.totalEvents, icon: IconCalendar, to: '/admin/events', color: '#EA580C' },
  ]

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
            <IconDashboardGrid className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1B5E4F]">
              {getGreeting()}, <span className="font-extrabold">{adminDisplayName}</span>
            </p>
            <p className="mt-1.5 text-sm font-medium text-gray-400">Welcome to the</p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Peakstar Engineering Dashboard</h1>
            <p className="mt-1 max-w-xl text-sm text-gray-500">
              A real-time snapshot of Peakstar Engineering contents, projects, services, and client engagement | everything in one place.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start rounded-xl bg-white px-4 py-2.5 text-right shadow-sm ring-1 ring-gray-200 sm:self-auto">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Today</p>
          <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
        </div>
      </div>

      {/* ← added: red alert, only while there are new (unread) messages */}
      {mc.new > 0 && (
        <Link
          to="/admin/messages?status=new"
          className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm transition hover:bg-red-100"
        >
          <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white shadow">
            {mc.new}
          </span>
          <span className="font-medium text-red-800">
            You have {mc.new} unread {mc.new === 1 ? 'message' : 'messages'} waiting.
          </span>
          <span className="ml-auto shrink-0 text-xs font-semibold text-red-700">Read now →</span>
        </Link>
      )}

      {/* ← changed: added "Publications by Category" right after
          "Publications Breakdown", same pattern as Posts by Category;
          added "Messages Breakdown" after "Requested Services Breakdown" */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Breakdowns</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <PieBreakdownCard title="Posts Breakdown" total={stats.totalPosts} slices={postsSlices} items={postsItems} />
          <PieBreakdownCard title="Posts by Category" total={stats.totalPosts} slices={postsByCategoryData} items={postsByCategoryItems} />
          <PieBreakdownCard title="Reactions Breakdown" total={engagementTotal} slices={engagementSlices} items={engagementItems} />

          <PieBreakdownCard title="Publications Breakdown" total={stats.totalPublications} slices={publicationsSlices} items={publicationsItems} />
          <PieBreakdownCard title="Publications by Category" total={stats.totalPublications} slices={publicationsByCategoryData} items={publicationsByCategoryItems} />
          <PieBreakdownCard title="Projects Breakdown" total={stats.totalProjects} slices={projectsSlices} items={projectsItems} />

          <PieBreakdownCard title="Services Breakdown" total={stats.totalServices} slices={servicesByCategoryData} items={servicesItems} />
          <PieBreakdownCard title="Requested Services Breakdown" total={stats.totalServiceRequests} slices={serviceRequestsData} items={serviceRequestsItems} />
          <PieBreakdownCard title="Messages Breakdown" total={mc.total} slices={messagesSlices} items={messagesItems} />

          <PieBreakdownCard title="Other Modules Breakdown" total={otherModulesTotal} slices={otherModulesSlices} items={otherModuleItems} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</h2>
        <div className="mt-3">
          <RecentPostsTable posts={recentPosts} />
        </div>
      </section>
    </main>
  )
}

function IconClock(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  )
}
function IconInbox(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  )
}
function IconArchive(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="5" rx="1" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <line x1="10" y1="13" x2="14" y2="13" />
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
function IconActivity(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function IconDashboardGrid(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" />
    </svg>
  )
}
// ← added: "read" and "replied" icons for the Messages Breakdown
function IconEye(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconReply(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  )
}