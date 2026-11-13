// src/utils/cropImage.js
// Cut the middle of a picture to a given shape and size, and save it as a
// smaller JPEG (done in the browser, before the upload).

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

// width x height in pixels, for example 1920 x 640 for a cover
export async function cropToJpeg(file, width, height, quality = 0.82) {
  const img = await loadImage(file)
  const scale = Math.max(width / img.width, height / img.height)
  const sw = width / scale // the part of the picture that is kept
  const sh = height / scale
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0F3D32'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, width, height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the picture.'))), 'image/jpeg', quality),
  )
}