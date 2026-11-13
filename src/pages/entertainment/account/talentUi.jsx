// src/pages/entertainment/account/talentUi.jsx
// Small pieces shared by the talent pages (Talent card, Submissions, Consents, Children):
// extra icons, a window (modal), a switch, a role gate and the extra animations.
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { Icon } from './accountUi'

const EXTRA_ICONS = {
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </>
  ),
  play: <path d="m7 4 13 8-13 8V4Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  send: <path d="m22 2-11 11M22 2l-7 20-4-9-9-4 20-7Z" />,
  verified: (
    <>
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M7 21v-3a5 5 0 0 1 10 0v3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  ruler: (
    <>
      <path d="m3 17 14-14 4 4L7 21l-4-4Z" />
      <path d="m8 12 2 2M11 9l2 2M14 6l2 2" />
    </>
  ),
}

// one icon component: the extra icons of this folder, else the common ones
export function TIcon({ name, size = 16, className = '', strokeWidth = 2 }) {
  const body = EXTRA_ICONS[name]
  if (!body) return <Icon name={name} size={size} className={className} strokeWidth={strokeWidth} />
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {body}
    </svg>
  )
}

// only these kinds of members may open the page; others go back to the profile
export function RoleGate({ roles, children }) {
  const { entProfile } = useAuth()
  if (!roles.includes(entProfile?.role)) return <Navigate to="/entertainment/account" replace />
  return children
}

// a window over the page (closes with Escape or a click outside, unless busy)
export function Modal({ title, text, onClose, busy = false, wide = false, children, footer }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [busy, onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#0A2E27]/70 backdrop-blur-sm" onClick={() => !busy && onClose()} />
      <div
        className={`acc-pop relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl ring-1 ring-[#CDEBE2] sm:rounded-3xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
      >
        <header className="flex items-start gap-3 px-5 pb-3 pt-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#0F3D32]">{title}</h2>
            {text && <p className="mt-1 text-sm text-gray-500">{text}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            <TIcon name="close" size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-6">{children}</div>
        {footer && <footer className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

// an on / off switch
export function Switch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F9678] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
        (checked ? 'bg-[#1B5E4F]' : 'bg-gray-300')
      }
    >
      <span
        className={
          'inline-block size-5 rounded-full bg-white shadow transition-transform duration-300 ' +
          (checked ? 'translate-x-6' : 'translate-x-1')
        }
      />
    </button>
  )
}

// buttons used on these pages
export const btnPrimary =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
export const btnSoft =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E6F1EE] px-4 py-2.5 text-sm font-semibold text-[#0F3D32] transition hover:bg-[#CDEBE2] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
export const btnGhost =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 ring-1 ring-gray-300 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
export const btnDanger =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'

// a short note under a page title
export function Notice({ tone = 'info', icon = 'info', children, className = '' }) {
  const tones = {
    info: 'bg-[#F1F6F4] text-[#154A3F] ring-[#CDEBE2]',
    amber: 'bg-amber-50 text-amber-900 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
  }
  return (
    <p className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${tones[tone]} ${className}`}>
      <TIcon name={icon} size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

export function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

// the animations of the talent pages
export function TalentStyles() {
  return (
    <style>{`
      @keyframes trk-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      .trk-fill { transform-origin: left; animation: trk-grow 1.1s cubic-bezier(.2,.8,.2,1) both; }
      @keyframes trk-pulse { 0% { box-shadow: 0 0 0 0 rgba(47,150,120,.5); } 70% { box-shadow: 0 0 0 9px rgba(47,150,120,0); } 100% { box-shadow: 0 0 0 0 rgba(47,150,120,0); } }
      .trk-now { animation: trk-pulse 2.2s ease-out infinite; }
      @keyframes verified-shine { from { background-position: -150% 0; } to { background-position: 250% 0; } }
      .verified-shine { background-image: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.5) 50%, transparent 70%); background-size: 200% 100%; animation: verified-shine 3.4s ease-in-out infinite; }
      @keyframes tal-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .tal-float { animation: tal-float 6s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .trk-fill, .trk-now, .verified-shine, .tal-float { animation: none; }
      }
    `}</style>
  )
}