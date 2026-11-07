// src/components/ProjectStatusBadge.jsx
// One badge for every place a project status is shown, so the same status
// always has the same colour (featured card, grid cards, popup).

/*
  Status colours
    Completed  deep green   #1B5E4F, solid, white text, with a check
    Ongoing    light green  #A8E0CE, dark green text, with a pulsing dot
    Upcoming   white        outlined in green, with a calendar
*/

function CheckCircleIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  )
}

function CalendarIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export default function ProjectStatusBadge({ status, className = '' }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm'

  if (status === 'ongoing') {
    return (
      <span className={`${base} bg-[#A8E0CE] text-[#0D3A31] ring-1 ring-[#0D3A31]/10 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1B5E4F]/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1B5E4F]" />
        </span>
        Ongoing
      </span>
    )
  }

  if (status === 'upcoming') {
    return (
      <span className={`${base} bg-white text-[#1B5E4F] ring-1 ring-[#1B5E4F]/25 ${className}`}>
        <CalendarIcon />
        Upcoming
      </span>
    )
  }

  return (
    <span className={`${base} bg-[#1B5E4F] text-white ${className}`}>
      <CheckCircleIcon />
      Completed
    </span>
  )
}