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
    <section id="comments" className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <span>💬</span> Comment {comments.length}
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