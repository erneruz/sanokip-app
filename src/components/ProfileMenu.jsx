import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ProfileMenu({ profile, email, onSignOut }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : (email ?? 'Account')

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5"
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
              {displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{displayName}</p>
          <p className="truncate text-xs text-white/50">{email}</p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-full min-w-[230px] overflow-hidden rounded-xl bg-white py-1.5 text-gray-700 shadow-lg ring-1 ring-black/5">
          <Link
            to="/admin/adminprofile"
            onClick={() => setOpen(false)}
            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
          >
            <IconUser className="h-4 w-4 text-gray-400" />
            Go to Profile
          </Link>
          <Link
            to="/admin/settings"
            onClick={() => setOpen(false)}
            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
          >
            <IconSettings className="h-4 w-4 text-gray-400" />
            Settings
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
          >
            <IconGlobe className="h-4 w-4 text-gray-400" />
            Go to Main Website
          </a>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <IconLogout className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function IconUser(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  )
}
function IconSettings(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658 0-1.25.396-1.51 1Z" />
    </svg>
  )
}
function IconGlobe(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  )
}
function IconLogout(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
