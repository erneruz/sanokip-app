// src/services/entertainmentUsersService.js
// Everything about the people of Peak Star Entertainment (table ent_profiles).
// These are separate from the Peak Star Engineering users (table profiles).
import { supabase } from '../supabase'
import { cleanDetails } from '../constants/entRoleDetails'
import { cleanSocials } from '../constants/socialLinks'

// The four kinds of Entertainment users.
// needsApproval = starts as "pending" until an admin approves.
export const ENT_ROLES = [
  {
    value: 'visitor',
    label: 'Visitor',
    hint: 'I want to explore talents, news and videos.',
    needsApproval: false,
  },
  {
    value: 'talent',
    label: 'Talent',
    hint: 'I want to show my talent and be seen by scouts and partners.',
    needsApproval: false,
  },
  {
    value: 'guardian',
    label: 'Parent / guardian',
    hint: 'I register and follow a young talent in my care.',
    needsApproval: false,
  },
  {
    value: 'scout',
    label: 'Scout',
    hint: 'I spot and verify new talents. Approval needed.',
    needsApproval: true,
  },
  {
    value: 'manager',
    label: 'Talent manager',
    hint: 'I represent talents and manage their careers. Approval needed.',
    needsApproval: true,
  },
  {
    value: 'partner',
    label: 'Partner',
    hint: 'Club, academy, label, studio or brand looking for talent. Approval needed.',
    needsApproval: true,
  },
]

export const ENT_STATUSES = ['active', 'pending', 'suspended']

export function entRoleLabel(value) {
  return ENT_ROLES.find((r) => r.value === value)?.label ?? value
}

// the logged-in person creates their own Entertainment profile
// (used when someone who already has a login joins Entertainment)
export async function createMyEntProfile(userId, { role, fullName, phone, country, province, district, organization, details }) {
  const approval = ENT_ROLES.find((r) => r.value === role)?.needsApproval
  const { data, error } = await supabase
    .from('ent_profiles')
    .insert({
      user_id: userId,
      role,
      status: approval ? 'pending' : 'active',
      full_name: fullName || null,
      phone: phone || null,
      country: country || null,
      province: province || null,
      district: district || null,
      region: [province, district].filter(Boolean).join(' / ') || null,
      organization: organization || null,
      details: cleanDetails(role, details),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// edit my own details (role and status can never be changed here)
export async function updateMyEntProfile(userId, fields, role) {
  const clean = {
    full_name: fields.full_name?.trim() || null,
    phone: fields.phone?.trim() || null,
    country: fields.country?.trim() || null,
    province: fields.province?.trim() || null,
    district: fields.district?.trim() || null,
    region: [fields.province, fields.district].filter(Boolean).join(' / ') || null,
    organization: fields.organization?.trim() || null,
    bio: fields.bio?.trim() || null,
    socials: cleanSocials(fields.socials),
  }
  // the role-specific answers (talent category, scouting areas, ...)
  if (role && fields.details) clean.details = cleanDetails(role, fields.details)
  const { data, error } = await supabase
    .from('ent_profiles')
    .update(clean)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Profile picture ──────────────────────────────────────────
// Pictures live in the public bucket "ent-avatars", in a folder named with the user id.
const AVATAR_BUCKET = 'ent-avatars'

// "https://.../storage/v1/object/public/ent-avatars/<user>/avatar-123.jpg" -> "<user>/avatar-123.jpg"
function avatarPathFromUrl(url) {
  const marker = `/${AVATAR_BUCKET}/`
  const i = url ? url.indexOf(marker) : -1
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

// remove an old picture file (never blocks the person if it fails)
async function deleteStoredAvatar(url) {
  const path = avatarPathFromUrl(url)
  if (!path) return
  try {
    await supabase.storage.from(AVATAR_BUCKET).remove([path])
  } catch (err) {
    console.warn('Could not delete the old photo:', err)
  }
}

// save a new picture (already cropped and made smaller) and point the profile to it
export async function uploadMyAvatar(userId, blob, oldUrl) {
  const path = `${userId}/avatar-${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  const { error } = await supabase.from('ent_profiles').update({ avatar_url: data.publicUrl }).eq('user_id', userId)
  if (error) throw error

  await deleteStoredAvatar(oldUrl)
  return data.publicUrl
}

export async function removeMyAvatar(userId, oldUrl) {
  const { error } = await supabase.from('ent_profiles').update({ avatar_url: null }).eq('user_id', userId)
  if (error) throw error
  await deleteStoredAvatar(oldUrl)
}

// ── For admins ───────────────────────────────────────────────

// list with emails; the database only returns the roles YOU may manage
export async function listEntUsers() {
  const { data, error } = await supabase.rpc('ent_list_users')
  if (error) throw error
  return data ?? []
}

export const ENT_USERS_CHANGED_EVENT = 'ent-users-changed'

export async function setEntUserStatus(userId, status) {
  const { error } = await supabase.from('ent_profiles').update({ status }).eq('user_id', userId)
  if (error) throw error
  window.dispatchEvent(new Event(ENT_USERS_CHANGED_EVENT))
}

export async function setEntUserRole(userId, role) {
  const { error } = await supabase.from('ent_profiles').update({ role }).eq('user_id', userId)
  if (error) throw error
  window.dispatchEvent(new Event(ENT_USERS_CHANGED_EVENT))
}

// removes the person from Entertainment only (their login stays)
export async function removeEntUser(userId) {
  const { error } = await supabase.from('ent_profiles').delete().eq('user_id', userId)
  if (error) throw error
  window.dispatchEvent(new Event(ENT_USERS_CHANGED_EVENT))
}

// number of people waiting for approval (for the red badge in the admin menu)
export async function getPendingEntCount() {
  const { count, error } = await supabase
    .from('ent_profiles')
    .select('user_id', { count: 'exact', head: true })
    .eq('status', 'pending')
  if (error) throw error
  return count ?? 0
}

// ids of everyone who belongs to Entertainment (used to keep the
// Engineering Users screen separate)
export async function getEntMemberIds() {
  const { data, error } = await supabase.rpc('ent_member_ids')
  if (error) throw error
  return new Set((data ?? []).map((row) => (typeof row === 'string' ? row : row.ent_member_ids)))
}