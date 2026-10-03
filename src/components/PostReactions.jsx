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
    <div>
      <style>{`
        @keyframes reaction-shake {
          0%, 100% { transform: translateY(-2px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-8deg); }
          75% { transform: translateY(-2px) rotate(8deg); }
        }
        .reaction-btn:hover .reaction-icon {
          animation: reaction-shake 0.4s ease-in-out;
        }
      `}</style>

      <h3 className="font-semibold text-gray-900">Was this article helpful?</h3>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => handleReact('like')}
          disabled={submitting}
          className={`reaction-btn group flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            myReaction === 'like'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-sm'
          }`}
        >
          <ThumbsUpIcon
            className={`reaction-icon h-4 w-4 ${myReaction === 'like' ? 'text-white' : 'text-gray-600'}`}
            filled={myReaction === 'like'}
          />
          Like
          <span className={myReaction === 'like' ? 'text-gray-300' : 'text-gray-500'}>{counts.likes}</span>
        </button>

        <button
          onClick={() => handleReact('dislike')}
          disabled={submitting}
          className={`reaction-btn group flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            myReaction === 'dislike'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-sm'
          }`}
        >
          <ThumbsDownIcon
            className={`reaction-icon h-4 w-4 ${myReaction === 'dislike' ? 'text-white' : 'text-gray-600'}`}
            filled={myReaction === 'dislike'}
          />
          Dislike
          <span className={myReaction === 'dislike' ? 'text-gray-300' : 'text-gray-500'}>{counts.dislikes}</span>
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

function ThumbsUpIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDownIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}