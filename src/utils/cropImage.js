// src/utils/cropImage.js
// Cut a part of a picture to a given size and save it as a smaller JPEG
// (done in the browser, before the upload).

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

function toJpeg(canvas, quality) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the picture.'))), 'image/jpeg', quality),
  )
}

// Cut the part you choose: (sx, sy, sw, sh) are in pixels of the ORIGINAL picture.
// `img` is a loaded <img> element. The result is width x height pixels.
export async function cropRegionToJpeg(img, sx, sy, sw, sh, width, height, quality = 0.82) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0F3D32'
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
  return toJpeg(canvas, quality)
}

// Cut the middle of a picture (no choosing), width x height in pixels.
export async function cropToJpeg(file, width, height, quality = 0.82) {
  const img = await loadImage(file)
  const scale = Math.max(width / img.width, height / img.height)
  const sw = width / scale
  const sh = height / scale
  return cropRegionToJpeg(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, width, height, quality)
}