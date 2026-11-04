// src/services/dashboardService.js
import { supabase } from '../supabase'

async function safeCount(query) {
  try {
    const { count, error } = await query
    if (error) throw error
    return count ?? 0
  } catch {
    // table doesn't exist yet (or any other read failure) — treat as 0, not a crash
    return 0
  }
}

async function safeRows(query) {
  try {
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}

export async function getDashboardStats() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalComments,
    totalLikes,
    totalDislikes,
    totalUsers,
    totalTestimonials,
    totalMessages,
    totalPublications,
    publishedPublications,
    draftPublications,
    totalEvents,
    totalServices,
    serviceRows,
    totalProjects,
    completedProjects,
    ongoingProjects,
    upcomingProjects,
    totalServiceRequests,
    newRequests,
    contactedRequests,
    inProgressRequests,
    resolvedRequests,
    archivedRequests,
  ] = await Promise.all([
    safeCount(supabase.from('posts').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published')),
    safeCount(supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft')),
    safeCount(supabase.from('comments').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('reaction', 'like')),
    safeCount(supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('reaction', 'dislike')),
    safeCount(supabase.from('profiles').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('testimonials').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('messages').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('publications').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('publications').select('id', { count: 'exact', head: true }).eq('status', 'published')),
    safeCount(supabase.from('publications').select('id', { count: 'exact', head: true }).eq('status', 'draft')),
    safeCount(supabase.from('events').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('services').select('id', { count: 'exact', head: true })),
    // ← changed: services don't have a "category" column — they're linked to
    // service_lines via service_line_id, same relationship servicesService.js uses.
    safeRows(supabase.from('services').select('service_line_id, service_lines ( name )')),
    safeCount(supabase.from('projects').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed')),
    safeCount(supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'ongoing')),
    safeCount(supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'upcoming')),
    safeCount(supabase.from('service_requests').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'new')),
    safeCount(supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'contacted')),
    safeCount(supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'in_progress')),
    safeCount(supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'resolved')),
    safeCount(supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'archived')),
  ])

  // ← changed: group by the joined service_lines.name instead of a non-existent
  // services.category column.
  const categoryCounts = {}
  serviceRows.forEach((row) => {
    const name = row.service_lines?.name?.trim() || 'Uncategorized'
    categoryCounts[name] = (categoryCounts[name] ?? 0) + 1
  })
  const servicesByCategory = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }))

  return {
    totalPosts, publishedPosts, draftPosts, totalComments, totalLikes, totalDislikes,
    totalUsers, totalTestimonials, totalMessages,
    totalPublications, publishedPublications, draftPublications,
    totalEvents,
    totalServices, servicesByCategory,
    totalProjects, completedProjects, ongoingProjects, upcomingProjects,
    totalServiceRequests, newRequests, contactedRequests, inProgressRequests, resolvedRequests, archivedRequests,
  }
}