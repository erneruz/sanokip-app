// src/pages/admin/AdminProfile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile, uploadAvatar } from '../../services/profileService'

export default function AdminProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    getProfile(user.id)
      .then((data) => {
        setProfile(data)
        setForm(data)
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false))
  }, [user?.id])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file)
      const updated = await updateProfile(user.id, { avatar_url: url })
      setProfile(updated)
      setForm(updated)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, form)
      setProfile(updated)
      setForm(updated)
      setEditing(false)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="px-8 py-10 text-gray-500">Loading profile…</main>
  }

  const displayName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Your Profile'

  return (
    <main className="px-8 py-10">
      {/* ── Header card: black-to-white gradient banner + avatar ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="h-36 bg-gradient-to-r from-black to-gray-300" />

        <div className="px-8 pb-6">
          <div className="-mt-14 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-white bg-gray-100">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                    {displayName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                {editing && (
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs text-white opacity-0 transition hover:opacity-100">
                    {uploadingAvatar ? 'Uploading…' : 'Change'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-sm text-gray-500">{profile?.email ?? user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Personal information */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
          <div className="mt-4 space-y-4">
            <Field
              label="First Name"
              editing={editing}
              value={form.first_name}
              onChange={(v) => updateField('first_name', v)}
            />
            <Field
              label="Last Name"
              editing={editing}
              value={form.last_name}
              onChange={(v) => updateField('last_name', v)}
            />
            <Field
              label="Email"
              editing={editing}
              value={form.email}
              onChange={(v) => updateField('email', v)}
            />
            <Field
              label="Phone"
              editing={editing}
              value={form.phone}
              onChange={(v) => updateField('phone', v)}
            />
          </div>
        </div>

        {/* Right: Bio, Academic Profile, Experience */}
        <div className="space-y-6 lg:col-span-2">
          <TextSection
            title="Biography"
            editing={editing}
            value={form.bio}
            onChange={(v) => updateField('bio', v)}
            placeholder="Write a short bio…"
          />
          <TextSection
            title="Academic Profile"
            editing={editing}
            value={form.academic_profile}
            onChange={(v) => updateField('academic_profile', v)}
            placeholder="Degrees, institutions, publications…"
          />
          <TextSection
            title="Experience"
            editing={editing}
            value={form.experience}
            onChange={(v) => updateField('experience', v)}
            placeholder="Roles, companies, years…"
          />
        </div>
      </div>
    </main>
  )
}

function Field({ label, value, editing, onChange }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      {editing ? (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-900">{value || '—'}</p>
      )}
    </div>
  )
}

function TextSection({ title, value, editing, onChange, placeholder }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {editing ? (
        <textarea
          rows={4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      ) : (
        <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{value || '—'}</p>
      )}
    </div>
  )
}
