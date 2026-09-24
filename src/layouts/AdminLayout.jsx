// src/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService' // ← added
import ProfileMenu from '../components/ProfileMenu' // ← added

const navSections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin', end: true, icon: IconGrid },
      { label: 'Posts', to: '/admin/posts', icon: IconDocument },
    ],
  },
  {
    label: 'Coming soon',
    items: [
      { label: 'Users', to: '/admin/users', icon: IconUsers },
      { label: 'Testimonials', to: '/admin/testimonials', icon: IconQuote },
      { label: 'Messages', to: '/admin/messages', icon: IconMail },
      { label: 'Publications', to: '/admin/publications', icon: IconBook },
      { label: 'Events', to: '/admin/events', icon: IconCalendar },
      { label: 'Services', to: '/admin/services', icon: IconWrench },
      { label: 'Projects', to: '/admin/projects', icon: IconFolder },
    ],
  },
]

export default function AdminLayout() {
  const { signOut, user } = useAuth()

  // ── added: load profile (name, avatar) for the profile menu trigger ──
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    if (!user?.id) return
    getProfile(user.id)
      .then(setProfile)
      .catch((err) => console.error('Failed to load profile:', err))
  }, [user?.id])
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* -------------------------------------------- */}
      {/* SIDEBAR */}
      {/* -------------------------------------------- */}
      <aside className="flex w-64 shrink-0 flex-col bg-gradient-to-b from-black to-gray-700 text-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
            </svg>
          </div>
          <span className="font-semibold">Sanokip Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                {section.label}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      isActive
                        ? 'flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white'
                        : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── changed: replaced static email + sign-out block with ProfileMenu popup ── */}
        <div className="border-t border-white/10 px-3 py-3">
          <ProfileMenu profile={profile} email={user?.email} onSignOut={signOut} />
        </div>
        {/* ─────────────────────────────────────────────────────────────────────── */}
      </aside>

      {/* -------------------------------------------- */}
      {/* PAGE CONTENT */}
      {/* -------------------------------------------- */}
      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  )
}

// ── minimal inline icons, no extra dependency ──────────────────────

function IconGrid(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function IconDocument(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  )
}
function IconUsers(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconQuote(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21c3-1 4-3 4-6V9a2 2 0 0 0-2-2H3v6h2c0 1.5-.5 2.5-2 3zM13 21c3-1 4-3 4-6V9a2 2 0 0 0-2-2h-2v6h2c0 1.5-.5 2.5-2 3z" />
    </svg>
  )
}
function IconMail(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
    </svg>
  )
}
function IconBook(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" /><path d="M4 19.5V6.5" />
    </svg>
  )
}
function IconCalendar(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function IconWrench(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L2 19l3 3 7.1-7.1a4 4 0 0 0 5.6-5.6l-3.5 3.5-2-2 3.5-3.5Z" />
    </svg>
  )
}
function IconFolder(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
    </svg>
  )
}