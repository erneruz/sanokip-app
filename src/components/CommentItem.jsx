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

// Round picture if the author uploaded one, green initials otherwise
function CommentAvatar({ name, url }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-xs font-bold text-white shadow-sm">
      {url && !failed ? (
        <img
          src={url}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </div>
  )
}

export default function CommentItem({ comment, onReply, onDelete, replying, isReply = false }) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  // ── per-comment like/dislike state ──────────────────────────
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 })
  const [myReaction, setMyReaction] = useState(null)
  const [reacting, setReacting] = useState(false)

  // Signed-in people react with their account (follows them on any device);
  // visitors keep using the anonymous browser id.
  const visitorId = user?.id ?? getVisitorId()

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
  const avatarUrl = comment.profiles?.avatar_url || comment.avatar_url || null

  // Small action buttons under each comment
  const actionClass =
    'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-[#E6F1EE] hover:text-[#1B5E4F]'

  const reactionClass = (active) =>
    `comment-reaction-btn inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? 'bg-[#E6F1EE] text-[#1B5E4F]'
        : 'text-gray-500 hover:bg-[#E6F1EE] hover:text-[#1B5E4F]'
    }`

  return (
    <div
      className={
        isReply
          ? 'flex gap-3'
          : 'flex gap-3 rounded-xl border border-[#1B5E4F]/10 bg-[#F8FBFA] p-4'
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

      <CommentAvatar name={comment.name} url={avatarUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold text-[#0D3A31]">{comment.name}</span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <CalendarIcon className="h-3 w-3 text-[#2F8F7A]" />
            {new Date(comment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <p className="mt-1 break-words text-gray-700">{comment.comment}</p>

        <div className="mt-2 -ml-2 flex flex-wrap items-center gap-1">
          {/* ── like / dislike buttons ── */}
          <button
            onClick={() => handleReact('like')}
            disabled={reacting}
            className={reactionClass(myReaction === 'like')}
          >
            <ThumbsUpIcon
              className="comment-reaction-icon h-3.5 w-3.5"
              filled={myReaction === 'like'}
            />
            {counts.likes > 0 && counts.likes}
          </button>

          <button
            onClick={() => handleReact('dislike')}
            disabled={reacting}
            className={reactionClass(myReaction === 'dislike')}
          >
            <ThumbsDownIcon
              className="comment-reaction-icon h-3.5 w-3.5"
              filled={myReaction === 'dislike'}
            />
            {counts.dislikes > 0 && counts.dislikes}
          </button>
          {/* ─────────────────────────────────────── */}

          <button onClick={() => setShowReplyForm((v) => !v)} className={actionClass}>
            <ReplyIcon className="h-3.5 w-3.5" />
            Reply
          </button>

          {user && (
            <button
              onClick={() => onDelete(comment.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>
          )}

          {replyCount > 0 && (
            <button onClick={() => setShowReplies((v) => !v)} className={actionClass}>
              {showReplies ? (
                <ChevronUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              )}
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
          <div className="mt-4 space-y-4 border-l-2 border-[#2F8F7A]/30 pl-4">
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

function CalendarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function ReplyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17 4 12l5-5" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  )
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
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