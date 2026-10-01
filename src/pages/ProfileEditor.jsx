// src/pages/ProfileEditor.jsx
import { useState, useRef } from 'react'
import {
  updateProfile,
  replaceAcademicQualifications,
  replaceCertifications,
  uploadAvatar,
} from '../services/profileService' // ← changed: now uses the service instead of inline supabase calls

const emptyAcademic = () => ({
  _key: crypto.randomUUID(),
  degree: '',
  field: '',
  institution: '',
  country: '',
  start_year: '',
  completion_year: '',
  specialization: '',
})

const emptyCertification = () => ({
  _key: crypto.randomUUID(),
  certification_name: '',
  certification_body: '',
  certification_number: '',
  year_obtained: '',
  expiry_date: '',
  specialization: '',
})

export default function ProfileEditor({
  profileId,
  initialProfile,
  initialAcademic,
  initialCertifications,
  onClose,
  onSaved,
}) {
  const [tab, setTab] = useState('basic') // 'basic' | 'academic' | 'certifications'

  const [form, setForm] = useState({
    first_name: initialProfile?.first_name || '',
    last_name: initialProfile?.last_name || '',
    phone: initialProfile?.phone || '',
    current_position: initialProfile?.current_position || '',
    organization: initialProfile?.organization || '',
    location: initialProfile?.location || '',
    website: initialProfile?.website || '',
    bio: initialProfile?.bio || '',
    areas_of_expertise: initialProfile?.areas_of_expertise || [],
  })
  const [tagInput, setTagInput] = useState('')

  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [academic, setAcademic] = useState(
    initialAcademic?.length ? initialAcademic.map((a) => ({ ...a, _key: a.id || crypto.randomUUID() })) : []
  )
  const [certifications, setCertifications] = useState(
    initialCertifications?.length
      ? initialCertifications.map((c) => ({ ...c, _key: c.id || crypto.randomUUID() }))
      : []
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleAvatarPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (!tag) return
    if (!form.areas_of_expertise.includes(tag)) {
      updateField('areas_of_expertise', [...form.areas_of_expertise, tag])
    }
    setTagInput('')
  }

  function removeTag(tag) {
    updateField(
      'areas_of_expertise',
      form.areas_of_expertise.filter((t) => t !== tag)
    )
  }

  function addAcademic() {
    setAcademic((prev) => [...prev, emptyAcademic()])
  }
  function updateAcademic(key, field, value) {
    setAcademic((prev) => prev.map((a) => (a._key === key ? { ...a, [field]: value } : a)))
  }
  function removeAcademic(key) {
    setAcademic((prev) => prev.filter((a) => a._key !== key))
  }

  function addCertification() {
    setCertifications((prev) => [...prev, emptyCertification()])
  }
  function updateCertification(key, field, value) {
    setCertifications((prev) => prev.map((c) => (c._key === key ? { ...c, [field]: value } : c)))
  }
  function removeCertification(key) {
    setCertifications((prev) => prev.filter((c) => c._key !== key))
  }

  // ── changed: handleSave now delegates to profileService instead of calling supabase directly ──
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const newAvatarUrl = avatarFile ? await uploadAvatar(profileId, avatarFile) : avatarUrl

      await updateProfile(profileId, { ...form, avatar_url: newAvatarUrl })
      await replaceAcademicQualifications(profileId, academic)
      await replaceCertifications(profileId, certifications)

      onSaved?.()
    } catch (err) {
      console.error('Save failed:', err)
      setError(err.message || 'Unable to save your profile. Please try again.')
      setSaving(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'academic', label: `Academic (${academic.length})` },
    { key: 'certifications', label: `Certifications (${certifications.length})` },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-gray-100 px-6 pt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`cursor-pointer rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-black text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            {tab === 'basic' && (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                    {avatarPreview || avatarUrl ? (
                      <img src={avatarPreview || avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400">
                        {form.first_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Change Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarPick}
                    />
                    <p className="mt-1.5 text-xs text-gray-400">JPG or PNG, square images look best.</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">Basic Information</p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First Name">
                      <input
                        value={form.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last Name">
                      <input
                        value={form.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Current Position">
                      <input
                        value={form.current_position}
                        onChange={(e) => updateField('current_position', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Organization / Institution">
                      <input
                        value={form.organization}
                        onChange={(e) => updateField('organization', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Country / Location">
                      <input
                        value={form.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Personal / Professional Website" className="sm:col-span-2">
                      <input
                        value={form.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Bio">
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Areas of Expertise">
                  <div className="flex flex-wrap gap-2">
                    {form.areas_of_expertise.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-2 text-xs font-medium text-gray-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="cursor-pointer text-gray-400 hover:text-gray-700"
                          aria-label={`Remove ${tag}`}
                        >
                          <CloseIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="Add a skill and press Enter"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="shrink-0 cursor-pointer rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Add
                    </button>
                  </div>
                </Field>
              </div>
            )}

            {tab === 'academic' && (
              <div className="space-y-4">
                {academic.length === 0 && (
                  <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-400">
                    No academic qualifications added yet.
                  </p>
                )}
                {academic.map((a, i) => (
                  <RepeatableCard key={a._key} index={i} onRemove={() => removeAcademic(a._key)}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Degree">
                        <input
                          value={a.degree}
                          onChange={(e) => updateAcademic(a._key, 'degree', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Field of Study">
                        <input
                          value={a.field}
                          onChange={(e) => updateAcademic(a._key, 'field', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Institution">
                        <input
                          value={a.institution}
                          onChange={(e) => updateAcademic(a._key, 'institution', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Country">
                        <input
                          value={a.country}
                          onChange={(e) => updateAcademic(a._key, 'country', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Start Year">
                        <input
                          value={a.start_year}
                          onChange={(e) => updateAcademic(a._key, 'start_year', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Completion Year">
                        <input
                          value={a.completion_year}
                          onChange={(e) => updateAcademic(a._key, 'completion_year', e.target.value)}
                          placeholder="Leave blank if ongoing"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Specialization" className="sm:col-span-2">
                        <input
                          value={a.specialization}
                          onChange={(e) => updateAcademic(a._key, 'specialization', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </RepeatableCard>
                ))}
                <button
                  type="button"
                  onClick={addAcademic}
                  className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                >
                  + Add qualification
                </button>
              </div>
            )}

            {tab === 'certifications' && (
              <div className="space-y-4">
                {certifications.length === 0 && (
                  <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-400">
                    No certifications added yet.
                  </p>
                )}
                {certifications.map((c, i) => (
                  <RepeatableCard key={c._key} index={i} onRemove={() => removeCertification(c._key)}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Certification Name" className="sm:col-span-2">
                        <input
                          value={c.certification_name}
                          onChange={(e) => updateCertification(c._key, 'certification_name', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Issuing Body">
                        <input
                          value={c.certification_body}
                          onChange={(e) => updateCertification(c._key, 'certification_body', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Certificate Number">
                        <input
                          value={c.certification_number}
                          onChange={(e) => updateCertification(c._key, 'certification_number', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Year Obtained">
                        <input
                          value={c.year_obtained}
                          onChange={(e) => updateCertification(c._key, 'year_obtained', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Expiry Date">
                        <input
                          type="date"
                          value={c.expiry_date || ''}
                          onChange={(e) => updateCertification(c._key, 'expiry_date', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Specialization" className="sm:col-span-2">
                        <input
                          value={c.specialization}
                          onChange={(e) => updateCertification(c._key, 'specialization', e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </RepeatableCard>
                ))}
                <button
                  type="button"
                  onClick={addCertification}
                  className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                >
                  + Add certification
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black'

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function RepeatableCard({ index, onRemove, children }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Entry {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer text-xs font-medium text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  )
}

function CloseIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}