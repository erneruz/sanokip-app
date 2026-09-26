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
    totalEvents,
    totalServices,
    totalProjects,
  ] = await Promise.all([
    safeCount(supabase.from('posts').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published')),
    safeCount(supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft')),
    safeCount(supabase.from('comments').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('reaction', 'like')),
    safeCount(supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('reaction', 'dislike')),
    safeCount(supabase.from('users').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('testimonials').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('messages').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('publications').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('events').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('services').select('id', { count: 'exact', head: true })),
    safeCount(supabase.from('projects').select('id', { count: 'exact', head: true })),
  ])

  return {
    totalPosts, publishedPosts, draftPosts, totalComments, totalLikes, totalDislikes,
    totalUsers, totalTestimonials, totalMessages, totalPublications, totalEvents, totalServices, totalProjects,
  }
}