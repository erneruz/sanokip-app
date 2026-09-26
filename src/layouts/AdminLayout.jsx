// src/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'
import ProfileMenu from '../components/ProfileMenu'
import {
  IconGrid, IconDocument, IconUsers, IconQuote, IconMail,
  IconBook, IconCalendar, IconWrench, IconFolder,
} from '../components/icons'

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

  const [profile, setProfile] = useState(null)
  useEffect(() => {
    if (!user?.id) return
    getProfile(user.id)
      .then(setProfile)
      .catch((err) => console.error('Failed to load profile:', err))
  }, [user?.id])

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

        <div className="border-t border-white/10 px-3 py-3">
          <ProfileMenu profile={profile} email={user?.email} onSignOut={signOut} />
        </div>
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