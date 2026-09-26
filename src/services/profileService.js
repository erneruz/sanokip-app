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

// ── added: public-safe profile fetch — never selects email or phone ──────────

export async function getPublicProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, bio, current_position, organization, location, website, areas_of_expertise, avatar_url'
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

// ── end added ──────────────────────────────────────────────────────────────

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

// Fetches the profile plus its academic and certification records in one go.
export async function getFullProfile(userId) {
  const [profile, academic, certifications] = await Promise.all([
    getProfile(userId),
    getAcademicQualifications(userId),
    getCertifications(userId),
  ])
  return { profile, academic, certifications }
}

// ── added: same as getFullProfile, but uses the public-safe profile fetch ────

export async function getPublicFullProfile(userId) {
  const [profile, academic, certifications] = await Promise.all([
    getPublicProfile(userId),
    getAcademicQualifications(userId),
    getCertifications(userId),
  ])
  return { profile, academic, certifications }
}

// ── end added ──────────────────────────────────────────────────────────────

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

// Replaces the full set of academic records for a profile.
// Simplest correct approach for a "save whole form" editor: wipe and re-insert.
export async function replaceAcademicQualifications(profileId, records) {
  const clean = (records ?? [])
    .filter((r) => r.degree && r.institution)
    .map(({ uid, id, ...rest }) => ({ ...rest, profile_id: profileId }))

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

// Same wipe-and-reinsert approach for certifications.
export async function replaceCertifications(profileId, records) {
  const clean = (records ?? [])
    .filter((r) => r.certification_name)
    .map(({ uid, id, ...rest }) => ({ ...rest, profile_id: profileId }))

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

export async function uploadAvatar(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from('avatars').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
  return data.publicUrl
}