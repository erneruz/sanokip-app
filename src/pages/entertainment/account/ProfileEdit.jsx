// src/pages/entertainment/account/ProfileEdit.jsx
// Page 2 of "My profile": change the photo and the details.
// The photo is saved as soon as it is chosen; the rest is saved with "Save changes".
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import AvatarUploader from '../../../components/entertainment/AvatarUploader'
import CountryPhoneInput from '../../../components/entertainment/CountryPhoneInput'
import LocationFields from '../../../components/entertainment/LocationFields'
import RoleDetailsFields from '../../../components/entertainment/RoleDetailsFields'
import { entRoleLabel, updateMyEntProfile } from '../../../services/entertainmentUsersService'
import { phoneProblem } from '../../../constants/countries'
import { roleHasDetails, detailsProblem } from '../../../constants/entRoleDetails'
import { Card, Field, Icon, ROLE_ICON, inputClass } from './accountUi'

const BIO_MAX = 500

export default function ProfileEdit() {
  const { user, entProfile, refreshAccount } = useAuth()
  const navigate = useNavigate()

  const role = entProfile.role
  const showOrg = role === 'scout' || role === 'partner' || role === 'manager'
  const orgRequired = role === 'scout' || role === 'partner'
  const orgPlaceholder =
    role === 'partner'
      ? 'Example: Kigali Football Academy'
      : role === 'manager'
        ? 'Example: Kigali Talent Agency'
        : 'Example: APR FC Youth Team'

  const [form, setForm] = useState(() => ({
    full_name: entProfile.full_name ?? '',
    phone: entProfile.phone ?? '',
    country: entProfile.country ?? 'Rwanda',
    province: entProfile.province ?? '',
    district: entProfile.district ?? '',
    organization: entProfile.organization ?? '',
    bio: entProfile.bio ?? '',
    details: entProfile.details ?? {},
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const problem = phoneProblem(form.phone)
    if (problem) {
      setError(problem)
      return
    }
    const detailsError = detailsProblem(role, form.details)
    if (detailsError) {
      setError(detailsError)
      return
    }

    setSaving(true)
    try {
      await updateMyEntProfile(user.id, form, role)
      await refreshAccount()
      navigate('/entertainment/account', { state: { flash: 'saved' } })
    } catch (err) {
      console.error('Could not save the profile:', err)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24">
      <Card icon="camera" title="Profile photo" text="Saved as soon as you choose it." delay={40}>
        <AvatarUploader />
      </Card>

      <Card icon="user" title="Personal details" text="This is how scouts, partners and our team see you." delay={90}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="edit-name">
            <input
              id="edit-name"
              className={inputClass}
              value={form.full_name}
              onChange={set('full_name')}
              placeholder="Example: Aline Uwase"
              autoComplete="name"
              required
            />
          </Field>
          <CountryPhoneInput
            id="edit-phone"
            value={form.phone}
            onChange={(phone) => setForm((f) => ({ ...f, phone }))}
            required
          />
        </div>

        <div className="mt-4">
          <Field
            label="About you"
            optional
            htmlFor="edit-bio"
            hint={`${form.bio.length} / ${BIO_MAX}. Two or three sentences are enough.`}
          >
            <textarea
              id="edit-bio"
              className={inputClass + ' min-h-[120px] resize-y'}
              value={form.bio}
              onChange={set('bio')}
              maxLength={BIO_MAX}
              placeholder="Who are you, what do you do, and what do you want to achieve? Example: I am a 17-year-old midfielder from Huye. I want a place in a national academy."
            />
          </Field>
        </div>
      </Card>

      <Card icon="pin" title="Where you are" text="Choose your country, then your province and district." delay={140}>
        <LocationFields
          idPrefix="edit"
          value={{ country: form.country, province: form.province, district: form.district }}
          onChange={(place) => setForm((f) => ({ ...f, ...place }))}
        />
        {showOrg && (
          <div className="mt-4">
            <Field
              label={orgRequired ? (role === 'partner' ? 'Organisation name' : 'Team, club or organisation') : 'Agency or company'}
              optional={!orgRequired}
              htmlFor="edit-org"
            >
              <input
                id="edit-org"
                className={inputClass}
                value={form.organization}
                onChange={set('organization')}
                placeholder={orgPlaceholder}
                required={orgRequired}
              />
            </Field>
          </div>
        )}
      </Card>

      {roleHasDetails(role) && (
        <div className="acc-rise" style={{ animationDelay: '190ms' }}>
          <RoleDetailsFields
            role={role}
            value={form.details}
            onChange={(details) => setForm((f) => ({ ...f, details }))}
            idPrefix="edit"
          />
        </div>
      )}

      <p className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-xs leading-relaxed text-gray-500 ring-1 ring-[#CDEBE2]">
        <Icon name={ROLE_ICON[role] ?? 'user'} size={14} className="mt-0.5 shrink-0 text-[#2F9678]" />
        You joined as <strong className="text-[#0F3D32]">{entRoleLabel(role)}</strong>. The kind of member can only be
        changed by our team. Changes here only affect Peak Star Entertainment.
      </p>

      {/* save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#CDEBE2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-3 px-4 py-3 sm:px-6">
          {error && (
            <p role="alert" className="mr-auto flex items-center gap-1.5 text-sm text-red-600">
              <Icon name="info" size={15} />
              {error}
            </p>
          )}
          <Link
            to="/entertainment/account"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 ring-1 ring-gray-300 transition hover:bg-gray-50 active:scale-95"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="check" size={16} strokeWidth={2.6} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  )
}