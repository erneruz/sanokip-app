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