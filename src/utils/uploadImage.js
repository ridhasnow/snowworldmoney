export default async function uploadImageToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !preset) {
    throw new Error('Cloudinary env vars are missing: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET')
  }
  if (!file) {
    throw new Error('No file provided to upload')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', preset)
  // يمكنك تغيير اسم المجلد لاحقاً (مثلاً proofs)، هذا لا يؤثر على عمل الموقع
  formData.append('folder', 'products')

  const res = await fetch(url, { method: 'POST', body: formData })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed: ${text}`)
  }
  const data = await res.json()
  return { url: data.secure_url, public_id: data.public_id }
}
