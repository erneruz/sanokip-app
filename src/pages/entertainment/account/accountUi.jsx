// src/pages/entertainment/account/accountUi.jsx
// Small pieces shared by the profile pages: icons, form field, cards, chips.

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50'

/* ---------- icons (one place, used by name) ---------- */
const ICONS = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <circle cx="18" cy="10" r="2" />
      <path d="M18 14.5a3.5 3.5 0 0 1 3 3.5v1" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M16 7l3 3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  check: <path d="m5 12 5 5L20 7" />,
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  shield: <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" />
      <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </>
  ),
  star: <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" />,
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  text: <path d="M4 6h16M4 12h16M4 18h10" />,
  sparkle: (
    <>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M19 16v4M17 18h4" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20" />
      <path d="M8 7h4M8 11h4M8 15h4" />
    </>
  ),
}

export function Icon({ name, size = 16, className = '', strokeWidth = 2 }) {
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
      {ICONS[name] ?? ICONS.info}
    </svg>
  )
}

// the icon of each kind of member
export const ROLE_ICON = {
  visitor: 'eye',
  talent: 'star',
  guardian: 'users',
  scout: 'search',
  manager: 'clipboard',
  partner: 'briefcase',
}

/* ---------- small helpers ---------- */

// a saved phone number written in any way -> "+250788123456"
export function toInternational(raw) {
  const text = String(raw ?? '').trim()
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) return ''
  if (text.startsWith('+')) return `+${digits}`
  if (digits.startsWith('0')) return `+250${digits.slice(1)}`
  if (digits.startsWith('250') && digits.length === 12) return `+${digits}`
  if (digits.length === 9) return `+250${digits}`
  return `+${digits}`
}

export function formatMonthYear(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

export function StatusChip({ status }) {
  const styles = {
    active: 'bg-[#1B5E4F] text-white',
    pending: 'border border-dashed border-[#2F9678] bg-[#F1F6F4] text-[#154A3F]',
    suspended: 'bg-gray-200 text-gray-600',
  }
  const labels = { active: 'Active', pending: 'Waiting for approval', suspended: 'Suspended' }
  const icons = { active: 'check', pending: 'clock', suspended: 'lock' }
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ' + (styles[status] ?? styles.active)
      }
    >
      <Icon name={icons[status] ?? 'check'} size={12} strokeWidth={2.5} />
      {labels[status] ?? status}
    </span>
  )
}

// a form field: label (+ "optional"), the input, and a short hint
export function Field({ label, optional = false, hint, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// a white card with an icon and a title; it rises into place when the page opens
export function Card({ icon, title, text, children, className = '', delay = 0, action }) {
  return (
    <section
      className={`acc-rise rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-6 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {(title || icon) && (
        <header className="mb-4 flex items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F]">
              <Icon name={icon} size={17} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[#0F3D32]">{title}</h2>
            {text && <p className="mt-0.5 text-xs text-gray-500">{text}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

// the animations of the profile pages (the slow cover shapes, the rise-in and the cover picture)
export function AccountStyles() {
  return (
    <style>{`
      @keyframes acc-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes acc-drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,16px) scale(1.12); } }
      @keyframes acc-drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-34px,-10px) scale(1.08); } }
      @keyframes acc-pop { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
      .acc-rise { animation: acc-rise .55s cubic-bezier(.2,.8,.2,1) both; }
      .acc-pop { animation: acc-pop .35s ease-out both; }
      @keyframes acc-cover-in { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
      .acc-cover-in { animation: acc-cover-in .9s ease-out both; }
      .acc-blob-a { animation: acc-drift-a 14s ease-in-out infinite; }
      .acc-blob-b { animation: acc-drift-b 17s ease-in-out infinite; }
      .acc-dots { background-image: radial-gradient(rgba(159,216,201,.28) 1px, transparent 1.2px); background-size: 22px 22px; }
      @media (prefers-reduced-motion: reduce) {
        .acc-rise, .acc-pop, .acc-blob-a, .acc-blob-b, .acc-cover-in { animation: none; }
      }
    `}</style>
  )
}