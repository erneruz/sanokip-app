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