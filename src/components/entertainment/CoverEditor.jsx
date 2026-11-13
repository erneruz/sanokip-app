// src/components/entertainment/CoverEditor.jsx
// "Position your cover": the member drags the picture to the place they want and
// can zoom with a slider. What is seen in the strip is what gets saved.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cropRegionToJpeg } from '../../utils/cropImage'

// the saved cover: 1920 x 400 (about the shape of the cover on a computer screen)
export const COVER_W = 1920
export const COVER_H = 400
const MAX_ZOOM = 3

export default function CoverEditor({ file, busy = false, error = '', onCancel, onSave }) {
  const frameRef = useRef(null)
  const imgRef = useRef(null)
  const drag = useRef(null)
  const [url, setUrl] = useState(null)
  const [nat, setNat] = useState(null) // size of the original picture { w, h }
  const [frame, setFrame] = useState({ w: 0, h: 0 }) // size of the strip on the screen
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState(null) // the point of the picture shown in the middle (null = its middle)
  const [grabbing, setGrabbing] = useState(false)
  const [loadError, setLoadError] = useState('')

  // show the chosen file
  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  // measure the strip (and again when the window changes size)
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Escape closes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  const ready = !!nat && frame.w > 0
  const base = ready ? Math.max(frame.w / nat.w, frame.h / nat.h) : 1 // smallest size that fills the strip
  const scale = base * zoom
  const half = ready ? { x: frame.w / (2 * scale), y: frame.h / (2 * scale) } : { x: 0, y: 0 }

  // keep the strip always full of picture (no empty edges)
  const clamp = (p) => ({
    x: Math.min(Math.max(p.x, half.x), nat.w - half.x),
    y: Math.min(Math.max(p.y, half.y), nat.h - half.y),
  })
  const c = ready ? clamp(center ?? { x: nat.w / 2, y: nat.h / 2 }) : { x: 0, y: 0 }
  const left = frame.w / 2 - c.x * scale
  const top = frame.h / 2 - c.y * scale

  function onPointerDown(e) {
    if (!ready || busy) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, c }
    setGrabbing(true)
  }
  function onPointerMove(e) {
    if (!drag.current || !ready) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    setCenter(clamp({ x: drag.current.c.x - dx / scale, y: drag.current.c.y - dy / scale }))
  }
  function onPointerEnd() {
    drag.current = null
    setGrabbing(false)
  }
  function onKeyDown(e) {
    if (!ready || busy) return
    const step = 24 / scale
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const m = moves[e.key]
    if (!m) return
    e.preventDefault()
    setCenter(clamp({ x: c.x + m[0], y: c.y + m[1] }))
  }

  function reset() {
    setZoom(1)
    setCenter(null)
  }

  async function save() {
    if (!ready || !imgRef.current) return
    try {
      const blob = await cropRegionToJpeg(
        imgRef.current,
        c.x - half.x,
        c.y - half.y,
        frame.w / scale,
        frame.h / scale,
        COVER_W,
        COVER_H,
      )
      onSave(blob)
    } catch (err) {
      console.error('Could not prepare the cover:', err)
      setLoadError('Could not prepare this picture. Please try another one.')
    }
  }

  const problem = error || loadError

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Position your cover">
      <div className="absolute inset-0 bg-[#0A2E27]/70 backdrop-blur-sm" onClick={() => !busy && onCancel()} />

      <div className="acc-pop relative w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-[#CDEBE2] sm:p-6">
        <h2 className="text-lg font-semibold text-[#0F3D32]">Position your cover</h2>
        <p className="mt-1 text-sm text-gray-500">Drag the picture to choose what shows. Use the slider to zoom in or out.</p>

        {/* the strip: same shape as the cover, with the same green laid over it */}
        <div
          ref={frameRef}
          tabIndex={0}
          role="group"
          aria-label="Cover preview. Drag, or use the arrow keys, to move the picture."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onKeyDown}
          style={{ aspectRatio: `${COVER_W} / ${COVER_H}`, touchAction: 'none' }}
          className={
            'relative mt-4 w-full select-none overflow-hidden rounded-2xl bg-[#0F3D32] outline-none ring-1 ring-[#CDEBE2] focus-visible:ring-2 focus-visible:ring-[#2F9678] ' +
            (grabbing ? 'cursor-grabbing' : 'cursor-grab')
          }
        >
          {url && (
            <img
              ref={imgRef}
              src={url}
              alt=""
              draggable={false}
              onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onError={() => setLoadError('This file is not a readable picture.')}
              style={{
                position: 'absolute',
                maxWidth: 'none',
                left: ready ? left : 0,
                top: ready ? top : 0,
                width: ready ? nat.w * scale : 'auto',
                height: ready ? nat.h * scale : 'auto',
                opacity: ready ? 1 : 0,
              }}
            />
          )}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A2E27]/75 via-[#0F3D32]/30 to-[#0A2E27]/10" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A2E27]/70 via-transparent to-[#0A2E27]/25" />
          {!grabbing && ready && (
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Drag to move
            </span>
          )}
        </div>

        {/* zoom */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Zoom</span>
          <input
            type="range"
            min="1"
            max={MAX_ZOOM}
            step="0.01"
            value={zoom}
            disabled={busy}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="h-2 flex-1 cursor-pointer accent-[#1B5E4F]"
          />
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1B5E4F] transition hover:bg-[#E6F1EE] disabled:opacity-60"
          >
            Reset
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-400">On a phone the cover is narrower, so a little of the left and right sides is hidden.</p>

        {problem && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{problem}</p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !ready}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#154A3F] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {busy ? 'Saving...' : 'Save cover'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}   