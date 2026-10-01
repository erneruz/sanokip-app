// src/pages/UserProfile.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFullProfile } from '../services/profileService'
import ProfileEditor from './ProfileEditor' // ← changed: was './admin/ProfileEditor'

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [academic, setAcademic] = useState([])
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const menuRef = useRef(null)

  // ⚠️ Adjust this to match your real schema if it's not `role === 'admin'`
  // (could be `profile?.is_admin`, `profile?.user_type === 'admin'`, etc.)
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
  }, [user?.id])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl px-6 py-16 text-gray-500">Loading profile…</main>
      </div>
    )
  }

  const displayName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Your Profile'

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-6 py-12">
        {toast && (
          <div
            className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* ── Header card ── */}
        <div className="relative overflow-visible rounded-2xl bg-white shadow-md ring-1 ring-gray-200">
          <div className="h-28 rounded-t-2xl bg-gradient-to-r from-black via-gray-700 to-gray-400" />

          {/* Three-dot menu */}
          <div className="absolute right-5 top-5" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Profile options"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <DotsIcon />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-200">
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ShieldIcon />
                      Admin Portal
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                  </>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setModalOpen(true)
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <EditIcon />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOutIcon />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <div className="px-8 pb-7">
            <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full bg-gray-100 shadow-md ring-4 ring-white">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                  {displayName?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              {profile?.current_position && (
                <p className="mt-0.5 text-sm text-gray-600">
                  {profile.current_position}
                  {profile.organization ? ` · ${profile.organization}` : ''}
                </p>
              )}
              {profile?.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <PinIcon className="h-3.5 w-3.5" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200">
              <CardTitle icon={<ContactCardIcon />}>Contact & Basic Info</CardTitle>
              <div className="mt-5 space-y-4">
                <ReadField icon={<PhoneIcon />} label="Phone" value={profile?.phone} />
                <ReadField icon={<MailIcon />} label="Email" value={profile?.email ?? user?.email} />
                <ReadField icon={<BuildingIcon />} label="Organization / Institution" value={profile?.organization} />
                <ReadField icon={<PinIcon />} label="Country / Location" value={profile?.location} />
                <ReadField icon={<LinkIcon />} label="Website" value={profile?.website} isLink />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200">
              <CardTitle icon={<TagIcon />}>Areas of Expertise</CardTitle>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile?.areas_of_expertise?.length ? (
                  profile.areas_of_expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200">
              <CardTitle icon={<DocIcon />}>Biography</CardTitle>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {profile?.bio || '—'}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200">
              <CardTitle icon={<CapIcon />}>Academic Information</CardTitle>
              {academic.length ? (
                <div className="mt-5 space-y-5">
                  {academic.map((a) => (
                    <div key={a.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {a.degree}
                        {a.field ? ` in ${a.field}` : ''}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {a.institution}
                        {a.country ? `, ${a.country}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {a.start_year || '—'} – {a.completion_year || 'Present'}
                        {a.specialization ? ` · ${a.specialization}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">—</p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200">
              <CardTitle icon={<BadgeIcon />}>Professional Qualifications & Certifications</CardTitle>
              {certifications.length ? (
                <div className="mt-5 space-y-5">
                  {certifications.map((c) => (
                    <div key={c.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-gray-900">{c.certification_name}</p>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {c.certification_body}
                        {c.certification_number ? ` · No. ${c.certification_number}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {c.year_obtained ? `Obtained ${c.year_obtained}` : ''}
                        {c.expiry_date ? ` · Expires ${c.expiry_date}` : ''}
                        {c.specialization ? ` · ${c.specialization}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">—</p>
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
    </div>
  )
}

/* ── Shared card title: visually distinct from body content ── */
function CardTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
      <span className="text-gray-400">{icon}</span>
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">{children}</h2>
    </div>
  )
}

function ReadField({ icon, label, value, isLink }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        {isLink && value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block truncate text-sm font-medium text-gray-900 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{value || '—'}</p>
        )}
      </div>
    </div>
  )
}

/* ── Icons (inline SVG) ── */

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.8 2.1Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="9" y1="7" x2="9" y2="7.01" />
      <line x1="15" y1="7" x2="15" y2="7.01" />
      <line x1="9" y1="11" x2="9" y2="11.01" />
      <line x1="15" y1="11" x2="15" y2="11.01" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function PinIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  )
}

function CapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  )
}

function BadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M9 14 7 22l5-3 5 3-2-8" />
    </svg>
  )
}

function ContactCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}