// src/pages/admin/EntertainmentDashboard.jsx
// The dashboard of Peakstar Entertainment: members, approvals and content at a glance.
// It only shows what the logged-in staff member is allowed to see.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { listEntUsers, ENT_USERS_CHANGED_EVENT } from '../../services/entertainmentUsersService'
import { getEntContentSummary } from '../../services/entertainmentContentService'
import {
  ENT_ADMIN,
  ENT_CONTENT_KINDS,
  ENT_ROLE_PLURAL,
  manageableEntRoles,
  contentKindLabel,
} from '../../constants/entertainmentAdmin'
import {
  ROLE_ICONS, KIND_ICONS, IconUsersGlyph, IconClock, IconCheck, IconBan, IconGlobe,
} from '../../components/admin/EntAdminIcons'
import { Avatar, RolePill, StatusPill, formatDate } from '../../components/admin/entAdminUi'

const GREY = '#94A3B8'
const SLATE = '#334155'
const GREENS = ['#0F3D32', '#17533F', '#1B5E4F', '#237A62', '#2F9678', '#4FB28E', '#7AC9AA', '#A9DFC8']

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
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
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

function RecentTable({ title, viewAllTo, empty, head, children, hasRows }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="text-xs font-medium text-[#1B5E4F] hover:underline">
            View all →
          </Link>
        )}
      </div>
      {!hasRows ? (
        <p className="mt-6 text-sm text-gray-500">{empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>{head.map((h) => <th key={h} className="pb-2 pr-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function EntertainmentDashboard() {
  const { user, profile, entProfile, can, staffRoles } = useAuth()
  const [members, setMembers] = useState([])
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  const showMembers = can.entertainmentUsers
  const showContent = can.entertainmentContent

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [m, c] = await Promise.all([
          showMembers ? listEntUsers().catch(() => []) : Promise.resolve([]),
          showContent ? getEntContentSummary().catch(() => []) : Promise.resolve([]),
        ])
        if (cancelled) return
        setMembers(m)
        setContent(c)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    window.addEventListener(ENT_USERS_CHANGED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(ENT_USERS_CHANGED_EVENT, load)
    }
  }, [showMembers, showContent])

  if (loading) {
    return <main className="px-4 py-8 text-gray-500 sm:px-6 lg:px-8">Loading dashboard…</main>
  }

  const name =
    entProfile?.full_name?.trim() ||
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() ||
    user?.email ||
    'Admin'

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ── members ──
  const roles = manageableEntRoles(staffRoles)
  const countRole = (r) => members.filter((m) => m.role === r).length
  const countStatus = (s) => members.filter((m) => m.status === s).length
  const pending = countStatus('pending')

  const roleSlices = roles.map((r, i) => ({ label: ENT_ROLE_PLURAL[r], value: countRole(r), color: GREENS[i % GREENS.length] }))
  const roleItems = [
    { label: 'All members', value: members.length, icon: IconUsersGlyph, to: `${ENT_ADMIN}/members`, color: GREY },
    ...roles.map((r, i) => ({
      label: ENT_ROLE_PLURAL[r],
      value: countRole(r),
      icon: ROLE_ICONS[r],
      to: `${ENT_ADMIN}/members?role=${r}`,
      color: GREENS[i % GREENS.length],
    })),
  ]

  const statusSlices = [
    { label: 'Active', value: countStatus('active'), color: '#1B5E4F' },
    { label: 'Pending', value: pending, color: '#7AC9AA' },
    { label: 'Suspended', value: countStatus('suspended'), color: SLATE },
  ]
  const statusItems = [
    { label: 'All members', value: members.length, icon: IconUsersGlyph, to: `${ENT_ADMIN}/members`, color: GREY },
    { label: 'Active', value: countStatus('active'), icon: IconCheck, to: `${ENT_ADMIN}/members?status=active`, color: '#1B5E4F' },
    { label: 'Pending approval', value: pending, icon: IconClock, to: `${ENT_ADMIN}/members?status=pending`, color: '#7AC9AA' },
    { label: 'Suspended', value: countStatus('suspended'), icon: IconBan, to: `${ENT_ADMIN}/members?status=suspended`, color: SLATE },
  ]

  const countryCounts = {}
  members.forEach((m) => {
    const c = m.country || 'Not given'
    countryCounts[c] = (countryCounts[c] ?? 0) + 1
  })
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({ label, value, color: GREENS[i % GREENS.length] }))
  const countryItems = [
    { label: 'All members', value: members.length, icon: IconUsersGlyph, color: GREY },
    ...topCountries.map((c) => ({ ...c, icon: IconGlobe })),
  ]

  // ── content ──
  const countKind = (k) => content.filter((c) => c.kind === k).length
  const countContentStatus = (s) => content.filter((c) => c.status === s).length
  const kindSlices = ENT_CONTENT_KINDS.map((k, i) => ({ label: k.label, value: countKind(k.kind), color: GREENS[i % GREENS.length] }))
  const kindItems = [
    { label: 'All content', value: content.length, icon: KIND_ICONS.news, color: GREY },
    ...ENT_CONTENT_KINDS.map((k, i) => ({
      label: k.label,
      value: countKind(k.kind),
      icon: KIND_ICONS[k.kind],
      to: `${ENT_ADMIN}/${k.path}`,
      color: GREENS[i % GREENS.length],
    })),
  ]
  const contentStatusSlices = [
    { label: 'Published', value: countContentStatus('published'), color: '#1B5E4F' },
    { label: 'Draft', value: countContentStatus('draft'), color: SLATE },
    { label: 'Archived', value: countContentStatus('archived'), color: GREY },
  ]
  const contentStatusItems = [
    { label: 'All content', value: content.length, icon: KIND_ICONS.news, color: GREY },
    { label: 'Published', value: countContentStatus('published'), icon: IconCheck, color: '#1B5E4F' },
    { label: 'Draft', value: countContentStatus('draft'), icon: IconClock, color: SLATE },
    { label: 'Archived', value: countContentStatus('archived'), icon: IconBan, color: GREY },
  ]

  const kindPath = (kind) => ENT_CONTENT_KINDS.find((k) => k.kind === kind)?.path ?? ''

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
            <IconUsersGlyph className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1B5E4F]">
              {getGreeting()}, <span className="font-extrabold">{name}</span>
            </p>
            <p className="mt-1.5 text-sm font-medium text-gray-400">Welcome to the</p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Peakstar Entertainment Dashboard</h1>
            <p className="mt-1 max-w-xl text-sm text-gray-500">
              A real-time snapshot of Peakstar Entertainment members, approvals and content | everything in one place.
            </p>
          </div>
        </div>
        <div className="shrink-0 self-start rounded-xl bg-white px-4 py-2.5 text-right shadow-sm ring-1 ring-gray-200 sm:self-auto">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Today</p>
          <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
        </div>
      </div>

      {showMembers && pending > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Link
            to={`${ENT_ADMIN}/members?status=pending`}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm transition hover:bg-red-100"
          >
            <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white shadow">
              {pending}
            </span>
            <span className="font-medium text-red-800">
              {pending} {pending === 1 ? 'member waiting' : 'members waiting'} for approval
            </span>
            <span className="ml-auto shrink-0 text-xs font-semibold text-red-700">Review now →</span>
          </Link>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Breakdowns</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {showMembers && (
            <>
              <PieBreakdownCard title="Members by Role" total={members.length} slices={roleSlices} items={roleItems} />
              <PieBreakdownCard title="Members by Status" total={members.length} slices={statusSlices} items={statusItems} />
              <PieBreakdownCard title="Members by Country" total={members.length} slices={topCountries} items={countryItems} />
            </>
          )}
          {showContent && (
            <>
              <PieBreakdownCard title="Content by Type" total={content.length} slices={kindSlices} items={kindItems} />
              <PieBreakdownCard title="Content Status" total={content.length} slices={contentStatusSlices} items={contentStatusItems} />
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {showMembers && (
            <RecentTable
              title="Latest Sign-ups"
              viewAllTo={`${ENT_ADMIN}/members`}
              empty="No members yet."
              head={['Member', 'Role', 'Status', 'Joined']}
              hasRows={members.length > 0}
            >
              {members.slice(0, 6).map((m) => (
                <tr key={m.user_id} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-2.5 pr-3">
                    <Link to={`${ENT_ADMIN}/members?role=${m.role}`} className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={m.full_name || m.email} size="h-7 w-7" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900">{m.full_name || '—'}</span>
                        <span className="block truncate text-xs text-gray-400">{m.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3"><RolePill role={m.role} /></td>
                  <td className="py-2.5 pr-3"><StatusPill status={m.status} /></td>
                  <td className="py-2.5 text-gray-500">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </RecentTable>
          )}
          {showContent && (
            <RecentTable
              title="Latest Content"
              empty="No content yet."
              head={['Title', 'Type', 'Status', 'Created']}
              hasRows={content.length > 0}
            >
              {content.slice(0, 6).map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-2.5 pr-3">
                    <Link to={`${ENT_ADMIN}/${kindPath(c.kind)}`} className="block max-w-[14rem] truncate font-medium text-gray-900 hover:text-[#1B5E4F]">
                      {c.title}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500">{contentKindLabel(c.kind)}</td>
                  <td className="py-2.5 pr-3"><StatusPill status={c.status} /></td>
                  <td className="py-2.5 text-gray-500">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </RecentTable>
          )}
        </div>
      </section>
    </main>
  )
}