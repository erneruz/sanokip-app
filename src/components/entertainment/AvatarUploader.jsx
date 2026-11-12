// src/components/entertainment/AvatarUploader.jsx
// Change or remove the profile picture. The photo is cropped to a square and
// made smaller in the browser, then saved. It is saved at once (no need to
// press "Save changes" for the photo).
import { useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import EntAvatar from './EntAvatar'
import { uploadMyAvatar, removeMyAvatar } from '../../services/entertainmentUsersService'
import { Icon } from '../../pages/entertainment/account/accountUi'

const MAX_FILE = 12 * 1024 * 1024 // 12 MB before it is made smaller

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This file is not a readable picture.'))
    }
    img.src = url
  })
}

// centre square, 512 x 512, JPEG
async function squareJpeg(file, side = 512) {
  const img = await loadImage(file)
  const s = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, side, side)
  ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, side, side)
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the photo.'))), 'image/jpeg', 0.86),
  )
}

export default function AvatarUploader() {
  const { user, entProfile, refreshAccount } = useAuth()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const name = entProfile?.full_name || user?.email || ''
  const hasPhoto = !!entProfile?.avatar_url

  async function handleFile(file) {
    if (!file) return
    setMessage(null)
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setMessage({ type: 'error', text: 'Please choose a JPG, PNG or WebP picture.' })
      return
    }
    if (file.size > MAX_FILE) {
      setMessage({ type: 'error', text: 'This picture is too big. Please choose one under 12 MB.' })
      return
    }
    setBusy(true)
    try {
      const blob = await squareJpeg(file)
      await uploadMyAvatar(user.id, blob, entProfile?.avatar_url)
      await refreshAccount()
      setMessage({ type: 'ok', text: 'Your new photo is saved.' })
    } catch (err) {
      console.error('Could not save the photo:', err)
      setMessage({ type: 'error', text: 'Could not save the photo. Please try again.' })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    setMessage(null)
    setBusy(true)
    try {
      await removeMyAvatar(user.id, entProfile?.avatar_url)
      await refreshAccount()
      setMessage({ type: 'ok', text: 'Your photo is removed.' })
    } catch (err) {
      console.error('Could not remove the photo:', err)
      setMessage({ type: 'error', text: 'Could not remove the photo. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={`relative rounded-full p-1.5 transition ${drag ? 'bg-[#9FD8C9]/60 scale-105' : 'bg-[#E6F1EE]'}`}
      >
        <EntAvatar name={name} src={entProfile?.avatar_url} size="size-28" textClass="text-3xl" />
        {busy && (
          <span className="absolute inset-1.5 flex items-center justify-center rounded-full bg-[#0A2E27]/55">
            <span className="size-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </span>
        )}
      </div>

      <div className="min-w-0 text-center sm:text-left">
        <p className="text-sm font-semibold text-[#0F3D32]">{hasPhoto ? 'Your profile photo' : 'Add a profile photo'}</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
          A clear photo of your face helps scouts and partners trust your profile. JPG, PNG or WebP. We crop it to a
          square for you.
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1B5E4F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#154A3F] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="camera" size={16} />
            {hasPhoto ? 'Change photo' : 'Upload photo'}
          </button>
          {hasPhoto && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-300 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="trash" size={16} />
              Remove
            </button>
          )}
        </div>

        {message && (
          <p
            role="status"
            className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
              message.type === 'ok' ? 'bg-[#E6F1EE] text-[#154A3F]' : 'border border-red-200 bg-red-50 text-red-600'
            }`}
          >
            <Icon name={message.type === 'ok' ? 'check' : 'info'} size={13} />
            {message.text}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}