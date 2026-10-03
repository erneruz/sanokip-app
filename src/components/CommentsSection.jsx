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

      <h2 className="comments-heading inline-flex items-center gap-2 text-lg font-bold text-gray-900">
        <ChatIcon className="comments-icon h-5 w-5 text-gray-700" />
        Comments <span className="text-gray-400">({comments.length})</span>
      </h2>

      <div className="mt-6">
        <CommentForm submitting={submitting} onSubmit={handleNewComment} />
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading comments…</p>
      ) : tree.length === 0 ? (
        <p className="mt-8 text-gray-500">No comments yet. Be the first to comment.</p>
      ) : (
        <div className="mt-8 space-y-6">
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