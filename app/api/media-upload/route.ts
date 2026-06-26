import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}`, filename })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
