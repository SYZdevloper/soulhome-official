"use server"

import { createClient } from "@/lib/server"
import { grantFolderAccess, getFileIdFromUrl } from "@/lib/google-drive"
import { revalidatePath } from "next/cache"
import { rateLimit } from "@/lib/rate-limit"

export async function downloadResource(resourceId: string, resourceUrl: string, resourceSlug: string) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Rate Limiting: 10 download attempts per 5 minutes per user
    const { success } = rateLimit(`download:${user.id}`, 10, 300000)
    if (!success) throw new Error("Too many download attempts. Please wait a few minutes.")

    const { data: profile } = await supabase.from('profiles').select('email, is_admin').eq('id', user.id).single()

    let { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .single()

    if (!purchase && !profile?.is_admin) {
        throw new Error("You have not purchased this resource.")
    }

    // 3. Get Resource Details & File ID
    const { data: resource } = await supabase
        .from('resources')
        .select('type')
        .eq('id', resourceId)
        .single()
        
    const fileId = getFileIdFromUrl(resourceUrl)
    if (!fileId) throw new Error("Invalid resource URL configuration")

    if (!profile?.email) throw new Error("User email not found")

    // 4. Check for Existing Download Record
    const { data: existingDownload } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .single()

    // 5. Grant/Restore Google Drive Access (Idempotent)
    // For PDFs, we proxy the file securely via our API so the user DOES NOT need direct Drive access.
    // We only grant Drive access for Audio/Video which stream directly from Drive.
    let permissionId = existingDownload?.drive_permission_id || null
    
    if (resource?.type !== 'pdf') {
        try {
            permissionId = await grantFolderAccess(profile.email, fileId)
        } catch (err: any) {
            console.error("Drive Grant Error:", err)
            const errorMessage = err?.message || err?.error_description || "Unknown Drive API Error"
            throw new Error(`Google Drive Error: ${errorMessage}`)
        }
    }

    // 6. If ALREADY DOWNLOADED, we are done
    if (existingDownload) {
        // Optional: Update the permission ID in case it changed
        if (permissionId && permissionId !== existingDownload.drive_permission_id) {
            await supabase.from('downloads').update({ drive_permission_id: permissionId }).eq('id', existingDownload.id)
        }
        return { success: true, url: resourceUrl, message: "Access Restored" }
    }

    // 7. Record New Download
    const { error } = await supabase.from('downloads').insert({
        user_id: user.id,
        resource_id: resourceId,
        drive_file_id: fileId,
        drive_permission_id: permissionId
    })

    if (error) {
        console.error("Database Insert Error:", error)
        throw new Error("Failed to record download.")
    }

    revalidatePath(`/dashboard/resources/${resourceSlug}`)
    revalidatePath('/dashboard')
    return { success: true, url: resourceUrl }
}
