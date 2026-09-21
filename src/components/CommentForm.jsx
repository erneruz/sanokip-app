// src/components/CommentForm.jsx
import { useState } from 'react'

export default function CommentForm({ onSubmit, submitting, submitLabel = 'Post Comment' }) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [nameError, setNameError] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      setNameError(true)
      return
    }

    await onSubmit({ name: name.trim(), comment: comment.trim() })
    setName('')
    setComment('')
    setNameError(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900">Add your comment</h3>

      <label className="mt-4 block text-sm font-medium text-gray-900">Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (nameError) setNameError(false)
        }}
        placeholder="Enter your name"
        className={
          nameError
            ? 'mt-1 w-full rounded-md border-2 border-red-400 px-3 py-2 focus:outline-none'
            : 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-400'
        }
      />
      {nameError && <p className="mt-1 text-sm text-red-600">Name is required</p>}

      <label className="mt-4 block text-sm font-medium text-gray-900">Comment</label>
      <textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your Comment"
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-400"
      />

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-md bg-black px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? 'Posting…' : submitLabel}
      </button>

      <p className="mt-3 text-sm text-gray-400">Posting as a guest.</p>
    </form>
  )
}