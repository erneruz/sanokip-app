// src/pages/entertainment/EntertainmentAccount.jsx
// The frame of "My profile" on Peak Star Entertainment:
//   cover + photo + name on top, then three pages under tabs:
//     Profile (review), Edit profile, Security.
// The pages themselves are in the folder ./account
// Someone who is logged in but not in Entertainment yet sees the Join page instead.
import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import EntAvatar from '../../components/entertainment/EntAvatar'
import AvatarCameraButton from '../../components/entertainment/AvatarCameraButton'
import CoverCameraButton from '../../components/entertainment/CoverCameraButton'
import SocialIcon from '../../components/entertainment/SocialIcon'
import { socialList } from '../../constants/socialLinks'
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
  const [coverOk, setCoverOk] = useState(true) // false when the cover picture cannot be loaded
  useEffect(() => setCoverOk(true), [entProfile.cover_url]) // a new picture: try it again
  const socials = socialList(entProfile.socials)
  const place = [entProfile.district, entProfile.province, entProfile.country].filter(Boolean).join(', ')

  return (
    <section className="min-h-[75vh] bg-[#F1F6F4] pb-16">
      <AccountStyles />

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
        {/* no overflow-hidden here, so the camera menus can open over the card */}
        <div className="acc-rise rounded-3xl bg-white shadow-sm ring-1 ring-[#CDEBE2]">
          {/* cover: the green surface. A cover picture, when there is one, fills it and the
              green is laid over it, so the picture blends with the Peak Star colours. */}
          <div className="relative">
            <div className="relative h-36 overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#0A2E27] via-[#0F3D32] to-[#1B5E4F] sm:h-52">
              {!coverOk || !entProfile.cover_url ? (
                <>
                  <span className="acc-blob-a absolute -left-10 -top-16 size-64 rounded-full bg-[#2F9678]/40 blur-3xl" />
                  <span className="acc-blob-b absolute -bottom-24 right-0 size-72 rounded-full bg-[#9FD8C9]/25 blur-3xl" />
                  <span className="acc-dots absolute inset-0" />
                </>
              ) : (
                <>
                  <img
                    key={entProfile.cover_url}
                    src={entProfile.cover_url}
                    alt=""
                    onError={() => setCoverOk(false)}
                    className="acc-cover-in absolute inset-0 h-full w-full object-cover"
                  />
                  {/* green laid over the picture: stronger on the left and at the bottom */}
                  <span className="absolute inset-0 bg-gradient-to-r from-[#0A2E27]/75 via-[#0F3D32]/30 to-[#0A2E27]/10" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#0A2E27]/70 via-transparent to-[#0A2E27]/25" />
                  <span className="acc-dots absolute inset-0 opacity-60" />
                </>
              )}
            </div>
            <CoverCameraButton />
          </div>

          <div className="px-5 pb-0 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-start">
              {/* photo, with a small camera button: the only place where the photo is changed */}
              <div className="relative w-fit">
                <EntAvatar
                  name={name}
                  src={entProfile.avatar_url}
                  size="size-24 sm:size-32"
                  textClass="text-3xl sm:text-4xl"
                  className="ring-4! ring-white! shadow-lg"
                />
                <AvatarCameraButton />
              </div>

              {/* name starts below the cover on wide screens */}
              <div className="min-w-0 flex-1 sm:pt-[4.75rem]">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F3D32] sm:text-3xl">{name}</h1>
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

                {socials.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.key}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.label}
                        aria-label={s.label}
                        className="flex size-9 items-center justify-center rounded-full bg-[#E6F1EE] text-[#1B5E4F] transition hover:-translate-y-0.5 hover:bg-[#1B5E4F] hover:text-white hover:shadow-md active:scale-95"
                      >
                        <SocialIcon name={s.key} size={17} />
                      </a>
                    ))}
                  </div>
                )}
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