"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createBlog, updateBlog, uploadBlogImage, type BlogData } from "@/app/actions/blog"
import { Loader2, Image as ImageIcon, X } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface BlogFormProps {
  initialData?: BlogData & { id: string }
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false)

  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "")
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.gallery_image_urls || [])
  const [isUploading, setIsUploading] = useState(false)

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!initialData) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("file", file)
    
    const result = await uploadBlogImage(formData)
    
    if (result.success && result.url) {
      if (isCover) {
        setCoverImageUrl(result.url)
      } else {
        setGalleryImages((prev) => [...prev, result.url!])
      }
    } else {
      setError(result.error || "Failed to upload image")
    }
    setIsUploading(false)
  }

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages(galleryImages.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!coverImageUrl) {
      setError("Cover image is required.")
      setIsSubmitting(false)
      return
    }

    const data: BlogData = {
      title,
      slug,
      excerpt,
      content,
      cover_image_url: coverImageUrl,
      gallery_image_urls: galleryImages,
      is_published: isPublished
    }

    const result = initialData
      ? await updateBlog(initialData.id, data)
      : await createBlog(data)

    if (result.success) {
      router.push("/admin/blogs")
      router.refresh()
    } else {
      setError(result.error || "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-destructive/15 text-destructive font-medium p-3 rounded-md text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Blog Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={handleTitleChange} 
                  required 
                  className="bg-background/50"
                  placeholder="The Power of Kundalini Yoga"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input 
                  id="slug" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  required 
                  className="bg-background/50 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base font-semibold">Excerpt / Description</Label>
                <p className="text-xs text-muted-foreground mb-2">A brief summary or subtitle for this post.</p>
                <div className="min-h-[150px]">
                  <RichTextEditor 
                    content={excerpt} 
                    onChange={setExcerpt} 
                    placeholder="Write a captivating description..."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="content" className="text-base font-semibold">Main Content</Label>
                <p className="text-xs text-muted-foreground mb-2">Write your full majestic article here. Supports formatting, links, and lists.</p>
                <div className="min-h-[400px]">
                  <RichTextEditor 
                    content={content} 
                    onChange={setContent} 
                    placeholder="Start writing your magical post..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-background/50">
                <div className="space-y-0.5">
                  <Label htmlFor="published">Published</Label>
                  <p className="text-xs text-muted-foreground">Make visible on site</p>
                </div>
                <Switch 
                  id="published" 
                  checked={isPublished} 
                  onCheckedChange={setIsPublished} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || isUploading} className="w-full h-11">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {initialData ? 'Update Post' : 'Create Post'}
              </Button>
            </CardFooter>
          </Card>

          {/* Cover Image Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Cover Image</CardTitle>
              <CardDescription>Main hero image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverImageUrl ? (
                <div className="relative aspect-video rounded-md overflow-hidden border border-border/50 group">
                  <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="sm" onClick={() => setCoverImageUrl("")}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-secondary/20 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload Cover</p>
                  </div>
                  <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={isUploading} />
                </Label>
              )}
            </CardContent>
          </Card>

          {/* Gallery Images Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Gallery Images</CardTitle>
              <CardDescription>Add 3+ images for the bottom gallery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {galleryImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border/50 group">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <Label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-secondary/20 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add</span>
                  <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} disabled={isUploading} />
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}

function Plus(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}
