// src/services/dashboardService.js
import { supabase } from '../supabase'

export async function getDashboardStats() {
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts },
    { count: totalComments },
    { count: totalLikes },
    { count: totalDislikes },
  ] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('reaction', 'like'),
    supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('reaction', 'dislike'),
  ])

  return {
    totalPosts: totalPosts ?? 0,
    publishedPosts: publishedPosts ?? 0,
    draftPosts: draftPosts ?? 0,
    totalComments: totalComments ?? 0,
    totalLikes: totalLikes ?? 0,
    totalDislikes: totalDislikes ?? 0,
  }
}