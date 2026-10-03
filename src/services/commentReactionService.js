// src/services/commentReactionService.js
import { supabase } from '../supabase'

export async function getCommentReactionCounts(commentId) {
  const { data, error } = await supabase
    .from('comment_reactions')
    .select('reaction')
    .eq('comment_id', commentId)

  if (error) throw error

  return (data ?? []).reduce(
    (acc, row) => {
      if (row.reaction === 'like') acc.likes += 1
      if (row.reaction === 'dislike') acc.dislikes += 1
      return acc
    },
    { likes: 0, dislikes: 0 }
  )
}

export async function getVisitorCommentReaction({ commentId, visitorId }) {
  const { data, error } = await supabase
    .from('comment_reactions')
    .select('reaction')
    .eq('comment_id', commentId)
    .eq('visitor_id', visitorId)
    .maybeSingle()

  if (error) throw error
  return data?.reaction ?? null
}

export async function submitCommentReaction({ commentId, visitorId, reaction }) {
  const { error } = await supabase
    .from('comment_reactions')
    .upsert(
      { comment_id: commentId, visitor_id: visitorId, reaction },
      { onConflict: 'comment_id,visitor_id' }
    )

  if (error) throw error
}