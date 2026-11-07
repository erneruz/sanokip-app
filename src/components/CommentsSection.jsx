// src/components/CommentsSection.jsx
import { useState, useEffect } from 'react'
import { getApprovedComments, submitComment, deleteComment } from '../services/commentsService'
import { buildCommentTree } from '../utils/commentTree'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

export default function CommentsSection({ postId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadComments() {
    try {
      const data = await getApprovedComments(postId)
      setComments(data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [postId])

  async function handleNewComment(values) {
    setSubmitting(true)
    try {
      await submitComment({ postId, ...values })
      await loadComments()
    } catch (err) {
      console.error('Failed to submit comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReply(parentId, values) {
    setSubmitting(true)
    try {
      await submitComment({ postId, parentId, ...values })
      await loadComments()
    } catch (err) {
      console.error('Failed to submit reply:', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment? Replies to it will be deleted too.")) return
    try {
      await deleteComment(commentId)
      loadComments()
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  const tree = buildCommentTree(comments)

  return (
    <section id="comments">
      <style>{`
        @keyframes comment-icon-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.1); }
          75% { transform: rotate(10deg) scale(1.1); }
        }
        .comments-heading:hover .comments-icon {
          animation: comment-icon-shake 0.4s ease-in-out;
        }
      `}</style>

      <h2 className="comments-heading inline-flex items-center gap-3 text-lg font-bold text-[#0D3A31]">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
          <ChatIcon className="comments-icon h-[18px] w-[18px]" />
        </span>
        Comments
        <span className="rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-sm font-semibold text-[#1B5E4F]">
          {comments.length}
        </span>
      </h2>

      <div className="mt-6">
        <CommentForm submitting={submitting} onSubmit={handleNewComment} />
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-3 rounded-xl border border-[#1B5E4F]/10 p-4">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#DCE9E5]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-[#DCE9E5]" />
                <div className="h-3 w-full rounded bg-[#E6F1EE]" />
                <div className="h-3 w-2/3 rounded bg-[#E6F1EE]" />
              </div>
            </div>
          ))}
        </div>
      ) : tree.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#1B5E4F]/30 bg-[#F1F6F4] px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
            <ChatIcon className="h-6 w-6" />
          </span>
          <p className="font-medium text-[#0D3A31]">No comments yet.</p>
          <p className="text-sm text-gray-500">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
              replying={submitting}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function ChatIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  )
}