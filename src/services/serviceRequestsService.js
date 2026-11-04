// src/services/serviceRequestsService.js
import { supabase } from '../supabase'

// ── Public: submit a request ───────────────────────────────────────────

export async function createServiceRequest(payload) {
  const { error } = await supabase.from('service_requests').insert(payload)
  if (error) throw error
}

// ── Admin: monitor requests ─────────────────────────────────────────────

export async function getServiceRequests() {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateServiceRequestStatus(id, status) {
  const { error } = await supabase
    .from('service_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteServiceRequest(id) {
  const { error } = await supabase.from('service_requests').delete().eq('id', id)
  if (error) throw error
}