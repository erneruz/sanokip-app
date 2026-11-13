// src/components/admin/talentAdminUi.jsx
// Small pieces shared by the talent admin pages (Submissions, Take-downs, Talent cards,
// Consents): page header, status pill, summary tile, consent dots, buttons, CSV download.
import { CONSENT_KINDS, statusInfo } from '../../constants/talentJourney'
import { IconSearch } from './EntAdminIcons'

export { formatDate } from './entAdminUi'

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// the status of a clip, coloured like on the member side
const PILL_TONES = {
  green: 'bg-[#E6F1EE] text-[#1B5E4F]',
  live: 'bg-[#1B5E4F] text-white',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-500',
}

export function SubmissionPill({ status }) {
  const info = statusInfo(status)
  const tone = status === 'published' || status === 'documentary_linked' ? 'live' : info.tone
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${PILL_TONES[tone]}`}>{info.label}</span>
}

export function PageHeader({ title, text, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1B5E4F]">Peakstar Entertainment · Talent journey</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 max-w-2xl text-sm text-gray-500">{text}</p>}
      </div>
      {children}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full sm:w-72">
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50"
      />
    </label>
  )
}

export function ErrorBar({ children }) {
  if (!children) return null
  return <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{children}</p>
}

// a tile that can be pressed to filter
export function Tile({ label, value, hint, active, alert, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'cursor-pointer rounded-2xl p-4 text-left ring-1 transition active:scale-[0.98] ' +
        (active
          ? 'bg-[#1B5E4F] text-white ring-[#1B5E4F] shadow-md'
          : alert
            ? 'bg-amber-50 text-gray-900 ring-amber-200 hover:bg-amber-100'
            : 'bg-white text-gray-900 ring-gray-200 hover:bg-[#F8FBFA]')
      }
    >
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className={'mt-2 text-xs font-semibold ' + (active ? 'text-white' : 'text-gray-700')}>{label}</p>
      {hint && <p className={'mt-0.5 text-[11px] ' + (active ? 'text-white/70' : 'text-gray-400')}>{hint}</p>}
    </button>
  )
}

// five dots, one for each consent: filled = given and not withdrawn
export function ConsentDots({ consents = [] }) {
  const active = consents.filter((c) => !c.withdrawn_at).map((c) => c.kind)
  return (
    <span className="inline-flex items-center gap-1" title={`${active.length} of ${CONSENT_KINDS.length} consents given`}>
      {CONSENT_KINDS.map((k) => (
        <span
          key={k.kind}
          title={`${k.title}: ${active.includes(k.kind) ? 'given' : 'not given'}`}
          className={'h-2 w-2 rounded-full ' + (active.includes(k.kind) ? 'bg-[#1B5E4F]' : 'bg-gray-300')}
        />
      ))}
    </span>
  )
}

export function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-800">{children || '—'}</dd>
    </div>
  )
}

export const adminBtn = {
  primary:
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#1B5E4F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50',
  amber:
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50',
  soft:
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#E6F1EE] px-4 py-2.5 text-sm font-semibold text-[#0F3D32] transition hover:bg-[#CDEBE2] disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#334155] ring-1 ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
}

export const adminInput =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50'

// download rows as a CSV file (opens in Excel)
export function downloadCsv(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const text = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}