// src/pages/admin/AdminServiceRequests.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getServiceRequests,
  updateServiceRequestStatus,
  deleteServiceRequest,
  markServiceRequestRead,
  sendServiceRequestReply,
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

function fullDate(dateString) {
  return new Date(dateString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// text that starts every reply, so the admin only has to add the answer
function defaultReplyBody(request) {
  const firstName = (request.requester_name || '').trim().split(/\s+/)[0] || ''
  const name = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : 'there'
  return `Hello ${name},\n\nThank you for requesting our "${request.service_name}" service.\n\n\n\nKind regards,`
}

function defaultReplySubject(request) {
  return `Re: ${request.service_name} | Your request to Peak Star Engineering`
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
function IconEye(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconCheck(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}
function IconClose(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )
}
function IconSend(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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

const STATUS_BORDER = {
  new: 'border-l-blue-500',
  contacted: 'border-l-amber-500',
  in_progress: 'border-l-purple-500',
  resolved: 'border-l-green-500',
  archived: 'border-l-gray-300',
}

// ── Pop-up with the full request and the reply form ──────────────────────

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F1EE] text-[#1B5E4F]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <div className="mt-0.5 break-words text-sm font-medium text-gray-900">{children}</div>
      </div>
    </div>
  )
}

function RequestModal({ request, onClose, onStatusChange, onDelete, onSendReply }) {
  const replies = request.service_request_replies ?? []

  const [subject, setSubject] = useState(() => defaultReplySubject(request))
  const [body, setBody] = useState(() => defaultReplyBody(request))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sentNotice, setSentNotice] = useState(false)

  // Escape closes the pop-up, and the page behind it stops scrolling while it is open
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    setSentNotice(false)
    if (!subject.trim()) return setError('Please write a subject.')
    if (!body.trim()) return setError('Please write your reply.')

    setSending(true)
    try {
      await onSendReply(request, subject.trim(), body.trim())
      setBody(defaultReplyBody(request))
      setSentNotice(true)
    } catch (err) {
      setError(err.message || 'The reply could not be sent.')
    } finally {
      setSending(false)
    }
  }

  const typeLabel = REQUESTER_TYPE_LABELS[request.requester_type] ?? request.requester_type
  const location = [request.district_county, request.province_state, request.country].filter(Boolean).join(', ')
  const phone = `${request.phone_dial_code ?? ''} ${request.phone_number ?? ''}`.trim()

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0A2E27]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Service request details"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0D3A31] to-[#1B5E4F] px-5 py-5 text-white sm:px-7 sm:py-6">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold ring-1 ring-white/25">
              {initials(request.requester_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight">{request.requester_name}</p>
              <p className="mt-0.5 text-xs text-[#9FD8C9]">
                {typeLabel}
                {request.requester_type !== 'individual' && request.organization_name
                  ? ` · ${request.organization_name}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9FD8C9]">
              {request.category_name}
            </p>
            <p className="mt-0.5 text-base font-semibold leading-snug">{request.service_name}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-medium text-[#1B5E4F]">
              <IconCheck className="h-3 w-3" />
              Read
            </span>
            {replies.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <IconSend className="h-3 w-3" />
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'} sent
              </span>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Message</p>
            <div className="mt-2 flex gap-3 rounded-xl border border-[#9FD8C9]/60 bg-[#F1F6F4] p-4">
              <IconQuote className="mt-0.5 h-4 w-4 shrink-0 text-[#2F8F7A]" />
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
                {request.message || 'No message was written with this request.'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={IconPhone} label="Phone">
              <a href={`tel:${request.phone_dial_code}${request.phone_number}`} className="hover:text-[#1B5E4F] hover:underline">
                {phone || '—'}
              </a>
            </InfoRow>
            <InfoRow icon={IconMailIcon} label="Email">
              {request.email}
            </InfoRow>
            <InfoRow icon={IconPin} label="Location">
              {location || '—'}
            </InfoRow>
            <InfoRow icon={IconTag} label="Requester type">
              {typeLabel}
            </InfoRow>
            {request.requester_type !== 'individual' && request.organization_name && (
              <InfoRow icon={IconBuilding} label="Organization">
                {request.organization_name}
              </InfoRow>
            )}
            <InfoRow icon={IconClock} label="Submitted">
              {fullDate(request.created_at)}
              <span className="block text-xs font-normal text-gray-400">{timeAgo(request.created_at)}</span>
            </InfoRow>
          </div>

          {/* Replies already sent */}
          {replies.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Replies sent</p>
              <div className="mt-2 space-y-3">
                {replies.map((rep) => (
                  <div key={rep.id} className="rounded-xl border border-green-200 bg-green-50/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0F3D32]">{rep.subject}</p>
                      <p className="text-[11px] text-gray-400" title={fullDate(rep.created_at)}>
                        {timeAgo(rep.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{rep.body}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-400">
                      <IconMailIcon className="h-3 w-3" />
                      Sent to {rep.sent_to}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleSend} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B5E4F] text-white">
                <IconSend className="h-3.5 w-3.5" />
              </span>
              Reply to {request.requester_name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Sent by email to <span className="font-medium text-gray-700">{request.email}</span>
            </p>

            <label className="mt-3 block text-xs font-medium text-gray-600" htmlFor="reply-subject">
              Subject
            </label>
            <input
              id="reply-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
            />

            <label className="mt-3 block text-xs font-medium text-gray-600" htmlFor="reply-body">
              Your reply
            </label>
            <textarea
              id="reply-body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
            />

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {sentNotice && !error && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <IconCheck className="h-4 w-4" />
                Reply sent. The request is now marked Contacted.
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-4 text-sm font-medium text-white transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? <IconSpinner className="h-4 w-4" /> : <IconSend className="h-4 w-4" />}
                {sending ? 'Sending…' : 'Send reply'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-2">
            <label htmlFor="modal-status" className="text-xs font-medium text-gray-500">
              Status
            </label>
            <select
              id="modal-status"
              value={request.status}
              onChange={(e) => onStatusChange(request.id, e.target.value)}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onDelete(request)}
              aria-label="Delete request"
              title="Delete request"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <IconTrash className="h-4 w-4" />
            </button>
            <a
              href={`tel:${request.phone_dial_code}${request.phone_number}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-[#1B5E4F] hover:text-[#1B5E4F]"
            >
              <IconPhone className="h-4 w-4" />
              Call
            </a>
            <button
              onClick={onClose}
              className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  // the active tab lives in the web address (?status=new),
  // so links from the dashboard and the sidebar open the right tab
  const [searchParams, setSearchParams] = useSearchParams()
  const urlStatus = searchParams.get('status')
  const filter = STATUS_OPTIONS.some((o) => o.value === urlStatus) ? urlStatus : 'all'
  function setFilter(value) {
    if (value === 'all') setSearchParams({})
    else setSearchParams({ status: value })
  }

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

  async function markRead(request) {
    if (request.read_at) return
    const now = new Date().toISOString()
    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, read_at: now } : r)))
    try {
      await markServiceRequestRead(request.id)
    } catch (err) {
      console.error('Failed to mark request as read:', err)
      load()
    }
  }

  // the Read button: opens the pop-up and marks the request as read
  function openRequest(request) {
    setSelectedId(request.id)
    markRead(request)
  }

  async function handleStatusChange(id, status) {
    const now = new Date().toISOString()
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status, read_at: r.read_at ?? now } : r)))
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
      setSelectedId(null)
      await load()
    } catch (err) {
      console.error('Failed to delete request:', err)
    }
  }

  // sends the email, then refreshes the list quietly (no loading screen)
  // so the new reply and the "Contacted" status show up in the pop-up
  async function handleSendReply(request, subject, body) {
    await sendServiceRequestReply({ requestId: request.id, subject, body })
    setRequests(await getServiceRequests())
  }

  const counts = STATUS_OPTIONS.reduce((acc, o) => {
    acc[o.value] = requests.filter((r) => r.status === o.value).length
    return acc
  }, {})

  const unreadCount = requests.filter((r) => !r.read_at).length
  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)
  const selected = requests.find((r) => r.id === selectedId) ?? null

  return (
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

      {unreadCount > 0 && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {unreadCount} unread {unreadCount === 1 ? 'request' : 'requests'}. Press <strong>Read</strong> to open it.
        </p>
      )}

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
            const typeLabel = REQUESTER_TYPE_LABELS[r.requester_type] ?? r.requester_type
            const isUnread = !r.read_at
            const replyCount = r.service_request_replies?.length ?? 0

            return (
              <div
                key={r.id}
                className={`overflow-hidden border border-l-4 shadow-sm rounded-xl transition hover:shadow-md ${
                  isUnread ? 'bg-red-50/40 border-red-200' : 'bg-white border-gray-200'
                } ${STATUS_BORDER[r.status] ?? 'border-l-gray-300'}`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex items-start flex-1 min-w-0 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-11 h-11 shrink-0 bg-[#1B5E4F]">
                      {initials(r.requester_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                          {r.category_name}
                        </p>
                        <StatusBadge status={r.status} />
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Unread
                          </span>
                        )}
                        {replyCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            <IconSend className="h-3 w-3" />
                            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 text-base leading-snug text-gray-900 ${isUnread ? 'font-extrabold' : 'font-bold'}`}>
                        {r.service_name}
                      </p>

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

                      {r.message && (
                        <div className="flex gap-2 mt-3">
                          <IconQuote className="w-4 h-4 mt-0.5 text-gray-300 shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-1">{r.message}</p>
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

                  <div className="flex items-center gap-2 border-t border-gray-100 pt-3 sm:shrink-0 sm:border-t-0 sm:pt-0">
                    <button
                      onClick={() => openRequest(r)}
                      className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium transition ${
                        isUnread
                          ? 'bg-[#1B5E4F] text-white hover:bg-[#154A3F]'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-[#1B5E4F] hover:text-[#1B5E4F]'
                      }`}
                    >
                      <IconEye className="h-4 w-4" />
                      {isUnread ? 'Read' : 'View'}
                    </button>
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

      {selected && (
        <RequestModal
          key={selected.id}
          request={selected}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSendReply={handleSendReply}
        />
      )}
    </main>
  )
}