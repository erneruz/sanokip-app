// src/components/entertainment/CoverCameraButton.jsx
// The "Cover" button in the corner of the profile cover. Choose a picture and it
// becomes the background of the green cover. The picture is cut to the cover
// shape and made smaller in the browser, then saved at once.
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { uploadMyCover, removeMyCover } from '../../services/entertainmentUsersService'
import { cropToJpeg } from '../../utils/cropImage'
import { Icon } from '../../pages/entertainment/account/accountUi'

const MAX_FILE = 15 * 1024 * 1024 // 15 MB before it is made smaller

export default function CoverCameraButton() {
  const { user, entProfile, refreshAccount } = useAuth()
  const inputRef = useRef(null)
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const hasCover = !!entProfile?.cover_url

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
      setMessage({ type: 'error', text: 'This picture is too big. Please choose one under 15 MB.' })
      return
    }
    setBusy(true)
    try {
      const blob = await cropToJpeg(file, 1920, 640)
      await uploadMyCover(user.id, blob, entProfile?.cover_url)
      await refreshAccount()
      setMessage({ type: 'ok', text: 'Your cover is saved.' })
    } catch (err) {
      console.error('Could not save the cover:', err)
      setMessage({ type: 'error', text: 'Could not save the cover. Please try again.' })
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
      await removeMyCover(user.id, entProfile?.cover_url)
      await refreshAccount()
      setMessage({ type: 'ok', text: 'Your cover is removed.' })
    } catch (err) {
      console.error('Could not remove the cover:', err)
      setMessage({ type: 'error', text: 'Could not remove the cover. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={wrapRef} className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        title="Change your cover picture"
        aria-label="Change your cover picture"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/35 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 sm:px-3.5"
      >
        {busy ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <Icon name="camera" size={15} />
        )}
        <span className="hidden sm:inline">{hasCover ? 'Change cover' : 'Add cover'}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="acc-pop absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-[#CDEBE2]"
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
            {hasCover ? 'Change cover' : 'Upload cover'}
          </button>
          {hasCover && (
            <button
              type="button"
              role="menuitem"
              onClick={handleRemove}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Icon name="trash" size={16} />
              Remove cover
            </button>
          )}
          <p className="px-3 pb-1.5 pt-1 text-[11px] leading-snug text-gray-400">
            A wide picture works best. JPG, PNG or WebP. We fit it to the cover for you.
          </p>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`acc-pop absolute right-0 top-full z-30 mt-2 w-56 rounded-lg px-3 py-2 text-center text-xs font-medium shadow-lg ${
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