// src/components/CommentItem.jsx
import { useState } from 'react'
import CommentForm from './CommentForm'

function initials(name) {
  return name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase()
}

export default function CommentItem({ comment, onReply, onDelete, replying, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const replyCount = comment.replies.length

  return (
    <div
      className={
        isReply
          ? 'flex gap-3'
          : 'flex gap-3 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0'
      }
    >
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

        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <button onClick={() => setShowReplyForm((v) => !v)} className="cursor-pointer font-medium hover:text-gray-900">
            Reply
          </button>

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