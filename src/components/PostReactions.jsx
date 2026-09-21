// src/components/PostReactions.jsx
import { useState, useEffect } from 'react'
import { submitReaction, getVisitorReaction, getReactionCounts } from '../services/reactionService'
import { getVisitorId } from '../utils/visitorId'

export default function PostReactions({ postId }) {
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 })
  const [myReaction, setMyReaction] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const visitorId = getVisitorId()

  useEffect(() => {
    let cancelled = false

    async function loadInitialState() {
      try {
        const [reactionCounts, existingReaction] = await Promise.all([
          getReactionCounts(postId),
          getVisitorReaction({ postId, visitorId }),
        ])
        if (cancelled) return
        setCounts(reactionCounts)
        setMyReaction(existingReaction)
      } catch (err) {
        console.error('Failed to load reactions:', err)
      }
    }

    loadInitialState()
    return () => { cancelled = true }
  }, [postId, visitorId])

  async function handleReact(reaction) {
    if (submitting) return

    const previousReaction = myReaction
    setSubmitting(true)
    setError(null)

    setMyReaction(reaction)
    setCounts((prev) => adjustCounts(prev, previousReaction, reaction))

    try {
      await submitReaction({ postId, visitorId, reaction })
    } catch (err) {
      console.error('Failed to save reaction:', err)
      setMyReaction(previousReaction)
      setCounts((prev) => adjustCounts(prev, reaction, previousReaction))
      setError('Unable to save your reaction. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h3 className="font-semibold text-gray-900">Was this article helpful?</h3>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => handleReact('like')}
          disabled={submitting}
          className={
            myReaction === 'like'
              ? 'flex items-center gap-2 rounded-md border-2 border-black px-4 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed'
              : 'flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed'
          }
        >
          <span>👍</span> Like <span className="text-gray-500">{counts.likes}</span>
        </button>

        <button
          onClick={() => handleReact('dislike')}
          disabled={submitting}
          className={
            myReaction === 'dislike'
              ? 'flex items-center gap-2 rounded-md border-2 border-black px-4 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed'
              : 'flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed'
          }
        >
          <span>👎</span> Dislike <span className="text-gray-500">{counts.dislikes}</span>
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function adjustCounts(counts, from, to) {
  const next = { ...counts }
  if (from === 'like') next.likes -= 1
  if (from === 'dislike') next.dislikes -= 1
  if (to === 'like') next.likes += 1
  if (to === 'dislike') next.dislikes += 1
  return next
}