// src/pages/admin/ProfileEditor.jsx
import { useState } from 'react'
import {
  updateProfile,
  replaceAcademicQualifications,
  replaceCertifications,
  uploadAvatar,
} from '../../services/profileService'

const DEGREE_OPTIONS = [
  'PhD',
  "Master's Degree",
  "Bachelor's Degree",
  'Postgraduate Diploma',
  'Diploma',
  'Professional Diploma',
  'Certificate',
  'Short Course',
  'Fellowship',
  'Specialized Training',
]

function newAcademicRow() {
  return {
    uid: crypto.randomUUID(),
    degree: '',
    field: '',
    institution: '',
    country: '',
    start_year: '',
    completion_year: '',
    specialization: '',
  }
}

function newCertRow() {
  return {
    uid: crypto.randomUUID(),
    certification_name: '',
    certification_body: '',
    certification_number: '',
    year_obtained: '',
    expiry_date: '',
    specialization: '',
  }
}

export default function ProfileEditor({ profileId, initialProfile, initialAcademic, initialCertifications, onClose, onSaved }) {
  const [basicForm, setBasicForm] = useState({
    first_name: initialProfile?.first_name ?? '',
    last_name: initialProfile?.last_name ?? '',
    phone: initialProfile?.phone ?? '',
    bio: initialProfile?.bio ?? '',
    current_position: initialProfile?.current_position ?? '',
    organization: initialProfile?.organization ?? '',
    location: initialProfile?.location ?? '',
    website: initialProfile?.website ?? '',
    avatar_url: initialProfile?.avatar_url ?? null,
  })

  const [expertise, setExpertise] = useState(initialProfile?.areas_of_expertise ?? [])
  const [expertiseInput, setExpertiseInput] = useState('')

  const [academicRows, setAcademicRows] = useState(
    initialAcademic?.length ? initialAcademic.map((r) => ({ uid: crypto.randomUUID(), ...r })) : [newAcademicRow()]
  )
  const [certRows, setCertRows] = useState(
    initialCertifications?.length ? initialCertifications.map((r) => ({ uid: crypto.randomUUID(), ...r })) : [newCertRow()]
  )

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function updateBasic(field, value) {
    setBasicForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const url = await uploadAvatar(file)
      await updateProfile(profileId, { avatar_url: url })
      updateBasic('avatar_url', url)
    } catch (err) {
      console.error('Avatar upload failed:', err)
      setError('Avatar upload failed. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function handleExpertiseKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = expertiseInput.trim()
      if (val && !expertise.includes(val)) {
        setExpertise((prev) => [...prev, val])
      }
      setExpertiseInput('')
    }
  }
  function removeExpertise(tag) {
    setExpertise((prev) => prev.filter((t) => t !== tag))
  }

  function updateAcademicRow(uid, field, value) {
    setAcademicRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, [field]: value } : r)))
  }
  function addAcademicRow() {
    setAcademicRows((prev) => [...prev, newAcademicRow()])
  }
  function removeAcademicRow(uid) {
    setAcademicRows((prev) => prev.filter((r) => r.uid !== uid))
  }

  function updateCertRow(uid, field, value) {
    setCertRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, [field]: value } : r)))
  }
  function addCertRow() {
    setCertRows((prev) => [...prev, newCertRow()])
  }
  function removeCertRow(uid) {
    setCertRows((prev) => prev.filter((r) => r.uid !== uid))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const academicPayload = academicRows.map(({ uid, start_year, completion_year, ...rest }) => ({
        ...rest,
        start_year: start_year ? Number(start_year) : null,
        completion_year: completion_year ? Number(completion_year) : null,
      }))
      const certPayload = certRows.map(({ uid, year_obtained, expiry_date, ...rest }) => ({
        ...rest,
        year_obtained: year_obtained ? Number(year_obtained) : null,
        expiry_date: expiry_date || null,
      }))

      await Promise.all([
        updateProfile(profileId, { ...basicForm, areas_of_expertise: expertise }),
        replaceAcademicQualifications(profileId, academicPayload),
        replaceCertifications(profileId, certPayload),
      ])
      onSaved()
    } catch (err) {
      console.error('Save failed:', err)
      setError('Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !saving) onClose()
  }

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <button type="button" onClick={onClose} disabled={saving}
            className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 px-6 py-6">
          {error && <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

          {/* ── Picture ── */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
              {basicForm.avatar_url ? (
                <img src={basicForm.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400">
                  {basicForm.first_name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} className="hidden" />
            </label>
          </div>

          {/* ── Basic Info ── */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="First Name" value={basicForm.first_name} onChange={(v) => updateBasic('first_name', v)} />
              <TextField label="Last Name" value={basicForm.last_name} onChange={(v) => updateBasic('last_name', v)} />
              <TextField label="Phone" value={basicForm.phone} onChange={(v) => updateBasic('phone', v)} />
              <TextField label="Current Position" value={basicForm.current_position} onChange={(v) => updateBasic('current_position', v)} placeholder="e.g. Senior GIS Analyst" />
              <TextField label="Organization / Institution" value={basicForm.organization} onChange={(v) => updateBasic('organization', v)} />
              <TextField label="Country / Location" value={basicForm.location} onChange={(v) => updateBasic('location', v)} placeholder="e.g. Kigali, Rwanda" />
              <TextField label="Personal / Professional Website" value={basicForm.website} onChange={(v) => updateBasic('website', v)} placeholder="https://…" />
            </div>
            <TextArea label="Bio" value={basicForm.bio} onChange={(v) => updateBasic('bio', v)} placeholder="Write a short bio…" />
          </Section>

          {/* ── Areas of Expertise ── */}
          <Section title="Areas of Expertise">
            <p className="text-xs text-gray-500">Type a keyword and press Enter to add it.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {expertise.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {tag}
                  <button type="button" onClick={() => removeExpertise(tag)} className="cursor-pointer text-gray-400 hover:text-gray-700">✕</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyDown={handleExpertiseKeyDown}
              placeholder="e.g. Geographic Information Systems (GIS)"
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none"
            />
          </Section>

          {/* ── Academic Information ── */}
          <Section title="Academic Information">
            <div className="space-y-4">
              {academicRows.map((row) => (
                <div key={row.uid} className="rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SelectField label="Degree / Qualification" value={row.degree}
                      onChange={(v) => updateAcademicRow(row.uid, 'degree', v)} options={DEGREE_OPTIONS} />
                    <TextField label="Field / Major" value={row.field} onChange={(v) => updateAcademicRow(row.uid, 'field', v)} />
                    <TextField label="Institution / University" value={row.institution} onChange={(v) => updateAcademicRow(row.uid, 'institution', v)} />
                    <TextField label="Country" value={row.country} onChange={(v) => updateAcademicRow(row.uid, 'country', v)} />
                    <TextField label="Start Year" type="number" value={row.start_year} onChange={(v) => updateAcademicRow(row.uid, 'start_year', v)} />
                    <TextField label="Completion Year" type="number" value={row.completion_year} onChange={(v) => updateAcademicRow(row.uid, 'completion_year', v)} />
                    <TextField label="Specialization" value={row.specialization} onChange={(v) => updateAcademicRow(row.uid, 'specialization', v)} />
                  </div>
                  <button type="button" onClick={() => removeAcademicRow(row.uid)}
                    className="mt-3 cursor-pointer text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addAcademicRow}
              className="mt-3 cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              + Add Qualification
            </button>
          </Section>

          {/* ── Professional Qualifications & Certifications ── */}
          <Section title="Professional Qualifications & Certifications">
            <div className="space-y-4">
              {certRows.map((row) => (
                <div key={row.uid} className="rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextField label="Certification / Training" value={row.certification_name}
                      onChange={(v) => updateCertRow(row.uid, 'certification_name', v)} placeholder="e.g. Esri GIS Certification, PMP" />
                    <TextField label="Certification Body" value={row.certification_body} onChange={(v) => updateCertRow(row.uid, 'certification_body', v)} />
                    <TextField label="Certification Number" value={row.certification_number} onChange={(v) => updateCertRow(row.uid, 'certification_number', v)} />
                    <TextField label="Year Obtained" type="number" value={row.year_obtained} onChange={(v) => updateCertRow(row.uid, 'year_obtained', v)} />
                    <TextField label="Expiry Date" type="date" value={row.expiry_date} onChange={(v) => updateCertRow(row.uid, 'expiry_date', v)} />
                    <TextField label="Specialization" value={row.specialization} onChange={(v) => updateCertRow(row.uid, 'specialization', v)} />
                  </div>
                  <button type="button" onClick={() => removeCertRow(row.uid)}
                    className="mt-3 cursor-pointer text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCertRow}
              className="mt-3 cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              + Add Certification
            </button>
          </Section>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} disabled={saving}
              className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}

function TextField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-black focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div className="mt-4">
      <label className="text-xs text-gray-500">{label}</label>
      <textarea
        rows={4}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
      />
    </div>
  )
}
