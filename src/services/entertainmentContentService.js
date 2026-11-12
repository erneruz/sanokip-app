// src/services/entertainmentContentService.js
// Stories, news, opportunities, testimonials, videos and publications of
// Peak Star Entertainment (table ent_content).
import { supabase } from '../supabase'

export const ENT_CONTENT_CHANGED_EVENT = 'ent-content-changed'

// light list of everything, for the dashboard (counts and the latest items)
export async function getEntContentSummary() {
  const { data, error } = await supabase
    .from('ent_content')
    .select('id, kind, title, status, created_at, published_at')
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) throw error
  return data ?? []
}