// src/pages/admin/AdminServiceRequests.jsx
import { useEffect, useState } from 'react'
import {
  getServiceRequests,
  updateServiceRequestStatus,
  deleteServiceRequest,
} from '../../services/serviceRequestsService'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', dot: 'bg-blue-500', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'contacted', label: 'Contacted', dot: 'bg-amber-500', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-purple-500', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'resolved', label: 'Resolved', dot: 'bg-green-500', className: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'archived', label: 'Archived', dot: 'bg-gray-400', className: 'bg-gray-100 text-gray-500 border-gray-200' },
]

const REQUESTER_TYPE_LABELS = {
  individual: 'Individual',
  company: 'Company',
  institution: 'Institution',
  organization: 'Organization',
}

function statusMeta(status) {
  return STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
}

function StatusBadge({ status }) {
  const opt = statusMeta(status)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${opt.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
      {opt.label}
    </span>
  )
}

function initials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

// ── small inline icons, kept local to this page ──────────────────────────

function IconUser(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
    </svg>
  )
}
function IconPhone(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a1.5 1.5 0 001.5-1.5v-2.148a1.5 1.5 0 00-1.164-1.46l-3.643-.91a1.5 1.5 0 00-1.55.52l-.736.92a11.26 11.26 0 01-5.519-5.52l.92-.735a1.5 1.5 0 00.52-1.55l-.91-3.644A1.5 1.5 0 006.398 2.25H4.25a1.5 1.5 0 00-1.5 1.5v3z" />
    </svg>
  )
}
function IconMailIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}
function IconPin(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}
function IconClock(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconBuilding(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 21V5.25A1.5 1.5 0 016 3.75h6a1.5 1.5 0 011.5 1.5V21m-7.5 0h7.5m0 0V9.75a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5V21M9 6.75h.008v.008H9V6.75zm0 3h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm3-6h.008v.008H12V6.75zm0 3h.008v.008H12V9.75zm0 3h.008v.008H12v-.008z" />
    </svg>
  )
}
function IconQuote(props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7.17 6A5.17 5.17 0 002 11.17V18h6.83v-6.83H4.5a2.67 2.67 0 012.67-2.67V6zm10 0a5.17 5.17 0 00-5.17 5.17V18h6.83v-6.83H14.5a2.67 2.67 0 012.67-2.67V6z" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}
function IconInbox(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0L5.25 4.5h13.5L21 8.25m-18 0h18M9 12.75h6" />
    </svg>
  )
}

const STATUS_BORDER = {
  new: 'border-l-blue-500',
  contacted: 'border-l-amber-500',
  in_progress: 'border-l-purple-500',
  resolved: 'border-l-green-500',
  archived: 'border-l-gray-300',
}

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      setRequests(await getServiceRequests())
    } catch (err) {
      console.error('Failed to load service requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(id, status) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await updateServiceRequestStatus(id, status)
    } catch (err) {
      console.error('Failed to update status:', err)
      load()
    }
  }

  async function handleDelete(request) {
    if (!window.confirm(`Delete the request from "${request.requester_name}"? This can't be undone.`)) return
    try {
      await deleteServiceRequest(request.id)
      await load()
    } catch (err) {
      console.error('Failed to delete request:', err)
    }
  }

  const counts = STATUS_OPTIONS.reduce((acc, o) => {
    acc[o.value] = requests.filter((r) => r.status === o.value).length
    return acc
  }, {})

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  return (
    // ← changed: padding scales down on small screens instead of fixed px-8 py-10
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-white rounded-lg w-9 h-9 bg-[#1B5E4F] shrink-0">
          <IconMailIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-sm text-gray-500">
            Requests submitted from the public Services page.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={() => setFilter('all')}
          className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-[#1B5E4F] text-white border-[#1B5E4F]'
              : 'border-gray-300 text-gray-600 hover:border-[#1B5E4F] hover:text-[#1B5E4F]'
          }`}
        >
          All ({requests.length})
        </button>
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setFilter(o.value)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              filter === o.value
                ? 'bg-[#1B5E4F] text-white border-[#1B5E4F]'
                : 'border-gray-300 text-gray-600 hover:border-[#1B5E4F] hover:text-[#1B5E4F]'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${filter === o.value ? 'bg-white' : o.dot}`} />
            {o.label} ({counts[o.value] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center py-20 mt-8 text-center bg-white border border-gray-200 border-dashed rounded-xl">
          <IconInbox className="w-10 h-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">No requests here yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((r) => {
            const isExpanded = expandedId === r.id
            const typeLabel = REQUESTER_TYPE_LABELS[r.requester_type] ?? r.requester_type

            return (
              <div
                key={r.id}
                className={`overflow-hidden bg-white border border-l-4 border-gray-200 shadow-sm rounded-xl transition hover:shadow-md ${STATUS_BORDER[r.status] ?? 'border-l-gray-300'}`}
              >
                {/* ← changed: card is now a vertical stack on mobile — the info block
                    (avatar, name, service, contact) takes full width, and the status
                    select + delete button sit on their own row underneath instead of
                    squeezing into the same row and forcing the title to wrap badly.
                    From sm: up, it goes back to the original side-by-side layout. */}
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex items-start flex-1 min-w-0 gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-11 h-11 shrink-0 bg-[#1B5E4F]">
                      {initials(r.requester_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                          {r.category_name}
                        </p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="mt-0.5 text-base font-bold leading-snug text-gray-900">{r.service_name}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-900">{r.requester_name}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          <IconUser className="w-3 h-3" />
                          {typeLabel}
                        </span>
                        {r.requester_type !== 'individual' && r.organization_name && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            <IconBuilding className="w-3 h-3" />
                            {r.organization_name}
                          </span>
                        )}
                      </div>

                      {/* ← changed: phone and email are now tap-to-call / tap-to-email links */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-600">
                        <a
                          href={`tel:${r.phone_dial_code}${r.phone_number}`}
                          className="inline-flex items-center gap-1.5 hover:text-[#1B5E4F] hover:underline"
                        >
                          <IconPhone className="w-4 h-4 text-gray-400 shrink-0" />
                          {r.phone_dial_code} {r.phone_number}
                        </a>
                        <a
                          href={`mailto:${r.email}`}
                          className="inline-flex min-w-0 items-center gap-1.5 hover:text-[#1B5E4F] hover:underline"
                        >
                          <IconMailIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{r.email}</span>
                        </a>
                        <span className="inline-flex items-center gap-1.5">
                          <IconPin className="w-4 h-4 text-gray-400 shrink-0" />
                          {[r.district_county, r.province_state, r.country].filter(Boolean).join(', ')}
                        </span>
                      </div>

                      {r.message && (
                        <div className="flex gap-2 mt-3">
                          <IconQuote className="w-4 h-4 mt-0.5 text-gray-300 shrink-0" />
                          <div className="min-w-0">
                            <p className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {r.message}
                            </p>
                            {r.message.length > 140 && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                className="mt-1 text-xs font-medium cursor-pointer text-[#1B5E4F] hover:underline"
                              >
                                {isExpanded ? 'Show less' : 'Show full message'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <p
                        className="inline-flex items-center gap-1 mt-3 text-xs text-gray-400"
                        title={new Date(r.created_at).toLocaleString()}
                      >
                        <IconClock className="w-3.5 h-3.5" />
                        Submitted {timeAgo(r.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* ← changed: status select grows to fill the row on mobile (flex-1),
                      delete button stays fixed-size; from sm: up both shrink back to
                      their compact inline size on the right */}
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-3 sm:shrink-0 sm:border-t-0 sm:pt-0">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className="flex-1 cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F] sm:flex-none"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(r)}
                      aria-label="Delete request"
                      className="flex items-center justify-center w-8 h-8 text-gray-400 transition rounded-md cursor-pointer hover:bg-red-50 hover:text-red-600 shrink-0"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}