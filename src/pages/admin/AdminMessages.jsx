// src/pages/admin/AdminMessages.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  sendContactReply,
} from '../../services/contactMessagesService'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', dot: 'bg-blue-500', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'read', label: 'Read', dot: 'bg-amber-500', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'replied', label: 'Replied', dot: 'bg-green-500', className: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'archived', label: 'Archived', dot: 'bg-gray-400', className: 'bg-gray-100 text-gray-500 border-gray-200' },
]

const STATUS_BORDER = {
  new: 'border-l-blue-500',
  read: 'border-l-amber-500',
  replied: 'border-l-green-500',
  archived: 'border-l-gray-300',
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

const fullDate = (d) =>
  new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// ── small inline icons, kept local to this page ──────────────────────────

function IconMailIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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
function IconClock(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
function IconSend(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.27 3.13a.75.75 0 011.04-.89l16.5 8.25a.75.75 0 010 1.34l-16.5 8.25a.75.75 0 01-1.04-.89L6 12zm0 0h7.5" />
    </svg>
  )
}
function IconX(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function IconReply(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  )
}

const phoneOf = (m) => (m.phone ? `${m.phone_dial_code ?? ''} ${m.phone}`.trim() : '')

function defaultReply(message) {
  const first = (message.full_name || '').trim().split(/\s+/)[0] || 'there'
  return {
    subject: 'Re: Your message to Peak Star Engineering',
    body: `Dear ${first},\n\nThank you for writing to Peak Star Engineering.\n\n\n\nKind regards,\nPeak Star Engineering`,
  }
}

// ── the page ─────────────────────────────────────────────────────────────

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // ← changed: the active tab lives in the web address (?status=new),
  // so links from the dashboard and the sidebar open the right tab
  const [searchParams, setSearchParams] = useSearchParams()
  const urlStatus = searchParams.get('status')
  const filter = STATUS_OPTIONS.some((o) => o.value === urlStatus) ? urlStatus : 'all'
  function setFilter(value) {
    if (value === 'all') setSearchParams({})
    else setSearchParams({ status: value })
  }

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sentNote, setSentNote] = useState('')

  async function load() {
    try {
      setMessages(await getContactMessages())
      setLoadError('')
    } catch (err) {
      console.error('Failed to load messages:', err)
      setLoadError('Messages could not be loaded. Check that the SQL script was run.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const selected = messages.find((m) => m.id === selectedId) ?? null

  // close the panel with Escape
  useEffect(() => {
    if (!selectedId) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  async function handleStatusChange(id, status) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    try {
      await updateContactMessageStatus(id, status)
    } catch (err) {
      console.error('Failed to update status:', err)
      load()
    }
  }

  function openMessage(m) {
    setSelectedId(m.id)
    const d = defaultReply(m)
    setSubject(d.subject)
    setBody(d.body)
    setSendError('')
    setSentNote('')
    if (m.status === 'new') handleStatusChange(m.id, 'read')
  }

  async function handleDelete(m) {
    if (!window.confirm(`Delete the message from "${m.full_name}" and its replies? This can't be undone.`)) return
    try {
      await deleteContactMessage(m.id)
      if (selectedId === m.id) setSelectedId(null)
      await load()
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!selected || sending) return
    setSendError('')
    setSentNote('')

    if (subject.trim().length < 3) return setSendError('Please write a subject.')
    if (body.trim().length < 2) return setSendError('Please write your reply.')

    setSending(true)
    try {
      await sendContactReply({ messageId: selected.id, subject, body })
      setSentNote(`Reply sent to ${selected.email}.`)
      const d = defaultReply(selected)
      setSubject(d.subject)
      setBody(d.body)
      await load()
    } catch (err) {
      setSendError(err.message || 'The reply could not be sent.')
    } finally {
      setSending(false)
    }
  }

  const counts = STATUS_OPTIONS.reduce((acc, o) => {
    acc[o.value] = messages.filter((m) => m.status === o.value).length
    return acc
  }, {})

  const visible = filter === 'all' ? messages : messages.filter((m) => m.status === filter)

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-white rounded-lg w-9 h-9 bg-[#1B5E4F] shrink-0">
          <IconMailIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">
            Messages sent from the "Write to us" form on the Home page.
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
          All ({messages.length})
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
      ) : loadError ? (
        <p className="px-4 py-3 mt-8 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">{loadError}</p>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center py-20 mt-8 text-center bg-white border border-gray-200 border-dashed rounded-xl">
          <IconInbox className="w-10 h-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">No messages here yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((m) => {
            const isNew = m.status === 'new'
            const replies = m.contact_replies?.length ?? 0
            const phone = phoneOf(m)

            return (
              <div
                key={m.id}
                className={`overflow-hidden bg-white border border-l-4 border-gray-200 shadow-sm rounded-xl transition hover:shadow-md ${STATUS_BORDER[m.status] ?? 'border-l-gray-300'}`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex items-start flex-1 min-w-0 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-11 h-11 shrink-0 bg-[#1B5E4F]">
                      {initials(m.full_name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-base text-gray-900 ${isNew ? 'font-bold' : 'font-semibold'}`}>{m.full_name}</span>
                        <StatusBadge status={m.status} />
                        {replies > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F1EE] px-2 py-0.5 text-[11px] font-medium text-[#1B5E4F]">
                            <IconReply className="w-3 h-3" />
                            {replies} {replies === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-sm text-gray-600">
                        <a href={`mailto:${m.email}`} className="inline-flex min-w-0 items-center gap-1.5 hover:text-[#1B5E4F] hover:underline">
                          <IconMailIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </a>
                        {phone && (
                          <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-[#1B5E4F] hover:underline">
                            <IconPhone className="w-4 h-4 text-gray-400 shrink-0" />
                            {phone}
                          </a>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <IconQuote className="w-4 h-4 mt-0.5 text-gray-300 shrink-0" />
                        <p className={`min-w-0 text-sm line-clamp-2 ${isNew ? 'text-gray-900' : 'text-gray-700'}`}>{m.message}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                        <p className="inline-flex items-center gap-1 text-xs text-gray-400" title={fullDate(m.created_at)}>
                          <IconClock className="w-3.5 h-3.5" />
                          Received {timeAgo(m.created_at)}
                        </p>
                        <button
                          onClick={() => openMessage(m)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#1B5E4F] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#154A3E]"
                        >
                          <IconReply className="w-3.5 h-3.5" />
                          Open and reply
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 sm:shrink-0 sm:border-t-0 sm:pt-0">
                    <select
                      value={m.status}
                      onChange={(e) => handleStatusChange(m.id, e.target.value)}
                      className="flex-1 cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F] sm:flex-none"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(m)}
                      aria-label="Delete message"
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

      {/* ── side panel: full message, conversation, reply ── */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedId(null)} aria-hidden="true" />

          <aside className="relative flex h-full w-full max-w-xl flex-col bg-gray-50 shadow-2xl">
            {/* header */}
            <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-11 h-11 shrink-0 bg-[#1B5E4F]">
                {initials(selected.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 truncate">{selected.full_name}</p>
                <div className="mt-0.5"><StatusBadge status={selected.status} /></div>
              </div>
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="flex items-center justify-center text-gray-500 transition rounded-lg cursor-pointer h-9 w-9 shrink-0 hover:bg-gray-100"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* scrolling area */}
            <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto sm:px-6">
              {/* contact details */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 hover:text-[#1B5E4F] hover:underline">
                  <IconMailIcon className="w-4 h-4 text-gray-400" />
                  {selected.email}
                </a>
                {phoneOf(selected) && (
                  <a href={`tel:${phoneOf(selected).replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-[#1B5E4F] hover:underline">
                    <IconPhone className="w-4 h-4 text-gray-400" />
                    {phoneOf(selected)}
                  </a>
                )}
              </div>

              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Conversation</p>

              {/* the visitor's message */}
              <div className="max-w-[92%]">
                <div className="px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-sm">
                  <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words">{selected.message}</p>
                </div>
                <p className="mt-1 ml-1 text-[11px] text-gray-400">
                  {selected.full_name} · {fullDate(selected.created_at)}
                </p>
              </div>

              {/* replies already sent */}
              {(selected.contact_replies ?? []).map((r) => (
                <div key={r.id} className="ml-auto max-w-[92%]">
                  <div className="px-4 py-3 text-white shadow-sm rounded-2xl rounded-tr-sm bg-[#1B5E4F]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9FD8C9]">{r.subject}</p>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words">{r.body}</p>
                  </div>
                  <p className="mt-1 mr-1 text-right text-[11px] text-gray-400">
                    Sent to {r.sent_to} · {fullDate(r.created_at)}
                  </p>
                </div>
              ))}

              {/* reply form */}
              <form onSubmit={handleSend} className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <IconReply className="w-4 h-4 text-[#1B5E4F]" />
                  Reply to {selected.full_name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">The email will be sent to {selected.email}.</p>

                <label className="block mt-4 text-xs font-semibold text-gray-700" htmlFor="reply-subject">Subject</label>
                <input
                  id="reply-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
                />

                <label className="block mt-3 text-xs font-semibold text-gray-700" htmlFor="reply-body">Your reply</label>
                <textarea
                  id="reply-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  maxLength={10000}
                  className="w-full px-3 py-2 mt-1 text-sm leading-relaxed border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
                />

                {sendError && (
                  <p role="alert" className="px-3 py-2 mt-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">{sendError}</p>
                )}
                {sentNote && (
                  <p className="px-3 py-2 mt-3 text-sm text-green-700 border border-green-200 rounded-md bg-green-50">{sentNote}</p>
                )}

                <div className="flex items-center justify-between gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <IconTrash className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#154A3E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconSend className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}