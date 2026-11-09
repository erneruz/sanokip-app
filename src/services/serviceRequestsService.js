// src/services/serviceRequestsService.js
import { supabase } from '../supabase'

// Fired after any change to requests, so the sidebar red count can refresh at once.
export const SERVICE_REQUESTS_CHANGED_EVENT = 'service-requests-changed'

export function notifyServiceRequestsChanged() {
  try {
    window.dispatchEvent(new Event(SERVICE_REQUESTS_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

// ── Public: submit a request ───────────────────────────────────────────

export async function createServiceRequest(payload) {
  const { error } = await supabase.from('service_requests').insert(payload)
  if (error) throw error
}

// ── Admin: monitor requests ─────────────────────────────────────────────

// ← changed: each request now comes with the replies already sent to it
export async function getServiceRequests() {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, service_request_replies(*)')
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((r) => ({
    ...r,
    service_request_replies: [...(r.service_request_replies ?? [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    ),
  }))
}

// The red count: requests NOT yet opened (read_at is empty).
export async function getNewServiceRequestCount() {
  const { count, error } = await supabase
    .from('service_requests')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) throw error
  return count ?? 0
}

// Called when the admin opens a request
export async function markServiceRequestRead(id) {
  const { error } = await supabase
    .from('service_requests')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .is('read_at', null)
  if (error) throw error
  notifyServiceRequestsChanged()
}

export async function updateServiceRequestStatus(id, status) {
  const now = new Date().toISOString()
  // changing the status also counts as having seen it
  const { error } = await supabase
    .from('service_requests')
    .update({ status, updated_at: now, read_at: now })
    .eq('id', id)
  if (error) throw error
  notifyServiceRequestsChanged()
}

export async function deleteServiceRequest(id) {
  const { error } = await supabase.from('service_requests').delete().eq('id', id)
  if (error) throw error
  notifyServiceRequestsChanged()
}

// ← added: send an email reply from inside the admin panel (Edge Function)
export async function sendServiceRequestReply({ requestId, subject, body }) {
  const { data, error } = await supabase.functions.invoke('send-service-request-reply', {
    body: { request_id: requestId, subject, body },
  })

  if (error) {
    let message = error.message
    try {
      const details = await error.context?.json?.()
      if (details?.error) message = details.error
    } catch {
      /* keep the generic message */
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)

  notifyServiceRequestsChanged()
  return data
}