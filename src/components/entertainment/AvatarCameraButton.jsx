// src/components/entertainment/AvatarCameraButton.jsx
// The small camera button on the profile picture in the profile header.
// It is the ONLY place where the profile picture is changed: tap it, choose
// "Upload photo" (or "Change photo") or "Remove photo". The photo is cropped to a
// square, made smaller in the browser and saved at once.
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { uploadMyAvatar, removeMyAvatar } from '../../services/entertainmentUsersService'
import { Icon } from '../../pages/entertainment/account/accountUi'

const MAX_FILE = 12 * 1024 * 1024 // 12 MB before it is made smaller

// other pages can ask for the photo picker with: window.dispatchEvent(new Event(CHOOSE_AVATAR_EVENT))
export const CHOOSE_AVATAR_EVENT = 'ent-choose-avatar'

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

export default function AvatarCameraButton() {
  const { user, entProfile, refreshAccount } = useAuth()
  const inputRef = useRef(null)
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const hasPhoto = !!entProfile?.avatar_url

  // close the small menu on outside click / Escape
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // other buttons (for example "Add a profile photo" in the strength meter) can open the picker
  useEffect(() => {
    const choose = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      inputRef.current?.click()
    }
    window.addEventListener(CHOOSE_AVATAR_EVENT, choose)
    return () => window.removeEventListener(CHOOSE_AVATAR_EVENT, choose)
  }, [])

  // the confirmation message goes away by itself
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

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
    setOpen(false)
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
    <div ref={wrapRef}>
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#0A2E27]/55">
          <span className="size-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </span>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        title="Change your photo"
        aria-label="Change your photo"
        aria-haspopup="menu"
        aria-expanded={open}
        className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#1B5E4F] text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-[#0F3D32] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Icon name="camera" size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="acc-pop absolute left-0 top-full z-30 mt-3 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-[#CDEBE2]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              inputRef.current?.click()
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#0F3D32] transition hover:bg-[#E6F1EE]"
          >
            <Icon name="camera" size={16} className="text-[#2F9678]" />
            {hasPhoto ? 'Change photo' : 'Upload photo'}
          </button>
          {hasPhoto && (
            <button
              type="button"
              role="menuitem"
              onClick={handleRemove}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Icon name="trash" size={16} />
              Remove photo
            </button>
          )}
          <p className="px-3 pb-1.5 pt-1 text-[11px] leading-snug text-gray-400">JPG, PNG or WebP. We crop it to a square.</p>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`acc-pop absolute left-0 top-full z-30 mt-3 w-56 rounded-lg px-3 py-2 text-center text-xs font-medium shadow-lg ${
            message.type === 'ok' ? 'bg-[#1B5E4F] text-white' : 'border border-red-200 bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}

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