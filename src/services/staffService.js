// src/services/staffService.js
// Staff roles of the whole platform (table platform_staff). Super Admin only.
import { supabase } from '../supabase'

export const STAFF_ROLES = [
  { value: 'super_admin', label: 'Super Admin', hint: 'Controls the entire platform and gives staff roles.' },
  { value: 'engineering_admin', label: 'Engineering Admin', hint: 'Controls Peak Star Engineering only.' },
  { value: 'entertainment_admin', label: 'Entertainment Admin', hint: 'Controls all of Peak Star Entertainment.' },
  { value: 'scouting_manager', label: 'Scouting Manager', hint: 'Entertainment: approves and manages scouts and talents.' },
  { value: 'partner_manager', label: 'Partner Manager', hint: 'Entertainment: approves and manages partners.' },
  { value: 'content_manager', label: 'Content Manager', hint: 'Entertainment: stories, news, videos, publications.' },
]

export function staffRoleLabel(value) {
  return STAFF_ROLES.find((r) => r.value === value)?.label ?? value
}

export const STAFF_CHANGED_EVENT = 'staff-changed'

export async function listStaff() {
  const { data, error } = await supabase.rpc('staff_list')
  if (error) throw error
  return data ?? []
}

// the person must already have an account
export async function grantStaffRole(email, role) {
  const { error } = await supabase.rpc('staff_grant', { p_email: email.trim(), p_role: role })
  if (error) throw error
  window.dispatchEvent(new Event(STAFF_CHANGED_EVENT))
}

export async function revokeStaffRole(id) {
  const { error } = await supabase.from('platform_staff').delete().eq('id', id)
  if (error) throw error
  window.dispatchEvent(new Event(STAFF_CHANGED_EVENT))
}