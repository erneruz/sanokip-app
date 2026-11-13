// src/services/entertainmentTalentAdminService.js
// The admin side of the talent journey: review the clips, move them forward,
// write team notes, verify and publish talents, handle take-downs, read the consents.
// The database decides who may do what (scouting team only), this file only asks.
import { supabase } from '../supabase'

export const TALENT_ADMIN_CHANGED_EVENT = 'ent-talent-admin-changed'

function notify() {
  window.dispatchEvent(new Event(TALENT_ADMIN_CHANGED_EVENT))
}

// ── Lists (they come with the name, email and phone of the person) ──
export async function listAdminSubmissions() {
  const { data, error } = await supabase.rpc('ent_admin_submissions')
  if (error) throw error
  return data ?? []
}

export async function listAdminTakedowns() {
  const { data, error } = await supabase.rpc('ent_admin_takedowns')
  if (error) throw error
  return data ?? []
}

export async function listAdminConsents() {
  const { data, error } = await supabase.rpc('ent_admin_consents')
  if (error) throw error
  return data ?? []
}

export async function listAdminTalents() {
  const { data, error } = await supabase.rpc('ent_admin_talents')
  if (error) throw error
  return data ?? []
}

// ── Red counts for the admin menu ───────────────────────────
export async function getNewSubmissionCount() {
  const { count, error } = await supabase
    .from('ent_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')
  if (error) throw error
  return count ?? 0
}

export async function getOpenTakedownCount() {
  const { count, error } = await supabase
    .from('ent_takedowns')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open')
  if (error) throw error
  return count ?? 0
}

// ── One submission ──────────────────────────────────────────
// Move a clip to a new status. The message (when there is one) is shown to the member
// and kept in the history. The database refuses a step that breaks a child-safety rule.
export async function moveSubmission(id, { status, note, reelUrl, documentaryUrl }) {
  const patch = { status, status_note: note?.trim() || null }
  if (reelUrl !== undefined) patch.reel_url = reelUrl?.trim() || null
  if (documentaryUrl !== undefined) patch.documentary_url = documentaryUrl?.trim() || null
  const { error } = await supabase.from('ent_submissions').update(patch).eq('id', id)
  if (error) throw error
  notify()
}

// save the reel and documentary links without changing the status
export async function saveSubmissionLinks(id, { reelUrl, documentaryUrl }) {
  const { error } = await supabase
    .from('ent_submissions')
    .update({ reel_url: reelUrl?.trim() || null, documentary_url: documentaryUrl?.trim() || null })
    .eq('id', id)
  if (error) throw error
  notify()
}

export async function listSubmissionNotes(id) {
  const { data, error } = await supabase
    .from('ent_submission_notes')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addSubmissionNote(id, note) {
  const { error } = await supabase.from('ent_submission_notes').insert({ submission_id: id, note: note.trim() })
  if (error) throw error
}

// ── Talent cards ────────────────────────────────────────────
export async function setTalentVerified(userId, on) {
  const { error } = await supabase
    .from('ent_profiles')
    .update({ verified_at: on ? new Date().toISOString() : null })
    .eq('user_id', userId)
  if (error) throw error
  notify()
}

export async function setTalentPublished(userId, on) {
  const { error } = await supabase
    .from('ent_profiles')
    .update({ published_at: on ? new Date().toISOString() : null })
    .eq('user_id', userId)
  if (error) throw error
  notify()
}

// ── Take-downs ──────────────────────────────────────────────
// "done" also takes the card offline and withdraws the published clips (the database does it)
export async function finishTakedown(id) {
  const { error } = await supabase.from('ent_takedowns').update({ status: 'done' }).eq('id', id)
  if (error) throw error
  notify()
}