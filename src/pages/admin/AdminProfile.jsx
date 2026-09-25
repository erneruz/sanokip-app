// src/pages/admin/AdminProfile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getFullProfile } from '../../services/profileService'
import ProfileEditor from './ProfileEditor'

export default function AdminProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [academic, setAcademic] = useState([])
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
  }, [user?.id])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  function loadProfile() {
    setLoading(true)
    return getFullProfile(user.id)
      .then(({ profile, academic, certifications }) => {
        setProfile(profile)
        setAcademic(academic)
        setCertifications(certifications)
      })
      .catch((err) => {
        console.error('Failed to load profile:', err)
        setToast({ type: 'error', message: 'Could not load profile.' })
      })
      .finally(() => setLoading(false))
  }

  function handleEditorSaved() {
    setModalOpen(false)
    setToast({ type: 'success', message: 'Profile saved successfully.' })
    loadProfile()
  }

  if (loading) {
    return <main className="px-8 py-10 text-gray-500">Loading profile…</main>
  }

  const displayName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Your Profile'

  return (
    <main className="px-8 py-10">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Header card ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="h-36 bg-gradient-to-r from-black to-gray-300" />
        <div className="px-8 pb-6">
          <div className="-mt-14 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-white bg-gray-100">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                    {displayName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                {profile?.current_position && (
                  <p className="text-sm text-gray-700">
                    {profile.current_position}
                    {profile.organization ? ` at ${profile.organization}` : ''}
                  </p>
                )}
                <p className="text-sm text-gray-500">{profile?.email ?? user?.email}</p>
                {profile?.location && <p className="text-xs text-gray-400">{profile.location}</p>}
              </div>
            </div>

            <button onClick={() => setModalOpen(true)}
              className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Personal information */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Contact & Basic Info</h2>
            <div className="mt-4 space-y-4">
              <ReadField label="Phone" value={profile?.phone} />
              <ReadField label="Organization / Institution" value={profile?.organization} />
              <ReadField label="Country / Location" value={profile?.location} />
              <ReadField
                label="Website"
                value={profile?.website}
                isLink
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Areas of Expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile?.areas_of_expertise?.length ? (
                profile.areas_of_expertise.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{tag}</span>
                ))
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Bio, Academic, Certifications */}
        <div className="space-y-6 lg:col-span-2">
          <ReadSection title="Biography" value={profile?.bio} />

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Academic Information</h2>
            {academic.length ? (
              <div className="mt-4 space-y-4">
                {academic.map((a) => (
                  <div key={a.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-gray-900">
                      {a.degree}{a.field ? ` in ${a.field}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {a.institution}{a.country ? `, ${a.country}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.start_year || '—'} – {a.completion_year || 'Present'}
                      {a.specialization ? ` · ${a.specialization}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">—</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Professional Qualifications & Certifications</h2>
            {certifications.length ? (
              <div className="mt-4 space-y-4">
                {certifications.map((c) => (
                  <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-gray-900">{c.certification_name}</p>
                    <p className="text-sm text-gray-600">
                      {c.certification_body}
                      {c.certification_number ? ` · No. ${c.certification_number}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.year_obtained ? `Obtained ${c.year_obtained}` : ''}
                      {c.expiry_date ? ` · Expires ${c.expiry_date}` : ''}
                      {c.specialization ? ` · ${c.specialization}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">—</p>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <ProfileEditor
          profileId={user.id}
          initialProfile={profile}
          initialAcademic={academic}
          initialCertifications={certifications}
          onClose={() => setModalOpen(false)}
          onSaved={handleEditorSaved}
        />
      )}
    </main>
  )
}

function ReadField({ label, value, isLink }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm font-medium text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-900">{value || '—'}</p>
      )}
    </div>
  )
}

function ReadSection({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{value || '—'}</p>
    </div>
  )
}
