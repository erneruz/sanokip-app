// src/pages/ProfileEditor.jsx
import { useState, useRef } from 'react'
import {
  updateProfile,
  replaceAcademicQualifications,
  replaceCertifications,
  uploadAvatar,
} from '../services/profileService'

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

  const tabs = [
    { key: 'basic', label: 'Basic Info', icon: IconUser },
    { key: 'academic', label: `Academic (${academic.length})`, icon: IconGraduationCap },
    { key: 'certifications', label: `Certifications (${certifications.length})`, icon: IconAward },
  ]

  return (
    // ← changed: no padding/rounding on mobile so the modal fills the screen like a
    // proper mobile sheet; from sm: up it's back to the original centered card
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:px-4 sm:py-8"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-xl sm:h-auto sm:max-h-[88vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — ← added: brand gradient icon badge, matching the other editors */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
              <IconUser className="h-5 w-5" />
            </span>
            <h2 className="truncate text-lg font-bold text-gray-900">Edit Profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs — ← changed: icon-prefixed, brand-colored active state, horizontal
            scroller so they never break layout on a narrow phone */}
        <div className="shrink-0 overflow-x-auto border-b border-gray-100 px-4 pt-3 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((t) => {
              const TabIcon = t.icon
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? 'border-b-2 border-[#1B5E4F] text-[#1B5E4F]'
                      : 'border-b-2 border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {error && (
              <p className="mb-5 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {tab === 'basic' && (
              <div className="space-y-6">
                {/* Avatar — ← changed: camera-icon badge overlaid on the avatar itself,
                    styled in brand colors, instead of a plain "Change Photo" button */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="relative shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 ring-4 ring-[#EAF5F1]">
                      {avatarPreview || avatarUrl ? (
                        <img src={avatarPreview || avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400">
                          {form.first_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Change photo"
                      title="Change photo"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#1B5E4F] text-white shadow-md ring-2 ring-white transition hover:bg-[#154A3F]"
                    >
                      <IconCamera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarPick}
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-900">Profile Photo</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      JPG or PNG, square images look best. Tap the camera icon to change it.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <IconIdCard className="h-4 w-4 text-[#1B5E4F]" />
                    Basic Information
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First Name" icon={IconUser}>
                      <input
                        value={form.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last Name" icon={IconUser}>
                      <input
                        value={form.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Phone" icon={IconPhone}>
                      <input
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Current Position" icon={IconBriefcase}>
                      <input
                        value={form.current_position}
                        onChange={(e) => updateField('current_position', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Organization / Institution" icon={IconBuilding}>
                      <input
                        value={form.organization}
                        onChange={(e) => updateField('organization', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Country / Location" icon={IconMapPin}>
                      <input
                        value={form.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Personal / Professional Website" icon={IconGlobe} className="sm:col-span-2">
                      <input
                        value={form.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Bio" icon={IconAlignLeft}>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Areas of Expertise" icon={IconTag}>
                  <div className="flex flex-wrap gap-2">
                    {form.areas_of_expertise.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5F1] py-1 pl-3 pr-2 text-xs font-medium text-[#1B5E4F]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="cursor-pointer text-[#1B5E4F]/60 hover:text-[#1B5E4F]"
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
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-[#1B5E4F]/60 hover:bg-[#EAF5F1] hover:text-[#1B5E4F]"
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </Field>
              </div>
            )}

            {tab === 'academic' && (
              <div className="space-y-4">
                {academic.length === 0 && (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center">
                    <IconGraduationCap className="h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-400">No academic qualifications added yet.</p>
                  </div>
                )}
                {academic.map((a, i) => (
                  <RepeatableCard key={a._key} index={i} icon={IconGraduationCap} onRemove={() => removeAcademic(a._key)}>
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
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-[#1B5E4F]/60 hover:bg-[#EAF5F1] hover:text-[#1B5E4F]"
                >
                  <IconPlus className="h-4 w-4" />
                  Add qualification
                </button>
              </div>
            )}

            {tab === 'certifications' && (
              <div className="space-y-4">
                {certifications.length === 0 && (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center">
                    <IconAward className="h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-400">No certifications added yet.</p>
                  </div>
                )}
                {certifications.map((c, i) => (
                  <RepeatableCard key={c._key} index={i} icon={IconAward} onRemove={() => removeCertification(c._key)}>
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
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-[#1B5E4F]/60 hover:bg-[#EAF5F1] hover:text-[#1B5E4F]"
                >
                  <IconPlus className="h-4 w-4" />
                  Add certification
                </button>
              </div>
            )}
          </div>

          {/* Footer — ← changed: buttons stack full-width on mobile, brand green Save
              button with icon/spinner instead of plain black */}
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
            >
              {saving ? (
                <>
                  <IconSpinner className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <IconCheckCircle className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]'

function Field({ label, icon: Icon, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#1B5E4F]" />}
        {label}
      </label>
      {children}
    </div>
  )
}

function RepeatableCard({ index, icon: Icon, onRemove, children }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {Icon && <Icon className="h-3.5 w-3.5 text-[#1B5E4F]" />}
          Entry {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="flex cursor-pointer items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
        >
          <IconTrash className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
      {children}
    </div>
  )
}

function IconUser(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  )
}
function IconPhone(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}
function IconBriefcase(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
function IconBuilding(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.75 21h16.5M4.5 21V5.25A1.5 1.5 0 0 1 6 3.75h6a1.5 1.5 0 0 1 1.5 1.5V21m-7.5 0h7.5m0 0V9.75a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V21" />
    </svg>
  )
}
function IconMapPin(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function IconGlobe(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  )
}
function IconAlignLeft(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconIdCard(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="13" y1="10" x2="18" y2="10" /><line x1="13" y1="14" x2="18" y2="14" />
    </svg>
  )
}
function IconGraduationCap(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
  )
}
function IconAward(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </svg>
  )
}
function IconCamera(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function IconPlus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}
function IconAlertCircle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function IconCheckCircle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function IconSpinner(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
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