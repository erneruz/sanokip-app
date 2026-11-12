// src/pages/entertainment/EntertainmentAccount.jsx
// "My account" on Peak Star Entertainment.
// - People with an Entertainment profile can edit their details.
// - People who only have a login (for example from the Engineering site)
//   can join Entertainment here by choosing how they join. Their details are
//   filled in from the Peak Star account they already have; the Entertainment
//   profile is a separate copy, so editing it never changes the Engineering one.
// - Except for visitors, each kind of member also answers the questions of
//   that kind (talent category, scouting areas, organisation type...).
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import EntRolePicker from '../../components/entertainment/EntRolePicker'
import CountryPhoneInput from '../../components/entertainment/CountryPhoneInput'
import LocationFields from '../../components/entertainment/LocationFields'
import RoleDetailsFields from '../../components/entertainment/RoleDetailsFields'
import {
  ENT_ROLES,
  entRoleLabel,
  createMyEntProfile,
  updateMyEntProfile,
} from '../../services/entertainmentUsersService'
import { staffRoleLabel } from '../../services/staffService'
import { phoneProblem } from '../../constants/countries'
import { roleHasDetails, detailsProblem } from '../../constants/entRoleDetails'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

// a saved phone number written in any way -> "+250788123456"
function toInternational(raw) {
  const text = String(raw ?? '').trim()
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) return ''
  if (text.startsWith('+')) return `+${digits}`
  if (digits.startsWith('0')) return `+250${digits.slice(1)}`
  if (digits.startsWith('250') && digits.length === 12) return `+${digits}`
  if (digits.length === 9) return `+250${digits}`
  return `+${digits}`
}

function StatusChip({ status }) {
  const styles = {
    active: 'bg-[#1B5E4F] text-white',
    pending: 'border border-dashed border-[#2F9678] bg-[#F1F6F4] text-[#154A3F]',
    suspended: 'bg-gray-200 text-gray-600',
  }
  const labels = { active: 'Active', pending: 'Waiting for approval', suspended: 'Suspended' }
  return (
    <span className={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + (styles[status] ?? styles.active)}>
      {labels[status] ?? status}
    </span>
  )
}

export default function EntertainmentAccount() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/entertainment/login" replace />
  return <AccountBody />
}

// A person who is not in Entertainment yet: first read what their Peak Star
// (Engineering) account already knows, so the join form comes filled in.
function AccountBody() {
  const { user, entProfile } = useAuth()
  const [known, setKnown] = useState(entProfile ? {} : undefined) // undefined = still loading

  useEffect(() => {
    if (entProfile) return
    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setKnown(data ?? {})
      })
      .catch(() => {
        if (!cancelled) setKnown({})
      })
    return () => {
      cancelled = true
    }
  }, [user.id, entProfile])

  if (known === undefined) {
    return <p className="px-4 py-16 text-center text-sm text-gray-500">Loading your details…</p>
  }
  return <AccountForm known={known} />
}

function AccountForm({ known }) {
  const { user, profile, entProfile, staffRoles, can, refreshAccount } = useAuth()

  const joining = !entProfile

  // What we already know about this person from their Peak Star account
  // (Engineering profile, then the details saved when the login was created).
  const meta = user.user_metadata ?? {}
  const knownFirst = known.first_name ?? profile?.first_name ?? meta.first_name ?? ''
  const knownLast = known.last_name ?? profile?.last_name ?? meta.last_name ?? ''

  // the form starts from what is already saved
  const [form, setForm] = useState(() => ({
    full_name: entProfile?.full_name ?? `${knownFirst} ${knownLast}`.trim(),
    phone: entProfile?.phone ?? toInternational(known.phone ?? known.phone_number ?? meta.phone ?? user.phone),
    country: entProfile?.country ?? known.country ?? meta.country ?? 'Rwanda',
    province: entProfile?.province ?? known.province ?? meta.province ?? '',
    district: entProfile?.district ?? known.district ?? meta.district ?? '',
    organization: entProfile?.organization ?? meta.organization ?? '',
    bio: entProfile?.bio ?? '',
    details: entProfile?.details ?? {}, // answers specific to the kind of member
  }))
  const [joinRole, setJoinRole] = useState('visitor')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const activeRole = joining ? joinRole : entProfile.role
  const showOrg = activeRole === 'scout' || activeRole === 'partner' || activeRole === 'manager'
  const orgRequired = activeRole === 'scout' || activeRole === 'partner'

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    const problem = phoneProblem(form.phone)
    if (problem) {
      setMessage({ type: 'error', text: problem })
      return
    }

    const detailsError = detailsProblem(activeRole, form.details)
    if (detailsError) {
      setMessage({ type: 'error', text: detailsError })
      return
    }

    setSaving(true)
    try {
      if (joining) {
        await createMyEntProfile(user.id, {
          role: joinRole,
          fullName: form.full_name.trim(),
          phone: form.phone,
          country: form.country,
          province: form.province.trim(),
          district: form.district.trim(),
          organization: form.organization.trim(),
          details: form.details,
        })
      } else {
        await updateMyEntProfile(user.id, form, entProfile.role)
        setMessage({ type: 'ok', text: 'Your details are saved.' })
      }
      await refreshAccount()
    } catch (err) {
      console.error('Could not save Entertainment profile:', err)
      setMessage({ type: 'error', text: 'Could not save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const displayName = form.full_name || user.email
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U'

  return (
    <section className="bg-[#F1F6F4]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* header */}
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F3D32] to-[#2F9678] text-lg font-bold text-white shadow-md">
            {initials}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-[#0F3D32] sm:text-3xl">{displayName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {entProfile ? (
                <>
                  <span className="font-medium text-[#154A3F]">{entRoleLabel(entProfile.role)}</span>
                  <StatusChip status={entProfile.status} />
                </>
              ) : (
                <span>Not part of Peak Star Entertainment yet</span>
              )}
            </p>
          </div>
        </div>

        {/* notices */}
        {entProfile?.status === 'pending' && (
          <p className="mt-6 rounded-xl border border-dashed border-[#2F9678] bg-white px-4 py-3 text-sm text-[#154A3F]">
            Your {entRoleLabel(entProfile.role).toLowerCase()} account is waiting for approval by our team. You can
            already complete your details below.
          </p>
        )}
        {entProfile?.status === 'suspended' && (
          <p className="mt-6 rounded-xl bg-gray-200 px-4 py-3 text-sm text-gray-700">
            Your account is suspended. Please contact the Peak Star Entertainment team.
          </p>
        )}

        {/* staff roles */}
        {staffRoles.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#CDEBE2]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#154A3F]">Your staff roles</span>
            {staffRoles.map((r) => (
              <span key={r} className="rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-medium text-[#0F3D32]">
                {staffRoleLabel(r)}
              </span>
            ))}
            {(can.entertainmentUsers || can.entertainmentContent || can.engineering) && (
              <Link
                to={can.entertainmentUsers || can.entertainmentContent ? '/admin/entertainment' : '/admin'}
                className="ml-auto text-sm font-semibold text-[#1B5E4F] hover:underline"
              >
                Open admin portal
              </Link>
            )}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-7">
          {joining && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-[#0F3D32]">Join Peak Star Entertainment</h2>
                <p className="mt-1 text-sm text-gray-500">
                  You already have a Peak Star login. Choose how you want to join.
                </p>
              </div>
              <p className="rounded-lg bg-[#F1F6F4] px-3 py-2 text-xs leading-relaxed text-[#154A3F]">
                Signed in as <strong>{user.email}</strong>. We filled in your details from your Peak Star account, so you
                can just join. Your Entertainment profile is separate: if you change anything below, it only changes
                here, never on Peak Star Engineering.
              </p>
              <EntRolePicker
                value={joinRole}
                onChange={(r) => {
                  setJoinRole(r)
                  setForm((f) => ({ ...f, details: {} })) // each kind of member has its own questions
                }}
              />
              {ENT_ROLES.find((r) => r.value === joinRole)?.needsApproval && (
                <p className="rounded-lg border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-2 text-xs text-[#154A3F]">
                  This account is reviewed by our team before it becomes active.
                </p>
              )}
            </>
          )}

          {!joining && <h2 className="text-lg font-semibold text-[#0F3D32]">Your details</h2>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input className={inputClass} value={form.full_name} onChange={set('full_name')} required />
            </Field>
            <CountryPhoneInput
              id="acc-phone"
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
              required
            />
          </div>

          <LocationFields
            idPrefix="acc"
            value={{ country: form.country, province: form.province, district: form.district }}
            onChange={(place) => setForm((f) => ({ ...f, ...place }))}
          />

          {showOrg && (
            <Field label={orgRequired ? 'Organisation' : 'Agency or company (optional)'}>
              <input
                className={inputClass}
                value={form.organization}
                onChange={set('organization')}
                required={orgRequired}
              />
            </Field>
          )}

          {/* the questions of this kind of member (none for visitors) */}
          {roleHasDetails(activeRole) && (
            <RoleDetailsFields
              role={activeRole}
              value={form.details}
              onChange={(details) => setForm((f) => ({ ...f, details }))}
              idPrefix="acc"
            />
          )}

          {!joining && (
            <Field label="About you">
              <textarea
                className={inputClass + ' min-h-[110px] resize-y'}
                value={form.bio}
                onChange={set('bio')}
                placeholder="A few lines about you, your talent or your organisation."
              />
            </Field>
          )}

          {message && (
            <p
              className={
                'rounded-lg px-3 py-2 text-sm ' +
                (message.type === 'ok'
                  ? 'bg-[#E6F1EE] text-[#154A3F]'
                  : 'border border-red-200 bg-red-50 text-red-600')
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : joining ? 'Join Peak Star Entertainment' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  )
}