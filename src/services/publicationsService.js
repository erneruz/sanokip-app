// src/services/publicationsService.js
import { supabase } from '../supabase'

const TABLE = 'publications'
const BUCKET = 'publications'

// ---------- Public ----------
export async function getPublishedPublications() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('status', 'published')
    .order('publication_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ---------- Admin ----------
export async function getAllPublications() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPublicationById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function uploadPublicationFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = `${Date.now()}-${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return {
    file_url: data.publicUrl,
    file_path: path,
    file_name: file.name,
    file_ext: ext,
    file_size: file.size,
  }
}

export async function removePublicationFile(path) {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('Failed to remove file:', error)
}

export async function createPublication(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePublication(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePublication(publication) {
  const { error } = await supabase.from(TABLE).delete().eq('id', publication.id)
  if (error) throw error
  await removePublicationFile(publication.file_path)
}