// src/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'
import { getUnreadMessageCount, MESSAGES_CHANGED_EVENT } from '../services/contactMessagesService' // ← added
import ProfileMenu from '../components/ProfileMenu'
import logo from '../assets/images/logo.png'
import {
  IconGrid, IconDocument, IconUsers, IconQuote, IconMail,
  IconBook, IconCalendar, IconWrench, IconFolder,
} from '../components/icons'

// ← added: speech-bubble icon for the Messages link
function IconChat(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h7M8.5 14h4" />
    </svg>
  )
}

const MESSAGES_PATH = '/admin/messages'

const navSections = [
  {
    // ← changed: was "Overview"
    label: 'Peakstar Engineering',
    items: [
      { label: 'Dashboard', to: '/admin', end: true, icon: IconGrid },
      { label: 'Posts', to: '/admin/posts', icon: IconDocument },
      { label: 'Publications', to: '/admin/publications', icon: IconBook },
      { label: 'Projects', to: '/admin/projects', icon: IconFolder },
      { label: 'Services', to: '/admin/services', icon: IconWrench },
      { label: 'Service Requests', to: '/admin/service-requests', icon: IconMail },
      { label: 'Messages', to: MESSAGES_PATH, icon: IconChat },
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

// ← added: new bottom section, placeholder for now — no routes exist yet for
// these, so nothing fake is linked; just the header, as asked
const entertainmentSection = {
  label: 'Peakstar Entertainment',
  note: 'More modules coming soon',
}

function IconMenu(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function IconX(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function IconPanelLeftClose(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="m14 9-2 3 2 3" />
    </svg>
  )
}
function IconPanelLeftOpen(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="m13 9 2 3-2 3" />
    </svg>
  )
}
function IconLogOut(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function AdminLayout() {
  const { signOut, user } = useAuth()

  const [profile, setProfile] = useState(null)
  useEffect(() => {
    if (!user?.id) return
    getProfile(user.id)
      .then(setProfile)
      .catch((err) => console.error('Failed to load profile:', err))
  }, [user?.id])

  // ← added: number of new (unread) messages, shown as the red count.
  // It refreshes when a message changes, every 30 seconds, and when you come back to the tab.
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      getUnreadMessageCount()
        .then((n) => {
          if (!cancelled) setUnread(n)
        })
        .catch(() => {})
    }
    refresh()
    const timer = setInterval(refresh, 30000)
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh)
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  // ← added: desktop icon-only collapse, persisted so it stays how you left it
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  // ← added: mobile off-canvas drawer state
  const [mobileOpen, setMobileOpen] = useState(false)

  const adminDisplayName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || user?.email || 'Admin'
  const initials = adminDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Mobile backdrop, only visible while the drawer is open ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* -------------------------------------------- */}
      {/* SIDEBAR
          - Mobile: fixed off-canvas drawer, slides in/out with translate-x
          - Desktop (md+): sticky, in normal flex flow, width toggles with `collapsed` */}
      {/* -------------------------------------------- */}
      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-gradient-to-b from-[#0F3D32] to-[#1B5E4F] text-white ' +
          'transition-all duration-300 ease-in-out md:sticky md:top-0 ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0') +
          ' ' +
          (collapsed ? 'w-64 md:w-20' : 'w-64')
        }
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-6">
          <div className={'flex min-w-0 items-center gap-3 ' + (collapsed ? 'md:justify-center' : '')}>
            <img src={logo} alt="Peakstar" className="h-9 w-9 shrink-0 object-contain" />
            <span className={'truncate font-semibold ' + (collapsed ? 'md:hidden' : '')}>Peakstar Admin</span>
          </div>

          {/* Mobile-only close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
          >
            <IconX className="h-4 w-4" />
          </button>

          {/* Desktop-only collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={
              'hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white md:flex ' +
              (collapsed ? 'md:absolute md:-right-3 md:top-6 md:bg-[#1B5E4F] md:shadow-md md:hover:bg-[#154A3F]' : '')
            }
          >
            {collapsed ? <IconPanelLeftOpen className="h-4 w-4" /> : <IconPanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className={'truncate px-3 text-xs font-semibold uppercase tracking-wider text-white/40 ' + (collapsed ? 'md:hidden' : '')}>
                {section.label}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  // ← added: red count on the Messages link; when there are new
                  // messages, the link opens the "New" tab directly
                  const badge = item.to === MESSAGES_PATH ? unread : 0
                  const target = badge > 0 ? `${MESSAGES_PATH}?status=new` : item.to
                  const badgeText = badge > 99 ? '99+' : String(badge)

                  return (
                    <NavLink
                      key={item.to}
                      to={target}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      title={
                        badge > 0
                          ? `${item.label}: ${badge} new`
                          : collapsed
                            ? item.label
                            : undefined
                      }
                      className={({ isActive }) =>
                        'relative ' +
                        (isActive
                          ? 'flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white '
                          : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white ') +
                        (collapsed ? 'md:justify-center' : '')
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>

                      {badge > 0 && (
                        <span
                          aria-label={`${badge} new messages`}
                          className={
                            'ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white shadow ' +
                            (collapsed ? 'md:hidden' : '')
                          }
                        >
                          {badgeText}
                        </span>
                      )}
                      {badge > 0 && collapsed && (
                        <span
                          aria-hidden="true"
                          className="absolute right-1 top-0.5 hidden h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow md:flex"
                        >
                          {badgeText}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}

          {/* ← added: Peakstar Entertainment section */}
          <div className="mb-2">
            <p className={'truncate px-3 text-xs font-semibold uppercase tracking-wider text-white/40 ' + (collapsed ? 'md:hidden' : '')}>
              {entertainmentSection.label}
            </p>
            <p className={'mt-2 px-3 text-xs italic text-white/30 ' + (collapsed ? 'md:hidden' : '')}>
              {entertainmentSection.note}
            </p>
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          {collapsed ? (
            // ← collapsed desktop fallback: avatar + sign-out icon only (no
            // access to ProfileMenu's internals, so this is a simple stand-in)
            <div className="hidden flex-col items-center gap-2 md:flex">
              <div
                title={adminDisplayName}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white"
              >
                {initials}
              </div>
              <button
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <IconLogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <div className={collapsed ? 'md:hidden' : ''}>
            <ProfileMenu profile={profile} email={user?.email} onSignOut={signOut} />
          </div>
        </div>
      </aside>

      {/* -------------------------------------------- */}
      {/* PAGE CONTENT */}
      {/* -------------------------------------------- */}
      <div className="min-w-0 flex-1 overflow-x-hidden">
        {/* ← added: mobile-only top bar with the menu button that opens the drawer */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
          >
            <IconMenu className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
          <img src={logo} alt="Peakstar" className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold text-gray-900">Peakstar Admin</span>
        </div>

        <Outlet />
      </div>
    </div>
  )
}