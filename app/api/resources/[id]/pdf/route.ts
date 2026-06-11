import { createClient } from "@/lib/server"
import { getDriveClient } from "@/lib/google-drive"
import { Readable } from "stream"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // 1. Get logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // 2. Check active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return new Response("No active subscription", { status: 403 })
    }

    // 3. Check if they unlocked/downloaded this resource
    const { data: existingDownload } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', user.id)
      .eq('resource_id', id)
      .single()

    if (!existingDownload) {
      return new Response("Access not unlocked. Please unlock the resource first.", { status: 403 })
    }

    // 4. Get resource URL to get the file ID
    const { data: resource } = await supabase
      .from('resources')
      .select('file_url, type')
      .eq('id', id)
      .single()

    if (!resource || resource.type !== 'pdf' || !resource.file_url) {
      return new Response("Invalid resource type or URL configuration", { status: 400 })
    }

    const fileId = getFileIdFromUrl(resource.file_url)
    if (!fileId) {
      return new Response("Drive file ID could not be extracted from resource URL", { status: 400 })
    }

    // 5. Fetch file stream from Google Drive
    const drive = getDriveClient()
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    const nodeStream = response.data as any
    // Convert Node.js Readable stream to Web ReadableStream for standard Response
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream

    return new Response(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    })
  } catch (error: any) {
    console.error("Error serving PDF:", error)
    return new Response(error?.message || "Internal server error", { status: 500 })
  }
}
