// Resize a user-supplied image to a max dimension and re-encode as JPEG.
// Keeps phone photos from blowing past Supabase storage / bandwidth limits.

const MAX_DIMENSION = 1024
const JPEG_QUALITY = 0.82

export async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file)
  const ratio = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height, 1)
  const w = Math.round(img.width * ratio)
  const h = Math.round(img.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, w, h)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Could not encode image')),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}
