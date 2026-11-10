// src/pages/admin/AdminSubscribers.jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getSubscribers,
  deleteSubscriber,
  sendSubscriberEmail,
  getBroadcasts,
  markSubscribersSeen,
} from '../../services/subscribersService'

// ready-made starting points: the admin only replaces [title] and [link]
const TEMPLATES = [
  {
    label: 'New post',
    subject: 'New on our blog: [title]',
    body: 'Hello,\n\nWe have just published a new post on the Peak Star Engineering blog:\n\n[title]\n[link]\n\nWe hope you enjoy reading it.\n\nKind regards,',
  },
  {
    label: 'New publication',
    subject: 'New publication: [title]',
    body: 'Hello,\n\nA new publication is now available:\n\n[title]\n[link]\n\nTake a look and share it with your colleagues.\n\nKind regards,',
  },
  {
    label: 'New project',
    subject: 'New project: [title]',
    body: 'Hello,\n\nWe are happy to share a new project from Peak Star Engineering:\n\n[title]\n[link]\n\nKind regards,',
  },
  {
    label: 'New service',
    subject: 'New service: [title]',
    body: 'Hello,\n\nPeak Star Engineering now offers a new service:\n\n[title]\n[link]\n\nContact us to learn how we can help you.\n\nKind regards,',
  },
  {
    label: 'Newsletter',
    subject: 'News from Peak Star Engineering',
    body: 'Hello,\n\n\n\nKind regards,',
  },
]

const FILTERS = ['active', 'unsubscribed']

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(dateString) {
  const mins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

// ── icons ────────────────────────────────────────────────────────────────

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

function IconBell(props) {
  return (
    <svg {...props} {...svg}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
function IconSend(props) {
  return (
    <svg {...props} {...svg}>
      <path d="M6 12 3.27 3.13A59.8 59.8 0 0 1 21.49 12 59.8 59.8 0 0 1 3.27 20.88L6 12Zm0 0h7.5" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} {...svg}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
    </svg>
  )
}
function IconSearch(props) {
  return (
    <svg {...props} {...svg}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
function IconDownload(props) {
  return (
    <svg {...props} {...svg}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}
function IconClose(props) {
  return (
    <svg {...props} {...svg} strokeWidth={2}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function IconCheck(props) {
  return (
    <svg {...props} {...svg} strokeWidth={2.2}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}
function IconUsers(props) {
  return (
    <svg {...props} {...svg}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconUserOff(props) {
  return (
    <svg {...props} {...svg}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m17 8 5 5m0-5-5 5" />
    </svg>
  )
}
function IconSpinner(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" className={`animate-spin ${props.className ?? ''}`}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ── Pop-up to write a message (to one person, or to everyone) ────────────

function ComposeModal({ target, activeCount, onClose, onSent }) {
  const toAll = target === 'all'
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('Hello,\n\n\n\nKind regards,')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !sending) onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose, sending])

  function applyTemplate(t) {
    setSubject(t.subject)
    setBody(t.body)
  }

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    if (!subject.trim()) return setError('Please write a subject.')
    if (!body.trim()) return setError('Please write a message.')
    if (/\[(title|link)\]/i.test(`${subject} ${body}`)) {
      return setError('Please replace [title] and [link] with the real title and web address.')
    }
    if (toAll && !window.confirm(`Send this message to ${activeCount} active ${activeCount === 1 ? 'subscriber' : 'subscribers'}?`)) {
      return
    }

    setSending(true)
    try {
      const res = await sendSubscriberEmail({
        mode: toAll ? 'all' : 'one',
        subscriberId: toAll ? undefined : target.id,
        subject: subject.trim(),
        body: body.trim(),
      })
      setResult(res)
      onSent()
    } catch (err) {
      setError(err.message || 'The message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0A2E27]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => !sending && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="relative bg-gradient-to-br from-[#0D3A31] to-[#1B5E4F] px-5 py-5 text-white sm:px-7">
          <button
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9FD8C9]">
            {toAll ? 'Message to all subscribers' : 'Message to one subscriber'}
          </p>
          <p className="mt-1 text-lg font-bold">
            {toAll ? `${activeCount} active ${activeCount === 1 ? 'subscriber' : 'subscribers'}` : target.email}
          </p>
        </div>

        {result ? (
          <div className="px-5 py-8 text-center sm:px-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
              <IconCheck className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-bold text-gray-900">
              {result.sent} {result.sent === 1 ? 'message' : 'messages'} sent
            </p>
            {result.failed > 0 && (
              <p className="mt-1 text-sm text-red-600">{result.failed} could not be delivered.</p>
            )}
            {result.remaining > 0 && (
              <p className="mx-auto mt-3 max-w-sm rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {result.remaining} more subscribers are still waiting. Gmail limits how many emails can go out in
                one day, so send again tomorrow and they will be next.
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-6 inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#1B5E4F] px-5 text-sm font-medium text-white transition hover:bg-[#154A3F]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-medium text-gray-500">Start from a template</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="cursor-pointer rounded-full border border-[#9FD8C9] bg-[#E6F1EE] px-3 py-1 text-xs font-medium text-[#1B5E4F] transition hover:bg-[#9FD8C9]/50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sub-subject" className="block text-xs font-medium text-gray-600">Subject</label>
              <input
                id="sub-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
              />
            </div>

            <div>
              <label htmlFor="sub-body" className="block text-xs font-medium text-gray-600">Message</label>
              <textarea
                id="sub-body"
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Web addresses become clickable links. Every email gets the Peakstar header, a website button and an
                unsubscribe link automatically.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-4 text-sm font-medium text-white transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? <IconSpinner className="h-4 w-4" /> : <IconSend className="h-4 w-4" />}
                {sending ? 'Sending…' : toAll ? 'Send to all' : 'Send message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [composeTarget, setComposeTarget] = useState(null) // 'all' | subscriber | null

  // ← changed: the active tab lives in the web address (?status=active),
  // so links from the dashboard open the right tab
  const [searchParams, setSearchParams] = useSearchParams()
  const urlStatus = searchParams.get('status')
  const filter = FILTERS.includes(urlStatus) ? urlStatus : 'all' // all | active | unsubscribed
  function setFilter(value) {
    if (value === 'all') setSearchParams({})
    else setSearchParams({ status: value })
  }

  // the people who were new when you opened the page. They keep their
  // red "New" tag while you are here, even though they are already marked as seen.
  const [freshIds, setFreshIds] = useState(() => new Set())

  const load = useCallback(async () => {
    try {
      const [subs, history] = await Promise.all([getSubscribers(), getBroadcasts(5).catch(() => [])])
      setSubscribers(subs)
      setBroadcasts(history)

      // remember who is new, then mark them as seen so the red alert
      // in the sidebar and on the dashboard disappears
      const unseen = subs.filter((s) => !s.seen_at)
      if (unseen.length > 0) {
        setFreshIds((prev) => {
          const next = new Set(prev)
          unseen.forEach((s) => next.add(s.id))
          return next
        })
        markSubscribersSeen().catch((err) => console.error('Failed to mark subscribers as seen:', err))
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // also refreshes every 30 seconds and when you come back to the tab,
  // so someone who subscribes while you are here shows up with the red tag
  useEffect(() => {
    load()
    const timer = setInterval(load, 30000)
    window.addEventListener('focus', load)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [load])

  const activeCount = subscribers.filter((s) => s.status === 'active').length
  const unsubscribedCount = subscribers.length - activeCount
  const freshCount = subscribers.filter((s) => freshIds.has(s.id)).length

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return subscribers.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false
      if (term && !s.email.toLowerCase().includes(term)) return false
      return true
    })
  }, [subscribers, filter, search])

  async function handleDelete(sub) {
    if (!window.confirm(`Remove ${sub.email} from the list? This can't be undone.`)) return
    try {
      await deleteSubscriber(sub.id)
      setSubscribers((prev) => prev.filter((s) => s.id !== sub.id))
    } catch (err) {
      console.error('Failed to delete subscriber:', err)
      window.alert('Could not remove this subscriber.')
    }
  }

  function exportCsv() {
    const rows = [['email', 'status', 'subscribed_at'], ...visible.map((s) => [s.email, s.status, s.subscribed_at])]
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { value: 'all', label: `All (${subscribers.length})` },
    { value: 'active', label: `Active (${activeCount})` },
    { value: 'unsubscribed', label: `Unsubscribed (${unsubscribedCount})` },
  ]

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B5E4F] text-white">
            <IconBell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
            <p className="text-sm text-gray-500">People who subscribed to updates from the website footer.</p>
          </div>
        </div>

        <button
          onClick={() => setComposeTarget('all')}
          disabled={activeCount === 0}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B5E4F] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSend className="h-4 w-4" />
          Send to all ({activeCount})
        </button>
      </div>

      {freshCount > 0 && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {freshCount} new {freshCount === 1 ? 'subscriber' : 'subscribers'} since your last visit
        </p>
      )}

      {/* Counts */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total', value: subscribers.length, icon: IconUsers, color: '#94A3B8' },
          { label: 'Active', value: activeCount, icon: IconCheck, color: '#1B5E4F' },
          { label: 'Unsubscribed', value: unsubscribedCount, icon: IconUserOff, color: '#334155' },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: c.color }}>
              <c.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xl font-bold leading-tight text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                filter === t.value
                  ? 'border-[#1B5E4F] bg-[#1B5E4F] text-white'
                  : 'border-gray-300 text-gray-600 hover:border-[#1B5E4F] hover:text-[#1B5E4F]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64 lg:flex-none">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
            />
          </div>
          <button
            onClick={exportCsv}
            disabled={visible.length === 0}
            title="Download the list as a CSV file"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-[#1B5E4F] hover:text-[#1B5E4F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconDownload className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <IconBell className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">
            {subscribers.length === 0 ? 'No subscribers yet. They will appear here as visitors subscribe.' : 'No subscribers match.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-[minmax(0,1fr)_110px_120px_120px_96px] sm:gap-4">
            <span>Email</span>
            <span>Status</span>
            <span>Subscribed</span>
            <span>Last emailed</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-gray-100">
            {visible.map((s) => {
              const active = s.status === 'active'
              const isFresh = freshIds.has(s.id)
              return (
                <li
                  key={s.id}
                  className={`flex flex-col gap-2 px-4 py-3.5 sm:grid sm:grid-cols-[minmax(0,1fr)_110px_120px_120px_96px] sm:items-center sm:gap-4 sm:px-5 ${
                    isFresh ? 'bg-red-50/40' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5E4F] text-xs font-semibold text-white">
                      {s.email[0]?.toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-medium text-gray-900">{s.email}</span>
                    {isFresh && (
                      <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        active
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500" title={new Date(s.subscribed_at).toLocaleString()}>
                    <span className="text-xs text-gray-400 sm:hidden">Subscribed: </span>
                    {formatDate(s.subscribed_at)}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="text-xs text-gray-400 sm:hidden">Last emailed: </span>
                    {s.last_emailed_at ? timeAgo(s.last_emailed_at) : 'Never'}
                  </p>

                  <div className="flex items-center gap-1 sm:justify-end">
                    <button
                      onClick={() => setComposeTarget(s)}
                      disabled={!active}
                      title={active ? 'Send a message to this person' : 'This person has unsubscribed'}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#1B5E4F] transition hover:bg-[#E6F1EE] disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                    >
                      <IconSend className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      title="Remove from the list"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Recent messages */}
      {broadcasts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recent messages sent</h2>
          <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {broadcasts.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{b.subject}</p>
                  <p className="text-xs text-gray-400">
                    {b.mode === 'all' ? 'To all subscribers' : 'To one subscriber'} · {timeAgo(b.created_at)}
                  </p>
                </div>
                <span className="rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-medium text-[#1B5E4F]">
                  {b.sent_count} sent{b.failed_count > 0 ? `, ${b.failed_count} failed` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {composeTarget && (
        <ComposeModal
          key={composeTarget === 'all' ? 'all' : composeTarget.id}
          target={composeTarget}
          activeCount={activeCount}
          onClose={() => setComposeTarget(null)}
          onSent={load}
        />
      )}
    </main>
  )
}