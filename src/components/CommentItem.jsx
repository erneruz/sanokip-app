// src/components/CommentItem.jsx
import { useState, useEffect } from 'react'
import CommentForm from './CommentForm'
import { useAuth } from '../context/AuthContext'
import {
  getCommentReactionCounts,
  getVisitorCommentReaction,
  submitCommentReaction,
} from '../services/commentReactionService'
import { getVisitorId } from '../utils/visitorId'


function initials(name) {
  return name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase()
}

export default function CommentItem({ comment, onReply, onDelete, replying, isReply = false }) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  // ── added: per-comment like/dislike state ──────────────────────────
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 })
  const [myReaction, setMyReaction] = useState(null)
  const [reacting, setReacting] = useState(false)
  const visitorId = getVisitorId()

  useEffect(() => {
    let cancelled = false

    async function loadReactions() {
      try {
        const [reactionCounts, existingReaction] = await Promise.all([
          getCommentReactionCounts(comment.id),
          getVisitorCommentReaction({ commentId: comment.id, visitorId }),
        ])
        if (cancelled) return
        setCounts(reactionCounts)
        setMyReaction(existingReaction)
      } catch (err) {
        console.error('Failed to load comment reactions:', err)
      }
    }

    loadReactions()
    return () => { cancelled = true }
  }, [comment.id, visitorId])

  async function handleReact(reaction) {
    if (reacting) return

    const previous = myReaction
    setReacting(true)
    setMyReaction(reaction)
    setCounts((prev) => adjustCounts(prev, previous, reaction))

    try {
      await submitCommentReaction({ commentId: comment.id, visitorId, reaction })
    } catch (err) {
      console.error('Failed to save comment reaction:', err)
      setMyReaction(previous)
      setCounts((prev) => adjustCounts(prev, reaction, previous))
    } finally {
      setReacting(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  const replyCount = comment.replies.length

  return (
    <div
      className={
        isReply
          ? 'flex gap-3'
          : 'flex gap-3 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0'
      }
    >
      <style>{`
        @keyframes comment-reaction-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .comment-reaction-btn:hover .comment-reaction-icon {
          animation: comment-reaction-shake 0.4s ease-in-out;
        }
      `}</style>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
        {initials(comment.name)}
      </div>

      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900">{comment.name}</span>
          <span className="text-xs text-gray-400">
            {new Date(comment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <p className="mt-1 text-gray-700">{comment.comment}</p>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {/* ── added: like / dislike buttons ── */}
          <button
            onClick={() => handleReact('like')}
            disabled={reacting}
            className={`comment-reaction-btn flex cursor-pointer items-center gap-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              myReaction === 'like' ? 'text-gray-900' : 'hover:text-gray-900'
            }`}
          >
            <ThumbsUpIcon
              className="comment-reaction-icon h-4 w-4"
              filled={myReaction === 'like'}
            />
            {counts.likes > 0 && counts.likes}
          </button>

          <button
            onClick={() => handleReact('dislike')}
            disabled={reacting}
            className={`comment-reaction-btn flex cursor-pointer items-center gap-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              myReaction === 'dislike' ? 'text-gray-900' : 'hover:text-gray-900'
            }`}
          >
            <ThumbsDownIcon
              className="comment-reaction-icon h-4 w-4"
              filled={myReaction === 'dislike'}
            />
            {counts.dislikes > 0 && counts.dislikes}
          </button>
          {/* ─────────────────────────────────────── */}

          <button onClick={() => setShowReplyForm((v) => !v)} className="cursor-pointer font-medium hover:text-gray-900">
            Reply
          </button>

          {user && (
            <button onClick={() => onDelete(comment.id)} className="cursor-pointer font-medium text-red-500 hover:text-red-700">
              Delete
            </button>
          )}

          {replyCount > 0 && (
            <button onClick={() => setShowReplies((v) => !v)} className="cursor-pointer font-medium hover:text-gray-900">
              {showReplies ? `Hide replies` : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              submitting={replying}
              submitLabel="Post Reply"
              onSubmit={async (values) => {
                await onReply(comment.id, values)
                setShowReplyForm(false)
                setShowReplies(true)
              }}
            />
          </div>
        )}

        {showReplies && replyCount > 0 && (
          <div className="mt-4 space-y-4 border-l border-gray-100 pl-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                replying={replying}
                isReply
              />
            ))}
          </div>
        )}
      </div>
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