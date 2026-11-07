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

/*
  Thread layout
    depth 0  top-level comment (green card)
    depth 1  direct replies, shown by default, joined by a curved arrow line
    depth 2  every reply to a reply, no matter how deep, is flattened onto
             ONE level, hidden at first, each labelled "Replying to <name>"
*/

function initials(name) {
  return name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase()
}

// All replies under a comment, flattened to one list in time order,
// each remembering the name of the person it answers.
function flattenReplies(comment) {
  const out = []

  function walk(list, parentName) {
    list.forEach((reply) => {
      out.push({ comment: reply, parentName })
      walk(reply.replies ?? [], reply.name)
    })
  }

  walk(comment.replies ?? [], comment.name)

  return out.sort((a, b) => new Date(a.comment.created_at) - new Date(b.comment.created_at))
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

// Curved line + arrow that leads from the parent's picture to a reply's picture
function ReplyList({ items, renderItem }) {
  return (
    <div className="ml-[17px] mt-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.comment.id} className={`relative pl-8 ${isLast ? '' : 'pb-4'}`}>
            {/* elbow: runs down, curves right, ends in an arrow at the avatar */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-[18px] w-6 rounded-bl-xl border-b-2 border-l-2 border-[#2F8F7A]/45"
            />
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 top-[18px] border-l-2 border-[#2F8F7A]/45"
              />
            )}
            <svg
              aria-hidden="true"
              className="absolute left-[19px] top-[12px] h-2.5 w-2.5 text-[#2F8F7A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m8 4 8 8-8 8" />
            </svg>

            {renderItem(item)}
          </div>
        )
      })}
    </div>
  )
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  replying,
  depth = 0,
  replyingTo = null,
}) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)

  // depth 0: direct replies open by default
  const [showReplies, setShowReplies] = useState(true)
  // depth 1: the deeper replies stay hidden until someone clicks
  const [showDeeper, setShowDeeper] = useState(false)

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

  const avatarUrl = comment.profiles?.avatar_url || comment.avatar_url || null

  const directReplies = comment.replies ?? []
  const deeperReplies = depth === 1 ? flattenReplies(comment) : []

  // Small action buttons under each comment
  const actionClass =
    'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-[#E6F1EE] hover:text-[#1B5E4F]'

  const reactionClass = (active) =>
    `comment-reaction-btn inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? 'bg-[#E6F1EE] text-[#1B5E4F]'
        : 'text-gray-500 hover:bg-[#E6F1EE] hover:text-[#1B5E4F]'
    }`

  // What the toggle button under this comment controls
  let toggle = null
  if (depth === 0 && directReplies.length > 0) {
    const n = directReplies.length
    toggle = {
      open: showReplies,
      onClick: () => setShowReplies((v) => !v),
      label: showReplies ? 'Hide replies' : `View ${n} ${n === 1 ? 'reply' : 'replies'}`,
    }
  } else if (depth === 1 && deeperReplies.length > 0) {
    const n = deeperReplies.length
    toggle = {
      open: showDeeper,
      onClick: () => setShowDeeper((v) => !v),
      label: showDeeper ? 'Hide replies' : `View ${n} ${n === 1 ? 'reply' : 'replies'}`,
    }
  }

  return (
    <div
      className={
        depth === 0
          ? 'rounded-xl border border-[#1B5E4F]/10 bg-[#F8FBFA] p-4'
          : ''
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

      {/* ── the comment itself ── */}
      <div className="flex gap-3">
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

          {/* who this reply answers (deep replies only) */}
          {replyingTo && (
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs text-[#1B5E4F]">
              <ReplyIcon className="h-3 w-3" />
              Replying to <span className="font-semibold">{replyingTo}</span>
            </p>
          )}

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

            {toggle && (
              <button onClick={toggle.onClick} className={actionClass}>
                {toggle.open ? (
                  <ChevronUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                )}
                {toggle.label}
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
                  if (depth === 0) setShowReplies(true)
                  if (depth === 1) setShowDeeper(true)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── first level of replies: visible, joined with arrow lines ── */}
      {depth === 0 && showReplies && directReplies.length > 0 && (
        <ReplyList
          items={directReplies.map((reply) => ({ comment: reply }))}
          renderItem={({ comment: reply }) => (
            <CommentItem
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              replying={replying}
              depth={1}
            />
          )}
        />
      )}

      {/* ── everything deeper: one flat level, hidden until clicked ── */}
      {depth === 1 && showDeeper && deeperReplies.length > 0 && (
        <ReplyList
          items={deeperReplies}
          renderItem={({ comment: reply, parentName }) => (
            <CommentItem
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              replying={replying}
              depth={2}
              replyingTo={parentName}
            />
          )}
        />
      )}
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