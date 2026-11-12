// src/components/entertainment/EntRolePicker.jsx
// The six cards to choose "how will you join?". Used by the Entertainment
// sign-up page and by the account page (for people who already have a login).
import { ENT_ROLES } from '../../services/entertainmentUsersService'

function RoleIcon({ role }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  if (role === 'visitor')
    return (
      <svg {...common}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  if (role === 'manager')
    return (
      <svg {...common}>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </svg>
    )
  if (role === 'talent')
    return (
      <svg {...common}>
        <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" />
      </svg>
    )
  if (role === 'guardian')
    return (
      <svg {...common}>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
        <circle cx="18" cy="10" r="2" />
        <path d="M18 14.5a3.5 3.5 0 0 1 3 3.5v1" />
      </svg>
    )
  if (role === 'scout')
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )
  return (
    <svg {...common}>
      <path d="M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z" />
      <path d="M8 9V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
    </svg>
  )
}

export default function EntRolePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="How will you join?">
      {ENT_ROLES.map((r) => {
        const active = value === r.value
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r.value)}
            className={
              'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition ' +
              (active
                ? 'border-[#1B5E4F] bg-[#E6F1EE] shadow-sm ring-2 ring-[#2F9678]/30'
                : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-[#9FD8C9] hover:bg-[#F1F6F4]')
            }
          >
            <span
              className={
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ' +
                (active ? 'bg-[#1B5E4F] text-white' : 'bg-[#E6F1EE] text-[#1B5E4F] group-hover:bg-[#CDEBE2]')
              }
            >
              <RoleIcon role={r.value} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#0F3D32]">{r.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-gray-500">
                {r.hint.replace(/\s*Approval needed\.?/i, '')}
              </span>
              {r.needsApproval && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-dashed border-[#2F9678] px-2 py-px text-[10px] font-medium text-[#1B5E4F]">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Needs approval
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}