// src/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'
import ProfileMenu from '../components/ProfileMenu'
import logo from '../assets/images/logo.png'
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
      { label: 'Publications', to: '/admin/publications', icon: IconBook },
      { label: 'Projects', to: '/admin/projects', icon: IconFolder },
      { label: 'Services', to: '/admin/services', icon: IconWrench },
      { label: 'Service Requests', to: '/admin/service-requests', icon: IconMail },
      { label: 'Users', to: '/admin/users', icon: IconUsers },
    ],
  },
  {
    label: 'Coming soon',
    items: [
      { label: 'Testimonials', to: '/admin/testimonials', icon: IconQuote },
      { label: 'Events', to: '/admin/events', icon: IconCalendar },
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
      {/* SIDEBAR — fixed to viewport height, never scrolls with page content */}
      {/* -------------------------------------------- */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-[#0F3D32] to-[#1B5E4F] text-white">
        <div className="flex items-center gap-3 px-6 py-6 shrink-0">
          <img src={logo} alt="Peakstar" className="object-contain w-9 h-9" />
          <span className="font-semibold">Peakstar Admin</span>
        </div>

        {/* ── changed: only this nav list scrolls internally if it ever grows tall; sidebar itself never moves ── */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
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

        {/* ── changed: shrink-0 ensures this never gets squeezed out of view ── */}
        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          <ProfileMenu profile={profile} email={user?.email} onSignOut={signOut} />
        </div>
      </aside>

      {/* -------------------------------------------- */}
      {/* PAGE CONTENT — this is what scrolls, independently of the sidebar */}
      {/* -------------------------------------------- */}
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  )
}