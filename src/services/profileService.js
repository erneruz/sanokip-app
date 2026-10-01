// src/services/profileService.js
import { supabase } from '../supabase'


export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return data ?? {
    id: userId,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    current_position: '',
    organization: '',
    location: '',
    website: '',
    areas_of_expertise: [],
    avatar_url: null,
  }
}

export async function getPublicProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, bio, current_position, organization, location, website, areas_of_expertise, avatar_url, email, phone'
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getAcademicQualifications(profileId) {
  const { data, error } = await supabase
    .from('academic_qualifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('completion_year', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getCertifications(profileId) {
  const { data, error } = await supabase
    .from('professional_certifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('year_obtained', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getFullProfile(userId) {
  const [profile, academic, certifications] = await Promise.all([
    getProfile(userId),
    getAcademicQualifications(userId),
    getCertifications(userId),
  ])
  return { profile, academic, certifications }
}

export async function getPublicFullProfile(userId) {
  const [profile, academic, certifications] = await Promise.all([
    getPublicProfile(userId),
    getAcademicQualifications(userId),
    getCertifications(userId),
  ])
  return { profile, academic, certifications }
}

export async function updateProfile(userId, updates) {
  const {
    first_name, last_name, email, phone, bio,
    current_position, organization, location, website,
    areas_of_expertise, avatar_url,
  } = updates

  const payload = {
    id: userId,
    first_name, last_name, email, phone, bio,
    current_position, organization, location, website,
    ...(areas_of_expertise !== undefined ? { areas_of_expertise } : {}),
    ...(avatar_url !== undefined ? { avatar_url } : {}),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── changed: strip _key (used by ProfileEditor's row-tracking) as well as uid/id ──
export async function replaceAcademicQualifications(profileId, records) {
  const clean = (records ?? [])
    .filter((r) => r.degree && r.institution)
    .map(({ uid, id, _key, ...rest }) => ({ ...rest, profile_id: profileId }))

  const { error: deleteError } = await supabase
    .from('academic_qualifications')
    .delete()
    .eq('profile_id', profileId)
  if (deleteError) throw deleteError

  if (clean.length === 0) return []

  const { data, error } = await supabase
    .from('academic_qualifications')
    .insert(clean)
    .select()
  if (error) throw error
  return data
}

// ── changed: strip _key here too, and use the correct table name ──────────────────
export async function replaceCertifications(profileId, records) {
  const clean = (records ?? [])
    .filter((r) => r.certification_name)
    .map(({ uid, id, _key, ...rest }) => ({ ...rest, profile_id: profileId }))

  const { error: deleteError } = await supabase
    .from('professional_certifications')
    .delete()
    .eq('profile_id', profileId)
  if (deleteError) throw deleteError

  if (clean.length === 0) return []

  const { data, error } = await supabase
    .from('professional_certifications')
    .insert(clean)
    .select()
  if (error) throw error
  return data
}

// ── changed: upload to a stable, per-profile path with upsert, so re-uploading
//    replaces the old photo instead of accumulating random files in storage ──────
export async function uploadAvatar(profileId, file) {
  const ext = file.name.split('.').pop()
  const path = `${profileId}/avatar.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw new Error('Avatar upload failed. ' + error.message)

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // cache-bust so the new photo shows immediately, since the path is stable
  return `${data.publicUrl}?t=${Date.now()}`
}