'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

const tabStyle = (active: boolean) =>
  `px-5 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
    active
      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
  }`

const inputStyle =
  'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white'
const textareaStyle =
  'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow font-mono bg-white min-h-[140px]'

const MediaSourceField: TextFieldClientComponent = ({ path }) => {
  const { value: sourceValue, setValue: setSource } = useField<string>({ path })
  const { value: embedValue, setValue: setEmbed } = useField<string>({ path: 'embedCode' })
  const { value: sourceType } = useField<string>({ path: 'type' })

  const [activeTab, setActiveTab] = useState<'link' | 'upload' | 'embed'>('link')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const clickLockRef = useRef(false)

  useEffect(() => {
    if (activeTab === 'upload' && sourceValue && !sourceValue.startsWith('blob:')) {
      setPreview(sourceValue)
    }
  }, [])

  // Auto-set source to 'embed' when embed tab has content, so validation passes
  useEffect(() => {
    if (activeTab === 'embed') {
      if (embedValue) {
        setSource('embed')
      } else if (sourceValue === 'embed') {
        setSource('')
      }
    }
  }, [activeTab, embedValue])

  const handleUpload = useCallback(async (file: File) => {
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError('File too large (max 50MB)')
      return
    }

    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/media-upload', {
        method: 'POST',
        body: formData,
      })
      const data: { url?: string; error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      if (data.url) {
        setSource(data.url)
        setPreview(data.url)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }, [setSource])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUpload(file)
    },
    [handleUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clickLockRef.current = false
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
    },
    [handleUpload],
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'link':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
              Media URL
            </label>
            <input
              type="url"
              value={sourceValue || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSource(e.target.value)}
              placeholder="https://instagram.com/p/..."
              className={inputStyle}
            />
            <p className="text-xs text-gray-500">
              Paste a public URL from Instagram, YouTube, Vimeo, or any other media platform.
            </p>
          </div>
        )

      case 'upload':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
              Upload from device
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                if (clickLockRef.current) return
                clickLockRef.current = true
                e.stopPropagation()
                fileInputRef.current?.click()
                setTimeout(() => { clickLockRef.current = false }, 1000)
              }}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (clickLockRef.current) return
                  clickLockRef.current = true
                  e.preventDefault()
                  e.stopPropagation()
                  fileInputRef.current?.click()
                  setTimeout(() => { clickLockRef.current = false }, 1000)
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : preview ? (
                <div className="text-center">
                  {preview.match(/\.(mp4|webm|mov|avi)$/i) || (!!preview.startsWith('blob:') && sourceType === 'video') ? (
                    <video src={preview} className="max-h-32 rounded mb-2" controls />
                  ) : (
                    <img src={preview} alt="Preview" className="max-h-32 rounded mb-2 object-contain" />
                  )}
                  <p className="text-xs text-green-600">File uploaded ✓</p>
                  <p className="text-xs text-gray-500 mt-1">Click or drop to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Drop a file here or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">Supports images and videos up to 50MB</p>
                  </div>
                </div>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>
        )

      case 'embed':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
              Embed Code
            </label>
            <textarea
              value={embedValue || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmbed(e.target.value)}
              placeholder={'<iframe src="https://player.vimeo.com/video/..." ...></iframe>'}
              className={textareaStyle}
              rows={5}
            />
            <p className="text-xs text-gray-500">
              Paste HTML embed code from Instagram, YouTube, Vimeo, TikTok, or other platforms.
              You can get this from the platform&apos;s share / embed menu.
            </p>
            {embedValue && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="text-xs text-gray-500 px-3 py-1.5 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
                  Preview
                </div>
                <div className="p-3 bg-white" dangerouslySetInnerHTML={{ __html: embedValue }} />
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="field-type text" style={{ gridColumn: 'span 2' as any }}>
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
          Media Source
        </label>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => setActiveTab('link')} className={tabStyle(activeTab === 'link')}>
            <span className="mr-1.5">🔗</span> Link
          </button>
          <button type="button" onClick={() => setActiveTab('upload')} className={tabStyle(activeTab === 'upload')}>
            <span className="mr-1.5">📁</span> Upload
          </button>
          <button type="button" onClick={() => setActiveTab('embed')} className={tabStyle(activeTab === 'embed')}>
            <span className="mr-1.5">{'</>'}</span> Embed Code
          </button>
        </div>
      </div>

      <div className="mt-3">{renderTabContent()}</div>

      {sourceValue && activeTab !== 'embed' && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          <span className="font-medium">Stored URL:</span> {sourceValue}
        </div>
      )}
      {embedValue && activeTab === 'embed' && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          <span className="font-medium">Embed code stored</span> ({embedValue.length} chars)
        </div>
      )}
    </div>
  )
}

export default MediaSourceField
