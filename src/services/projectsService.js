// src/services/projectsService.js
import { supabase } from '../supabase'
import { computeProjectStatus } from '../utils/projectStatus'

// ── changed: recompute status live from dates on every fetch, so the
//    badge is always correct even if nobody has re-saved the project ──
function withLiveStatus(project) {
  if (!project) return project
  return {
    ...project,
    status: computeProjectStatus(project.start_date, project.end_date),
  }
}

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(withLiveStatus)
}

export async function getProjectBySlug(slug) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return withLiveStatus(data)
}

export async function getAllProjectsForAdmin() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(withLiveStatus)
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return withLiveStatus(data)
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id, project) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...project, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProjectImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from('project-images').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('project-images').getPublicUrl(fileName)
  return data.publicUrl
}