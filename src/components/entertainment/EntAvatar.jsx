// src/components/entertainment/EntAvatar.jsx
// A round profile picture. Shows the photo when there is one, otherwise the
// first letters of the name on a green background.
import { useEffect, useState } from 'react'

export default function EntAvatar({ name = '', src = '', size = 'size-10', textClass = 'text-sm', className = '' }) {
  const [failed, setFailed] = useState(false)

  // a new picture: try it again
  useEffect(() => setFailed(false), [src])

  const initials =
    String(name)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'

  return (
    <span
      className={`${size} ${className} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1B5E4F] to-[#2F9678] ring-2 ring-[#9FD8C9]/70`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name ? `Photo of ${name}` : 'Profile photo'}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={`${textClass} font-bold text-white`}>{initials}</span>
      )}
    </span>
  )
}