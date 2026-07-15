"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, X, Crop as CropIcon } from "lucide-react"
import { createClient } from "@/lib/client"
import type { Category, Resource } from "@/lib/types"
import { ImageCropper } from "@/components/image-cropper"

interface ResourceFormProps {
  categories: Category[]
  resource?: Resource
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ResourceForm({ categories, resource }: ResourceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null)

  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<Blob | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(resource?.thumbnail_url || null)

  const [formData, setFormData] = useState({
    title: resource?.title || "",
    slug: resource?.slug || "",
    description: resource?.description || "",
    type: resource?.type || "pdf",
    file_url: resource?.file_url || "",
    thumbnail_url: resource?.thumbnail_url || "",
    calendly_url: resource?.calendly_url || "",
    price: resource?.price?.toString() || "",
    duration_minutes: resource?.duration_minutes?.toString() || "",
    file_size_bytes: resource?.file_size_bytes?.toString() || "",
    category_id: resource?.category_id || "none",
    is_published: resource?.is_published ?? false,
  })

  function handleTitleChange(title: string) {
    setFormData(prev => ({
      ...prev,
      title,
      slug: resource ? prev.slug : generateSlug(title),
    }))
  }

  // Handle PDF File Selection
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPdfFile(file)
      // Auto-set file size
      setFormData(prev => ({
        ...prev,
        file_size_bytes: file.size.toString()
      }))
    }
  }

  // Handle Image File Selection (opens cropper)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setTempImageSrc(reader.result as string)
        setIsCropperOpen(true)
      })
      reader.readAsDataURL(file)
      // Reset input value to allow re-selecting same file
      e.target.value = ''
    }
  }

  // Handle Crop Completion
  const onCropComplete = (croppedBlob: Blob) => {
    setThumbnailFile(croppedBlob)
    setThumbnailPreview(URL.createObjectURL(croppedBlob))
  }

  // Upload to Supabase Storage
  async function uploadFileToSupabase(file: File | Blob, bucket: string, path: string) {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalFileUrl = formData.file_url
      let finalThumbnailUrl = formData.thumbnail_url

      // (PDF/Resource file upload logic removed - using Drive Link instead)


      // Upload Thumbnail if new file selected/cropped
      if (thumbnailFile) {
        const fileName = `${formData.slug}-thumb-${Date.now()}.jpg`
        const filePath = `uploads/${fileName}`

        // Ensure you have a 'thumbnails' bucket
        finalThumbnailUrl = await uploadFileToSupabase(thumbnailFile, 'thumbnails', filePath)
      }

      const supabase = createClient()

      const duration = parseInt(formData.duration_minutes)
      const fileSize = parseInt(formData.file_size_bytes)
      const price = parseFloat(formData.price)

      const data = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        type: formData.type,
        file_url: finalFileUrl,
        thumbnail_url: finalThumbnailUrl || null,
        calendly_url: formData.calendly_url || null,
        price: isNaN(price) ? null : price,
        duration_minutes: isNaN(duration) ? null : duration,
        file_size_bytes: isNaN(fileSize) ? null : fileSize,
        category_id: formData.category_id === "none" ? null : formData.category_id,
        is_published: formData.is_published,
      }

      console.log('Submitting data:', data) // Debug log

      if (resource) {
        const { error } = await supabase
          .from('resources')
          .update(data)
          .eq('id', resource.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('resources')
          .insert(data)
        if (error) throw error
      }

      router.push('/admin/resources')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving resource:', error)
      const msg = error.message || error.error_description || JSON.stringify(error)
      alert(`Failed to save resource: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Main Info Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Resource title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="resource-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this resource"
                rows={4}
              />
            </div>

            <div className="space-y-2 border p-4 rounded-md bg-blue-50/50">
              <Label htmlFor="calendly_url" className="text-blue-700">Calendly Event URL (Payment Link)</Label>
              <div className="text-xs text-blue-600/80 mb-2">
                Paste the full link from Calendly for this specific resource. This is used to map purchases from Calendly to this resource.
              </div>
              <Input
                id="calendly_url"
                value={formData.calendly_url}
                onChange={(e) => setFormData(prev => ({ ...prev, calendly_url: e.target.value }))}
                placeholder="https://calendly.com/your-name/payment-event-name"
                type="url"
              />
            </div>

            <div className="space-y-2 border p-4 rounded-md bg-green-50/50">
              <Label htmlFor="price" className="text-green-700">Price ($)</Label>
              <div className="text-xs text-green-600/80 mb-2">
                Enter the price of this resource. This will be displayed on the resource page.
              </div>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="e.g. 10.00"
                type="number"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as "pdf" | "audio" | "video" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Guide</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Upload Column */}
          <div className="space-y-6">
            {/* PDF Upload */}
            {/* Resource URL Input */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50/50">
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Google Drive Link ({formData.type.toUpperCase()})
              </Label>
              <div className="text-xs text-muted-foreground mb-2">
                Paste the full "Share" link from Google Drive.
              </div>

              <Input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={formData.file_url}
                onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                required
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50/50">
              <Label className="flex items-center gap-2">
                <CropIcon className="w-4 h-4" />
                Thumbnail Image
              </Label>

              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />

              {thumbnailPreview && (
                <div className="mt-4 relative group w-fit">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-40 h-auto rounded-md border shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setThumbnailFile(null)
                      setThumbnailPreview(null)
                      setFormData(prev => ({ ...prev, thumbnail_url: '' }))
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (mins)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_size_bytes">Size (bytes)</Label>
                <Input
                  id="file_size_bytes"
                  type="number"
                  placeholder="Optional (approx)"
                  value={formData.file_size_bytes}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_size_bytes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
              <Label htmlFor="is_published">Publish to members immediately</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[150px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Save Resource"
            )}
          </Button>
        </div>
      </form>

      <ImageCropper
        imageSrc={tempImageSrc}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={onCropComplete}
        aspectRatio={16 / 9}
      />
    </>
  )
}
