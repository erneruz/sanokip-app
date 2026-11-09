// src/services/usersService.js
import { supabase } from '../supabase'

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, avatar_url, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function setUserRole(userId, newRole) {
  const { error } = await supabase.rpc('set_user_role', {
    target_user_id: userId,
    new_role: newRole,
  })
  if (error) throw error
}

// ── added: admin-side profile deletion ─────────────────────────────────
// Deletes the profile row and its related academic/certification records.
// Note: this does NOT delete their Supabase Auth account/login — that
// requires a service-role Edge Function and is out of scope here.
export async function deleteUserProfile(userId) {
  await supabase.from('academic_qualifications').delete().eq('profile_id', userId)
  await supabase.from('professional_certifications').delete().eq('profile_id', userId)

  const { error } = await supabase.from('profiles').delete().eq('id', userId)
  if (error) throw error
}
// ─────────────────────────────────────────────────────────────────────

// ── added: "new registered users" alert ────────────────────────────────
// The time the admin last opened the Users page is kept in this browser.
// Users who registered after that moment count as new.

export const USERS_SEEN_EVENT = 'admin-users-seen'

const seenKey = (adminId) => `admin-users-last-seen:${adminId}`

// First time ever: start counting from now, so old users are not flagged as new.
export function getUsersLastSeen(adminId) {
  try {
    const stored = localStorage.getItem(seenKey(adminId))
    if (stored) return stored
    const now = new Date().toISOString()
    localStorage.setItem(seenKey(adminId), now)
    return now
  } catch {
    return new Date().toISOString()
  }
}

// Called when the admin opens the Users page: the red count goes away.
export function markUsersSeen(adminId) {
  try {
    localStorage.setItem(seenKey(adminId), new Date().toISOString())
    window.dispatchEvent(new Event(USERS_SEEN_EVENT))
  } catch {
    /* ignore */
  }
}

// Number of people registered since the admin last opened the Users page.
export async function getNewUserCount(adminId) {
  const since = getUsersLastSeen(adminId)
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gt('created_at', since)
    .neq('id', adminId)
  if (error) throw error
  return count ?? 0
}