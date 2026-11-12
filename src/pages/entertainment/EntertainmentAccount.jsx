// src/pages/entertainment/EntertainmentAccount.jsx
// The frame of "My profile" on Peak Star Entertainment:
//   cover + photo + name on top, then three pages under tabs:
//     Profile (review), Edit profile, Security.
// The pages themselves are in the folder ./account
// Someone who is logged in but not in Entertainment yet sees the Join page instead.
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import EntAvatar from '../../components/entertainment/EntAvatar'
import { entRoleLabel } from '../../services/entertainmentUsersService'
import JoinEntertainment from './account/JoinEntertainment'
import { AccountStyles, Icon, ROLE_ICON, StatusChip, formatMonthYear } from './account/accountUi'

const BASE = '/entertainment/account'

const TABS = [
  { to: BASE, end: true, label: 'Profile', icon: 'user' },
  { to: `${BASE}/edit`, end: false, label: 'Edit profile', icon: 'pencil' },
  { to: `${BASE}/security`, end: false, label: 'Security', icon: 'lock' },
]

export default function EntertainmentAccount() {
  const { user, loading, entProfile } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/entertainment/login" replace />
  if (!entProfile) return <JoinEntertainment />
  return <AccountFrame />
}

function AccountFrame() {
  const { user, entProfile } = useAuth()
  const name = entProfile.full_name || user.email
  const place = [entProfile.district, entProfile.province, entProfile.country].filter(Boolean).join(', ')

  return (
    <section className="min-h-[75vh] bg-[#F1F6F4] pb-16">
      <AccountStyles />

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
        <div className="acc-rise overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#CDEBE2]">
          {/* cover: green gradient with two slow moving shapes and a fine dot pattern */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#0A2E27] via-[#0F3D32] to-[#1B5E4F] sm:h-44">
            <span className="acc-blob-a absolute -left-10 -top-16 size-64 rounded-full bg-[#2F9678]/40 blur-3xl" />
            <span className="acc-blob-b absolute -bottom-24 right-0 size-72 rounded-full bg-[#9FD8C9]/25 blur-3xl" />
            <span className="acc-dots absolute inset-0" />
          </div>

          <div className="px-5 pb-0 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
              {/* photo, with a small camera button that opens the edit page */}
              <div className="relative w-fit">
                <EntAvatar
                  name={name}
                  src={entProfile.avatar_url}
                  size="size-24 sm:size-32"
                  textClass="text-3xl sm:text-4xl"
                  className="ring-4! ring-white! shadow-lg"
                />
                <Link
                  to={`${BASE}/edit`}
                  title="Change your photo"
                  aria-label="Change your photo"
                  className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-[#1B5E4F] text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-[#0F3D32] active:scale-95"
                >
                  <Icon name="camera" size={16} />
                </Link>
              </div>

              <div className="min-w-0 flex-1 sm:pb-3">
                <h1 className="truncate text-2xl font-bold tracking-tight text-[#0F3D32] sm:text-3xl">{name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-semibold text-[#0F3D32]">
                    <Icon name={ROLE_ICON[entProfile.role] ?? 'user'} size={13} />
                    {entRoleLabel(entProfile.role)}
                  </span>
                  <StatusChip status={entProfile.status} />
                  {place && (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="pin" size={14} className="text-[#2F9678]" />
                      {place}
                    </span>
                  )}
                  {entProfile.created_at && (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="calendar" size={14} className="text-[#2F9678]" />
                      Member since {formatMonthYear(entProfile.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* tabs */}
            <nav className="-mx-2 mt-5 flex gap-1 overflow-x-auto border-t border-gray-100 px-2 py-2" aria-label="Profile pages">
              {TABS.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ' +
                    (isActive
                      ? 'bg-[#1B5E4F] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-[#E6F1EE] hover:text-[#0F3D32]')
                  }
                >
                  <Icon name={tab.icon} size={16} />
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </section>
  )
}