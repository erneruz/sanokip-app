// src/pages/entertainment/account/JoinEntertainment.jsx
// Shown to someone who is logged in but not part of Peak Star Entertainment yet
// (for example a person who registered on Peak Star Engineering).
// They choose how they join. Their details are filled in from the Peak Star
// account they already have; the Entertainment profile is a separate copy, so
// editing it never changes the Engineering one.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabase'
import { useAuth } from '../../../context/AuthContext'
import EntRolePicker from '../../../components/entertainment/EntRolePicker'
import CountryPhoneInput from '../../../components/entertainment/CountryPhoneInput'
import LocationFields from '../../../components/entertainment/LocationFields'
import RoleDetailsFields from '../../../components/entertainment/RoleDetailsFields'
import { ENT_ROLES, createMyEntProfile } from '../../../services/entertainmentUsersService'
import { phoneProblem } from '../../../constants/countries'
import { roleHasDetails, detailsProblem } from '../../../constants/entRoleDetails'
import { AccountStyles, Field, Icon, inputClass, toInternational } from './accountUi'

export default function JoinEntertainment() {
  const { user } = useAuth()
  const [known, setKnown] = useState(undefined) // what the Engineering profile knows; undefined = loading

  useEffect(() => {
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
  }, [user.id])

  if (known === undefined) {
    return <p className="px-4 py-16 text-center text-sm text-gray-500">Loading your details…</p>
  }
  return <JoinForm known={known} />
}

function JoinForm({ known }) {
  const { user, profile, refreshAccount } = useAuth()
  const navigate = useNavigate()

  // What we already know about this person from their Peak Star account
  const meta = user.user_metadata ?? {}
  const knownFirst = known.first_name ?? profile?.first_name ?? meta.first_name ?? ''
  const knownLast = known.last_name ?? profile?.last_name ?? meta.last_name ?? ''

  const [form, setForm] = useState(() => ({
    full_name: `${knownFirst} ${knownLast}`.trim(),
    phone: toInternational(known.phone ?? known.phone_number ?? meta.phone ?? user.phone),
    country: known.country ?? meta.country ?? 'Rwanda',
    province: known.province ?? meta.province ?? '',
    district: known.district ?? meta.district ?? '',
    organization: meta.organization ?? '',
    details: {},
  }))
  const [role, setRole] = useState('visitor')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const chosen = ENT_ROLES.find((r) => r.value === role)
  const showOrg = role === 'scout' || role === 'partner' || role === 'manager'
  const orgRequired = role === 'scout' || role === 'partner'
  const orgPlaceholder =
    role === 'partner'
      ? 'Example: Kigali Football Academy'
      : role === 'manager'
        ? 'Example: Kigali Talent Agency'
        : 'Example: APR FC Youth Team'

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    const problem = phoneProblem(form.phone)
    if (problem) {
      setMessage({ type: 'error', text: problem })
      return
    }
    const detailsError = detailsProblem(role, form.details)
    if (detailsError) {
      setMessage({ type: 'error', text: detailsError })
      return
    }

    setSaving(true)
    try {
      await createMyEntProfile(user.id, {
        role,
        fullName: form.full_name.trim(),
        phone: form.phone,
        country: form.country,
        province: form.province.trim(),
        district: form.district.trim(),
        organization: form.organization.trim(),
        details: form.details,
      })
      await refreshAccount()
      navigate('/entertainment/account', { replace: true, state: { flash: 'welcome' } })
    } catch (err) {
      console.error('Could not join Entertainment:', err)
      setMessage({ type: 'error', text: 'Could not save. Please try again.' })
      setSaving(false)
    }
  }

  return (
    <section className="min-h-[70vh] bg-[#F1F6F4]">
      <AccountStyles />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="acc-rise flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F3D32] to-[#2F9678] text-white shadow-md">
            <Icon name="sparkle" size={26} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F3D32] sm:text-3xl">Join Peak Star Entertainment</h1>
            <p className="mt-1 text-sm text-gray-500">You already have a Peak Star login. Choose how you want to join.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="acc-rise mt-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-7"
          style={{ animationDelay: '90ms' }}
        >
          <p className="flex items-start gap-2 rounded-lg bg-[#F1F6F4] px-3 py-2.5 text-xs leading-relaxed text-[#154A3F]">
            <Icon name="info" size={14} className="mt-0.5 shrink-0" />
            <span>
              Signed in as <strong>{user.email}</strong>. We filled in your details from your Peak Star account, so you
              can just join. Your Entertainment profile is separate: if you change anything below, it only changes here,
              never on Peak Star Engineering.
            </span>
          </p>

          <EntRolePicker
            value={role}
            onChange={(r) => {
              setRole(r)
              setForm((f) => ({ ...f, details: {} })) // each kind of member has its own questions
            }}
          />
          {chosen?.needsApproval && (
            <p className="rounded-lg border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-2 text-xs text-[#154A3F]">
              This account is reviewed by our team before it becomes active.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="join-name">
              <input
                id="join-name"
                className={inputClass}
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Example: Aline Uwase"
                autoComplete="name"
                required
              />
            </Field>
            <CountryPhoneInput
              id="join-phone"
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
              required
            />
          </div>

          <LocationFields
            idPrefix="join"
            value={{ country: form.country, province: form.province, district: form.district }}
            onChange={(place) => setForm((f) => ({ ...f, ...place }))}
          />

          {showOrg && (
            <Field
              label={orgRequired ? (role === 'partner' ? 'Organisation name' : 'Team, club or organisation') : 'Agency or company'}
              optional={!orgRequired}
              htmlFor="join-org"
            >
              <input
                id="join-org"
                className={inputClass}
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                placeholder={orgPlaceholder}
                required={orgRequired}
              />
            </Field>
          )}

          {roleHasDetails(role) && (
            <RoleDetailsFields
              role={role}
              value={form.details}
              onChange={(details) => setForm((f) => ({ ...f, details }))}
              idPrefix="join"
            />
          )}

          {message && (
            <p
              className={
                'rounded-lg px-3 py-2 text-sm ' +
                (message.type === 'ok' ? 'bg-[#E6F1EE] text-[#154A3F]' : 'border border-red-200 bg-red-50 text-red-600')
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Joining…' : 'Join Peak Star Entertainment'}
            {!saving && <Icon name="arrow" size={16} />}
          </button>
        </form>
      </div>
    </section>
  )
}