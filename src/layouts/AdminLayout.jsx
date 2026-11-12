// src/layouts/AdminLayout.jsx
// The admin area for the whole platform. What you see in the menu depends on
// what you are allowed to control:
//   Peakstar Engineering   -> Engineering admins and the Super Admin
//   Peakstar Entertainment -> Entertainment staff and the Super Admin
//   Platform               -> the Super Admin only
import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'
import { getUnreadMessageCount, MESSAGES_CHANGED_EVENT } from '../services/contactMessagesService'
import { getNewServiceRequestCount, SERVICE_REQUESTS_CHANGED_EVENT } from '../services/serviceRequestsService'
import { getNewUserCount, USERS_SEEN_EVENT } from '../services/usersService'
import { getNewSubscriberCount, SUBSCRIBERS_CHANGED_EVENT } from '../services/subscribersService'
import { getPendingEntCount, ENT_USERS_CHANGED_EVENT, entRoleLabel } from '../services/entertainmentUsersService'
import {
  ENT_ADMIN,
  ENT_CONTENT_KINDS,
  ENT_ROLE_PLURAL,
  manageableEntRoles,
} from '../constants/entertainmentAdmin'
import { KIND_ICONS, IconShield } from '../components/admin/EntAdminIcons'
import ProfileMenu from '../components/ProfileMenu'
import logo from '../assets/images/logo.png'
import {
  IconGrid, IconDocument, IconUsers, IconMail,
  IconBook, IconWrench, IconFolder,
} from '../components/icons'

// speech-bubble icon for the Messages link
function IconChat(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h7M8.5 14h4" />
    </svg>
  )
}

// bell icon for the Subscribers link
function IconBellNav(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

const MESSAGES_PATH = '/admin/messages'
const REQUESTS_PATH = '/admin/service-requests'
const USERS_PATH = '/admin/users'
const SUBSCRIBERS_PATH = '/admin/subscribers'
const MEMBERS_PATH = `${ENT_ADMIN}/members`
const STAFF_PATH = '/admin/staff'

// the menu, built from what this person may control
function buildSections(can, staffRoles) {
  const sections = []

  if (can.engineering) {
    sections.push({
      label: 'Peakstar Engineering',
      items: [
        { label: 'Dashboard', to: '/admin', end: true, icon: IconGrid },
        { label: 'Posts', to: '/admin/posts', icon: IconDocument },
        { label: 'Publications', to: '/admin/publications', icon: IconBook },
        { label: 'Projects', to: '/admin/projects', icon: IconFolder },
        { label: 'Services', to: '/admin/services', icon: IconWrench },
        { label: 'Service Requests', to: REQUESTS_PATH, icon: IconMail },
        { label: 'Messages', to: MESSAGES_PATH, icon: IconChat },
        { label: 'Subscribers', to: SUBSCRIBERS_PATH, icon: IconBellNav },
        { label: 'Users', to: USERS_PATH, icon: IconUsers },
      ],
    })
  }

  if (can.entertainmentUsers || can.entertainmentContent) {
    const items = [{ label: 'Dashboard', to: ENT_ADMIN, end: true, icon: IconGrid }]
    if (can.entertainmentUsers) {
      items.push({
        label: 'Members',
        to: MEMBERS_PATH,
        icon: IconUsers,
        // one link per kind of member, only the ones this person may manage
        children: [
          { label: 'All members', to: MEMBERS_PATH, role: null },
          ...manageableEntRoles(staffRoles).map((r) => ({
            label: ENT_ROLE_PLURAL[r] ?? entRoleLabel(r),
            to: `${MEMBERS_PATH}?role=${r}`,
            role: r,
          })),
        ],
      })
    }
    sections.push({ label: 'Peakstar Entertainment', items })
  }

  if (can.entertainmentContent) {
    sections.push({
      label: 'Entertainment content',
      items: ENT_CONTENT_KINDS.map((k) => ({
        label: k.label,
        to: `${ENT_ADMIN}/${k.path}`,
        icon: KIND_ICONS[k.kind],
      })),
    })
  }

  if (can.staff) {
    sections.push({
      label: 'Platform',
      items: [{ label: 'Staff & roles', to: STAFF_PATH, icon: IconShield }],
    })
  }

  return sections
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
  const { signOut, user, can, staffRoles } = useAuth()
  const { pathname, search } = useLocation()

  const [profile, setProfile] = useState(null)
  useEffect(() => {
    if (!user?.id) return
    getProfile(user.id)
      .then(setProfile)
      .catch((err) => console.error('Failed to load profile:', err))
  }, [user?.id])

  // red counts. They refresh when something changes, every 30 seconds, and when
  // you come back to the tab. Each count is only loaded for the people who may see it.
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [newRequests, setNewRequests] = useState(0)
  const [newUsers, setNewUsers] = useState(0)
  const [newSubscribers, setNewSubscribers] = useState(0)
  const [pendingMembers, setPendingMembers] = useState(0)

  const canEngineering = can.engineering
  const canMembers = can.entertainmentUsers

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      Promise.allSettled([
        canEngineering ? getUnreadMessageCount() : Promise.resolve(0),
        canEngineering ? getNewServiceRequestCount() : Promise.resolve(0),
        canEngineering && user?.id ? getNewUserCount(user.id) : Promise.resolve(0),
        canEngineering ? getNewSubscriberCount() : Promise.resolve(0),
        canMembers ? getPendingEntCount() : Promise.resolve(0),
      ]).then(([m, r, u, s, p]) => {
        if (cancelled) return
        if (m.status === 'fulfilled') setUnreadMessages(m.value)
        if (r.status === 'fulfilled') setNewRequests(r.value)
        if (u.status === 'fulfilled') setNewUsers(u.value)
        if (s.status === 'fulfilled') setNewSubscribers(s.value)
        if (p.status === 'fulfilled') setPendingMembers(p.value)
      })
    }
    refresh()
    const timer = setInterval(refresh, 30000)
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh)
    window.addEventListener(SERVICE_REQUESTS_CHANGED_EVENT, refresh)
    window.addEventListener(USERS_SEEN_EVENT, refresh)
    window.addEventListener(SUBSCRIBERS_CHANGED_EVENT, refresh)
    window.addEventListener(ENT_USERS_CHANGED_EVENT, refresh)
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh)
      window.removeEventListener(SERVICE_REQUESTS_CHANGED_EVENT, refresh)
      window.removeEventListener(USERS_SEEN_EVENT, refresh)
      window.removeEventListener(SUBSCRIBERS_CHANGED_EVENT, refresh)
      window.removeEventListener(ENT_USERS_CHANGED_EVENT, refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [user?.id, canEngineering, canMembers])

  const totalAlerts = unreadMessages + newRequests + newUsers + newSubscribers + pendingMembers

  const navSections = buildSections(can, staffRoles)

  // desktop icon-only collapse, persisted so it stays how you left it
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

  // mobile off-canvas drawer state
  const [mobileOpen, setMobileOpen] = useState(false)

  const adminDisplayName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || user?.email || 'Admin'
  const initials = adminDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A'

  // the red count that belongs to a menu link, and where the link opens
  function badgeFor(item) {
    let badge = 0
    let target = item.to
    if (item.to === MESSAGES_PATH) {
      badge = unreadMessages
      if (badge > 0) target = `${MESSAGES_PATH}?status=new`
    } else if (item.to === REQUESTS_PATH) {
      badge = newRequests
      if (badge > 0) target = `${REQUESTS_PATH}?status=new`
    } else if (item.to === USERS_PATH) {
      badge = newUsers
    } else if (item.to === SUBSCRIBERS_PATH) {
      badge = newSubscribers
    } else if (item.to === MEMBERS_PATH) {
      badge = pendingMembers
      if (badge > 0) target = `${MEMBERS_PATH}?status=pending`
    }
    return { badge, target }
  }

  // which "Members" sub-link is open now
  const onMembers = pathname === MEMBERS_PATH
  const currentRole = new URLSearchParams(search).get('role')

  const linkClass = (isActive) =>
    'relative ' +
    (isActive
      ? 'flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white '
      : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white ') +
    (collapsed ? 'md:justify-center' : '')

  function renderBadge(badge) {
    const badgeText = badge > 99 ? '99+' : String(badge)
    return (
      <>
        {badge > 0 && (
          <span
            aria-label={`${badge} new`}
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
      </>
    )
  }

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
                  const { badge, target } = badgeFor(item)

                  return (
                    <div key={item.to}>
                      <NavLink
                        to={target}
                        end={item.end || !!item.children}
                        onClick={() => setMobileOpen(false)}
                        title={
                          badge > 0
                            ? `${item.label}: ${badge} new`
                            : collapsed
                              ? item.label
                              : undefined
                        }
                        className={({ isActive }) => linkClass(isActive)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
                        {renderBadge(badge)}
                      </NavLink>

                      {/* the kinds of members, listed under "Members" */}
                      {item.children && (
                        <div className={'mt-1 space-y-0.5 border-l border-white/10 pl-3 ml-5 ' + (collapsed ? 'md:hidden' : '')}>
                          {item.children.map((child) => {
                            const active = onMembers && (child.role ?? null) === (currentRole ?? null)
                            return (
                              <Link
                                key={child.to}
                                to={child.to}
                                onClick={() => setMobileOpen(false)}
                                className={
                                  'block truncate rounded-md px-2.5 py-1.5 text-xs font-medium transition ' +
                                  (active
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white')
                                }
                              >
                                {child.label}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          {collapsed ? (
            // collapsed desktop fallback: avatar + sign-out icon only
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
        {/* mobile-only top bar with the menu button that opens the drawer */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
          >
            <IconMenu className="h-5 w-5" />
            {totalAlerts > 0 && (
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