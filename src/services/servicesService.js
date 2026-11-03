// src/services/servicesService.js
import { supabase } from '../supabase'

// ── Public: one query, nested, used by the Services page ─────────────

export async function getServiceLinesWithServices() {
  const { data, error } = await supabase
    .from('service_lines')
    .select(`
      id, name, subtitle, slug, display_order,
      services ( id, name, description, deliverables, for_audience, icon, image_url, display_order )
    `)
    .order('display_order', { ascending: true })

  if (error) throw error

  return (data ?? []).map((line) => ({
    ...line,
    services: (line.services ?? []).sort((a, b) => a.display_order - b.display_order),
  }))
}

// ── Admin: categories (service lines) ─────────────────────────────────

export async function getAllServiceLines() {
  const { data, error } = await supabase
    .from('service_lines')
    .select('id, name, subtitle, slug, display_order')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createServiceLine(line) {
  const { data, error } = await supabase.from('service_lines').insert(line).select().single()
  if (error) throw error
  return data
}

export async function updateServiceLine(id, line) {
  const { data, error } = await supabase
    .from('service_lines')
    .update({ ...line, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteServiceLine(id) {
  const { error } = await supabase.from('service_lines').delete().eq('id', id)
  if (error) throw error
}

// ── Admin: services ────────────────────────────────────────────────────

export async function createService(service) {
  const { data, error } = await supabase.from('services').insert(service).select().single()
  if (error) throw error
  return data
}

export async function updateService(id, service) {
  const { data, error } = await supabase
    .from('services')
    .update({ ...service, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

// ── Picture upload for a service, used by ServiceEditor.jsx ───────────

export async function uploadServiceImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from('service-images').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('service-images').getPublicUrl(fileName)
  return data.publicUrl
}