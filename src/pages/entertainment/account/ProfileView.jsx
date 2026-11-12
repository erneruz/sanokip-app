// src/pages/entertainment/account/ProfileView.jsx
// Page 1 of "My profile": a clear, read-only view of everything about you,
// with a "profile strength" meter that tells you what is still missing.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import CategoryIcon from '../../../components/entertainment/CategoryIcon'
import { entRoleLabel } from '../../../services/entertainmentUsersService'
import { staffRoleLabel } from '../../../services/staffService'
import { getTalentCategory } from '../../../constants/talentCategories'
import { describeDetails, detailsProblem, roleHasDetails } from '../../../constants/entRoleDetails'
import { Card, Icon } from './accountUi'

const EDIT = '/entertainment/account/edit'

const FLASH = {
  saved: 'Your profile is saved.',
  welcome: 'Welcome to Peak Star Entertainment! Your profile is ready.',
}

// icon of each detail line
const DETAIL_ICON = {
  category: 'sparkle',
  specialty: 'star',
  level: 'trophy',
  experience: 'clock',
  ageGroup: 'calendar',
  guardianName: 'shield',
  guardianPhone: 'phone',
  club: 'users',
  link: 'link',
  achievements: 'trophy',
  relationship: 'users',
  childName: 'user',
  childAge: 'calendar',
  childCategory: 'sparkle',
  childSpecialty: 'star',
  categories: 'sparkle',
  position: 'briefcase',
  coverage: 'pin',
  accreditation: 'shield',
  talentsCount: 'users',
  licence: 'shield',
  clients: 'trophy',
  orgType: 'building',
  contactRole: 'briefcase',
  offers: 'check',
}

// the short "at a glance" chips under the title of the information card
function highlights(role, d = {}) {
  const out = []
  const cat = (slug) => getTalentCategory(slug)
  const push = (slug) => {
    const c = cat(slug)
    if (c) out.push({ slug, text: c.label })
  }
  if (role === 'talent') {
    push(d.category)
    if (d.specialty) out.push({ icon: 'star', text: d.specialty })
    if (d.level) out.push({ icon: 'trophy', text: d.level })
  } else if (role === 'guardian') {
    push(d.childCategory)
    if (d.childSpecialty) out.push({ icon: 'star', text: d.childSpecialty })
  } else if (role === 'scout' || role === 'manager' || role === 'partner') {
    if (d.orgType) out.push({ icon: 'building', text: d.orgType })
    ;(d.categories ?? []).forEach(push)
  }
  return out
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F6F4] text-[#2F9678]">
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <div className="mt-0.5 break-words text-sm text-gray-800">{children}</div>
      </div>
    </div>
  )
}

export default function ProfileView() {
  const { user, entProfile, staffRoles, can } = useAuth()
  const location = useLocation()
  const [flash, setFlash] = useState(location.state?.flash ?? null)
  const [grown, setGrown] = useState(false) // so the meter fills up after the page opens

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 120)
    return () => clearTimeout(t)
  }, [])

  const role = entProfile.role
  const details = entProfile.details ?? {}
  const bio = (entProfile.bio ?? '').trim()

  // profile strength
  const checks = [
    { key: 'photo', done: !!entProfile.avatar_url, text: 'Add a profile photo', icon: 'camera' },
    { key: 'phone', done: !!entProfile.phone, text: 'Add your phone number', icon: 'phone' },
    { key: 'place', done: !!(entProfile.country && entProfile.province), text: 'Add where you live', icon: 'pin' },
    { key: 'bio', done: bio.length >= 20, text: 'Write a short introduction', icon: 'text' },
  ]
  if (roleHasDetails(role)) {
    checks.push({
      key: 'details',
      done: detailsProblem(role, details) === '',
      text: `Complete your ${entRoleLabel(role).toLowerCase()} information`,
      icon: 'briefcase',
    })
  }
  const doneCount = checks.filter((c) => c.done).length
  const percent = Math.round((doneCount / checks.length) * 100)
  const missing = checks.filter((c) => !c.done)

  const chips = highlights(role, details)
  const rows = describeDetails(role, details)
  const place = [entProfile.country, entProfile.province, entProfile.district].filter(Boolean).join(' · ')

  return (
    <div className="space-y-5">
      {flash && FLASH[flash] && (
        <div
          role="status"
          className="acc-pop flex items-center gap-3 rounded-2xl bg-[#1B5E4F] px-4 py-3 text-sm font-medium text-white shadow-md"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Icon name="check" size={15} strokeWidth={2.8} />
          </span>
          <span className="flex-1">{FLASH[flash]}</span>
          <button
            onClick={() => setFlash(null)}
            aria-label="Close message"
            className="cursor-pointer rounded-lg px-2 py-1 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {entProfile.status === 'pending' && (
        <p className="flex items-start gap-3 rounded-2xl border border-dashed border-[#2F9678] bg-white px-4 py-3 text-sm text-[#154A3F]">
          <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-[#2F9678]" />
          Your {entRoleLabel(role).toLowerCase()} account is waiting for approval by our team. You can already complete
          your profile.
        </p>
      )}
      {entProfile.status === 'suspended' && (
        <p className="flex items-start gap-3 rounded-2xl bg-gray-200 px-4 py-3 text-sm text-gray-700">
          <Icon name="lock" size={18} className="mt-0.5 shrink-0" />
          Your account is suspended. Please contact the Peak Star Entertainment team.
        </p>
      )}

      {/* profile strength */}
      <Card icon="sparkle" title="Profile strength" text="A complete profile gets noticed faster." delay={60}>
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#E6F1EE]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F9678] to-[#9FD8C9] transition-[width] duration-1000 ease-out"
              style={{ width: grown ? `${percent}%` : '0%' }}
            />
          </div>
          <span className="w-12 text-right text-lg font-bold text-[#0F3D32]">{percent}%</span>
        </div>

        {missing.length === 0 ? (
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#1B5E4F]">
            <Icon name="check" size={16} strokeWidth={2.8} />
            Your profile is complete. Well done!
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {missing.map((m) => (
              <Link
                key={m.key}
                to={EDIT}
                className="group inline-flex items-center gap-2 rounded-full border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-1.5 text-xs font-medium text-[#154A3F] transition hover:bg-[#E6F1EE] active:scale-95"
              >
                <Icon name={m.icon} size={14} className="text-[#2F9678]" />
                {m.text}
                <Icon name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* left: about + information */}
        <div className="space-y-5 lg:col-span-2">
          <Card icon="text" title="About" delay={110}>
            {bio ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{bio}</p>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-[#F8FBFA] p-4 text-center">
                <p className="text-sm text-gray-500">You have not written anything about yourself yet.</p>
                <Link
                  to={EDIT}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E4F] hover:underline"
                >
                  <Icon name="pencil" size={14} />
                  Write your introduction
                </Link>
              </div>
            )}
          </Card>

          {roleHasDetails(role) && (
            <Card
              icon={role === 'talent' || role === 'guardian' ? 'star' : 'briefcase'}
              title={`${entRoleLabel(role)} information`}
              delay={160}
            >
              {chips.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {chips.map((c, i) => (
                    <span
                      key={`${c.text}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E6F1EE] to-[#CDEBE2] px-3 py-1.5 text-xs font-semibold text-[#0F3D32]"
                    >
                      {c.slug ? <CategoryIcon slug={c.slug} size={14} /> : <Icon name={c.icon} size={14} />}
                      {c.text}
                    </span>
                  ))}
                </div>
              )}

              {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-[#F8FBFA] p-4 text-center">
                  <p className="text-sm text-gray-500">No information added yet.</p>
                  <Link to={EDIT} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E4F] hover:underline">
                    <Icon name="pencil" size={14} />
                    Add it now
                  </Link>
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {rows.map((r) => (
                    <Row key={r.key} icon={DETAIL_ICON[r.key] ?? 'info'} label={r.label}>
                      {r.link ? (
                        <a href={r.value} target="_blank" rel="noopener noreferrer" className="break-all text-[#1B5E4F] hover:underline">
                          {r.value}
                        </a>
                      ) : (
                        <span className="whitespace-pre-line">{r.value}</span>
                      )}
                    </Row>
                  ))}
                </dl>
              )}
            </Card>
          )}
        </div>

        {/* right: contact + membership + staff */}
        <div className="space-y-5">
          <Card icon="mail" title="Contact" delay={130}>
            <div className="space-y-4">
              <Row icon="mail" label="Email">
                <a href={`mailto:${user.email}`} className="break-all text-[#1B5E4F] hover:underline">
                  {user.email}
                </a>
              </Row>
              <Row icon="phone" label="Phone">
                {entProfile.phone ? (
                  <a href={`tel:${entProfile.phone}`} className="text-[#1B5E4F] hover:underline">
                    {entProfile.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">Not added</span>
                )}
              </Row>
              <Row icon="pin" label="Location">
                {place || <span className="text-gray-400">Not added</span>}
              </Row>
              {entProfile.organization && (
                <Row icon="building" label="Organisation">
                  {entProfile.organization}
                </Row>
              )}
            </div>
          </Card>

          <Card icon="shield" title="Membership" delay={180}>
            <div className="space-y-4">
              <Row icon={role === 'visitor' ? 'eye' : 'user'} label="Kind of member">
                {entRoleLabel(role)}
              </Row>
              <Row icon="calendar" label="Joined">
                {entProfile.created_at
                  ? new Date(entProfile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </Row>
            </div>
          </Card>

          {staffRoles.length > 0 && (
            <Card icon="key" title="Your staff roles" delay={220}>
              <div className="flex flex-wrap gap-2">
                {staffRoles.map((r) => (
                  <span key={r} className="rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-medium text-[#0F3D32]">
                    {staffRoleLabel(r)}
                  </span>
                ))}
              </div>
              {(can.entertainmentUsers || can.entertainmentContent || can.engineering) && (
                <Link
                  to={can.entertainmentUsers || can.entertainmentContent ? '/admin/entertainment' : '/admin'}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1B5E4F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#154A3F] active:scale-95"
                >
                  <Icon name="shield" size={15} />
                  Open admin portal
                </Link>
              )}
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Link
          to={EDIT}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678] active:scale-[0.98]"
        >
          <Icon name="pencil" size={16} />
          Edit my profile
        </Link>
      </div>
    </div>
  )
}