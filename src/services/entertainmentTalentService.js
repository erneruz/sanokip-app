// src/services/entertainmentTalentService.js
// The talent journey of a member of Peak Star Entertainment:
//   card settings, children, submissions (clips), consents, take-down requests.
import { supabase } from '../supabase'

export const SUBMISSIONS_CHANGED_EVENT = 'ent-submissions-changed'
const CLIPS_BUCKET = 'ent-clips'
export const MAX_CLIP_MB = 50

function notify() {
  window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT))
}

// ── Talent card ──────────────────────────────────────────────
export async function saveTalentCard(userId, { headline, availability, privateStats, publicSettings }) {
  const stats = {}
  const h = Number(privateStats?.height_cm)
  const w = Number(privateStats?.weight_kg)
  if (Number.isFinite(h) && h > 0) stats.height_cm = Math.round(h)
  if (Number.isFinite(w) && w > 0) stats.weight_kg = Math.round(w * 10) / 10
  const { data, error } = await supabase
    .from('ent_profiles')
    .update({
      headline: headline?.trim() || null,
      availability: availability === 'busy' ? 'busy' : 'available',
      private_stats: stats,
      public_settings: publicSettings ?? {},
    })
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Children ─────────────────────────────────────────────────
export async function listChildren() {
  const { data, error } = await supabase.from('ent_children').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

function cleanChild(f) {
  return {
    first_name: f.first_name.trim(),
    age_years: Number(f.age_years),
    province: f.province || null,
    district: f.district || null,
    category: f.category || null,
    specialty: f.specialty?.trim() || null,
  }
}

export async function addChild(guardianId, fields) {
  const { data, error } = await supabase
    .from('ent_children')
    .insert({ guardian_id: guardianId, ...cleanChild(fields) })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateChild(id, fields) {
  const { data, error } = await supabase
    .from('ent_children')
    .update({ ...cleanChild(fields), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteChild(id) {
  const { error } = await supabase.from('ent_children').delete().eq('id', id)
  if (error) throw error
  notify()
}

// ── Submissions ──────────────────────────────────────────────
export async function listSubmissions() {
  const { data, error } = await supabase
    .from('ent_submissions')
    .select('*, events:ent_submission_events(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((s) => ({
    ...s,
    events: [...(s.events ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
  }))
}

export async function countNeedsInfo() {
  const { count, error } = await supabase
    .from('ent_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'needs_info')
  if (error) throw error
  return count ?? 0
}

function fileExtension(file) {
  const fromName = file.name?.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName
  if (file.type === 'video/quicktime') return 'mov'
  if (file.type === 'video/webm') return 'webm'
  return 'mp4'
}

// send a clip: upload the file (when there is one), then save the submission
export async function createSubmission(userId, f) {
  let videoPath = null
  if (f.file) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    videoPath = `${userId}/${id}.${fileExtension(f.file)}`
    const { error: upErr } = await supabase.storage
      .from(CLIPS_BUCKET)
      .upload(videoPath, f.file, { contentType: f.file.type || 'video/mp4', cacheControl: '3600', upsert: false })
    if (upErr) throw upErr
  }

  const { data, error } = await supabase
    .from('ent_submissions')
    .insert({
      user_id: userId,
      subject: f.subject,
      child_id: f.subject === 'child' ? f.childId : null,
      person_name: f.personName.trim(),
      what_they_do: f.whatTheyDo?.trim() || null,
      category: f.category || null,
      location: f.location?.trim() || null,
      video_url: f.videoUrl?.trim() || null,
      video_path: videoPath,
      note: f.note?.trim() || null,
      person_full_name: f.subject === 'adult' ? f.personFullName?.trim() || null : null,
      person_contact: f.subject === 'adult' ? f.personContact?.trim() || null : null,
      relationship: f.subject === 'adult' ? f.relationship || null : null,
      rights_confirmed: !!f.rightsConfirmed,
      person_agreed: f.subject === 'adult' ? !!f.personAgreed : false,
    })
    .select()
    .single()

  if (error) {
    // do not leave an unused file behind
    if (videoPath) {
      try {
        await supabase.storage.from(CLIPS_BUCKET).remove([videoPath])
      } catch {
        /* the unused file can stay */
      }
    }
    throw error
  }
  notify()
  return data
}

export async function withdrawSubmission(id) {
  const { error } = await supabase.from('ent_submissions').update({ status: 'withdrawn' }).eq('id', id)
  if (error) throw error
  notify()
}

export async function replyToSubmission(id, text) {
  const { error } = await supabase.from('ent_submissions').update({ reply_note: text.trim() }).eq('id', id)
  if (error) throw error
  notify()
}

// the address to watch a clip: a link as it is, an uploaded file through a temporary private link
export async function getClipUrl(submission) {
  if (submission.video_url) return { url: submission.video_url, kind: 'link' }
  if (!submission.video_path) return null
  const { data, error } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(submission.video_path, 3600)
  if (error) throw error
  return { url: data.signedUrl, kind: 'file' }
}

// ── Consents ─────────────────────────────────────────────────
export async function listConsents() {
  const { data, error } = await supabase.from('ent_consents').select('*').order('given_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function giveConsent(userId, childId, kind, givenBy, version) {
  const { data, error } = await supabase
    .from('ent_consents')
    .insert({ user_id: userId, child_id: childId || null, kind, given_by: givenBy || null, wording_version: version })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function withdrawConsent(id) {
  const { error } = await supabase.from('ent_consents').update({ withdrawn_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

// ── Take-down ────────────────────────────────────────────────
export async function listTakedowns() {
  const { data, error } = await supabase.from('ent_takedowns').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function requestTakedown(userId, childId, reason) {
  const { data, error } = await supabase
    .from('ent_takedowns')
    .insert({ user_id: userId, child_id: childId || null, reason: reason?.trim() || null })
    .select()
    .single()
  if (error) throw error
  return data
}