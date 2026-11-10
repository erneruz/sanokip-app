// src/components/AuthShell.jsx
// Shared layout and small pieces for the Login and Register pages.
import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'

export default function AuthShell({ panelSide = 'right', eyebrow, title, text, features = [], children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#F1F6F4] lg:grid-cols-2">
      <style>{`
        @keyframes auth-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes auth-drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-22px, 12px); } }
        @keyframes auth-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .auth-fade-up { animation: auth-fade-up .7s ease both; }
        .auth-drift { animation: auth-drift 14s ease-in-out infinite; }
        .auth-float { animation: auth-float 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .auth-fade-up, .auth-drift, .auth-float { animation: none; }
        }
      `}</style>

      {/* -------------------------------------------- */}
      {/* FORM SIDE */}
      {/* -------------------------------------------- */}
      <div className="flex min-h-screen flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Peakstar" className="h-9 w-9 object-contain" />
            <span className="font-semibold text-[#0F3D32]">Peakstar Engineering</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B5E4F] transition hover:text-[#0F3D32]"
          >
            <IconArrowLeft />
            <span className="hidden sm:inline">Back to website</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="auth-fade-up w-full max-w-md rounded-2xl border border-[#D5E5E0] bg-white/80 p-6 shadow-[0_20px_60px_-25px_rgba(15,61,50,0.35)] backdrop-blur sm:p-8">
            {children}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Peakstar Engineering. All rights reserved.
        </p>
      </div>

      {/* -------------------------------------------- */}
      {/* BRAND PANEL (hidden on small screens) */}
      {/* -------------------------------------------- */}
      <div
        className={
          'relative hidden overflow-hidden bg-gradient-to-br from-[#0A2E27] via-[#0D3A31] to-[#1B5E4F] lg:block ' +
          (panelSide === 'left' ? 'lg:order-first' : '')
        }
      >
        {/* soft lights */}
        <div className="absolute -left-16 top-10 h-72 w-72 animate-pulse rounded-full bg-[#2F8F7A]/30 blur-3xl" />
        <div className="absolute -right-10 bottom-20 h-80 w-80 animate-pulse rounded-full bg-[#9FD8C9]/20 blur-3xl" />

        {/* grid + contour lines, like a survey map */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9FD8C9" strokeOpacity="0.07" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="600" height="900" fill="url(#auth-grid)" />

          <g className="auth-drift" fill="none" stroke="#9FD8C9" strokeWidth="1.2">
            <path strokeOpacity="0.22" d="M -60 170 C 110 100, 260 250, 420 150 S 700 130, 780 220" />
            <path strokeOpacity="0.18" d="M -60 225 C 100 160, 250 300, 410 205 S 690 185, 780 275" />
            <path strokeOpacity="0.14" d="M -60 280 C 90 220, 240 350, 400 260 S 680 240, 780 330" />
            <path strokeOpacity="0.1" d="M -60 335 C 80 280, 230 400, 390 315 S 670 295, 780 385" />
          </g>
          <g className="auth-drift" style={{ animationDelay: '-6s' }} fill="none" stroke="#9FD8C9" strokeWidth="1.2">
            <path strokeOpacity="0.16" d="M -60 640 C 140 570, 300 720, 460 610 S 720 570, 780 660" />
            <path strokeOpacity="0.12" d="M -60 695 C 130 625, 290 770, 450 665 S 710 625, 780 715" />
          </g>

          <g fill="#E6F1EE">
            <circle cx="150" cy="205" r="3.5" fillOpacity="0.55" />
            <circle cx="440" cy="640" r="3.5" fillOpacity="0.45" />
            <circle cx="345" cy="410" r="3" fillOpacity="0.35" />
          </g>
        </svg>

        {/* floating ring */}
        <div className="auth-float absolute right-16 top-24 h-24 w-24 rounded-full border border-[#9FD8C9]/30">
          <div className="absolute inset-4 rounded-full border border-[#9FD8C9]/20" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-12 pb-14 xl:px-16">
          <span
            className="auth-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-[#9FD8C9]/30 bg-white/10 px-3 py-1 text-xs font-medium text-[#CFEBE3] backdrop-blur"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#9FD8C9]" />
            {eyebrow}
          </span>

          <h2
            className="auth-fade-up mt-5 text-4xl font-semibold leading-tight tracking-tight text-white"
            style={{ animationDelay: '0.2s' }}
          >
            {title}
          </h2>
          <p
            className="auth-fade-up mt-4 max-w-sm text-sm leading-relaxed text-white/70"
            style={{ animationDelay: '0.3s' }}
          >
            {text}
          </p>

          <ul className="mt-8 space-y-3">
            {features.map((f, i) => (
              <li
                key={f.text}
                className="auth-fade-up flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur"
                style={{ animationDelay: `${0.4 + i * 0.12}s` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2F8F7A]/40 text-[#E6F1EE]">
                  {f.icon}
                </span>
                <span className="text-sm text-[#E6F1EE]">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// One labelled input with an optional icon on the left and a slot on the right
export function AuthField({ label, icon, right, hint, id, ...input }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#0F3D32]">
        {label}
      </label>
      <div className="relative mt-1.5">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#2F8F7A]">
            {icon}
          </span>
        )}
        <input
          id={id}
          {...input}
          className={
            'w-full rounded-xl border border-[#D5E5E0] bg-white py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1B5E4F] focus:ring-2 focus:ring-[#9FD8C9]/60 ' +
            (icon ? 'pl-11 ' : 'pl-4 ') +
            (right ? 'pr-11' : 'pr-4')
          }
        />
        {right}
      </div>
      {hint}
    </div>
  )
}

// Green main button
export function AuthButton({ loading, loadingText, children, ...props }) {
  return (
    <button
      {...props}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] py-3 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F8F7A] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <IconSpinner />}
      {loading ? loadingText : children}
    </button>
  )
}

// Show / hide password eye button
export function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-gray-400 transition hover:text-[#1B5E4F]"
    >
      {shown ? <IconEyeOff /> : <IconEye />}
    </button>
  )
}

// ── small icons ──────────────────────────────────────────────────────────

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconMail() {
  return (
    <svg width="16" height="16" {...base}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
export function IconLock() {
  return (
    <svg width="16" height="16" {...base}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
export function IconUser() {
  return (
    <svg width="16" height="16" {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
export function IconCap() {
  return (
    <svg width="16" height="16" {...base}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  )
}
export function IconTag() {
  return (
    <svg width="16" height="16" {...base}>
      <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
}
export function IconMap() {
  return (
    <svg width="16" height="16" {...base}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
export function IconEye() {
  return (
    <svg width="18" height="18" {...base}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
export function IconEyeOff() {
  return (
    <svg width="18" height="18" {...base}>
      <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.2-5.2M9.9 4.2A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
export function IconArrowLeft() {
  return (
    <svg width="16" height="16" {...base}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}
export function IconCheck() {
  return (
    <svg width="22" height="22" {...base} strokeWidth={2.5}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}
export function IconSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
    </svg>
  )
}