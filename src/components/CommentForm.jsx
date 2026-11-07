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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#1B5E4F]/15 bg-[#F8FBFA] p-6 shadow-[0_1px_2px_rgba(13,58,49,0.05)]"
    >
      <h3 className="flex items-center gap-2 font-semibold text-[#0D3A31]">
        <PencilIcon className="h-4 w-4 text-[#2F8F7A]" />
        Add your comment
      </h3>

      <label className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#0D3A31]">
        <UserIcon className="h-3.5 w-3.5 text-[#1B5E4F]" />
        Name
      </label>
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
            ? 'mt-1.5 w-full rounded-lg border-2 border-red-400 bg-white px-3 py-2 text-sm focus:outline-none'
            : 'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]'
        }
      />
      {nameError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <AlertIcon className="h-3.5 w-3.5 shrink-0" />
          Name is required
        </p>
      )}

      <label className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#0D3A31]">
        <MessageIcon className="h-3.5 w-3.5 text-[#1B5E4F]" />
        Comment
      </label>
      <textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your Comment"
        className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]"
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Posting…
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              {submitLabel}
            </>
          )}
        </button>

        <p className="inline-flex items-center gap-1.5 text-sm text-gray-500">
          <UserIcon className="h-3.5 w-3.5 text-[#2F8F7A]" />
          Posting as a guest.
        </p>
      </div>
    </form>
  )
}

function PencilIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function MessageIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  )
}

function AlertIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5h.01" />
    </svg>
  )
}

function SendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

function SpinnerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  )
}