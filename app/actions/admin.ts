"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

export async function createResource(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Rate Limiting: 20 admin actions per hour
  const { success } = rateLimit(`admin:${user.id}`, 20, 3600000)
  if (!success) throw new Error("Too many admin actions. Please slow down.");

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const resource_type = formData.get("resource_type") as string;
  const file_url = formData.get("file_url") as string;
  const thumbnail_url = formData.get("thumbnail_url") as string;
  const category_id = formData.get("category_id") as string;
  const is_featured = formData.get("is_featured") === "true";

  const { error } = await supabase.from("resources").insert({
    title,
    slug,
    description,
    content,
    resource_type,
    file_url: file_url || null,
    thumbnail_url: thumbnail_url || null,
    category_id: category_id || null,
    is_featured,
    is_published: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/resources", "layout");
  revalidatePath("/dashboard/resources", "layout");
  return { success: true };
}

export async function updateResource(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const resource_type = formData.get("resource_type") as string;
  const file_url = formData.get("file_url") as string;
  const thumbnail_url = formData.get("thumbnail_url") as string;
  const category_id = formData.get("category_id") as string;
  const is_featured = formData.get("is_featured") === "true";

  const { error } = await supabase
    .from("resources")
    .update({
      title,
      slug,
      description,
      content,
      resource_type,
      file_url: file_url || null,
      thumbnail_url: thumbnail_url || null,
      category_id: category_id || null,
      is_featured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/resources", "layout");
  revalidatePath("/dashboard/resources", "layout");
  return { success: true };
}

export async function deleteResource(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Unauthorized");

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/resources", "layout");
  revalidatePath("/dashboard/resources", "layout");
  return { success: true };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: description || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories", "layout");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Unauthorized");

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories", "layout");
  return { success: true };
}

export async function recordDownload(resourceId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .single();

  if (!purchase && !profile?.is_admin) {
    throw new Error("You must purchase this resource first");
  }

  const { error } = await supabase.from("downloads").insert({
    user_id: user.id,
    resource_id: resourceId,
  });

  if (error && !error.message.includes("duplicate")) {
    throw new Error(error.message);
  }

  // Update download count
  await supabase.rpc("increment_download_count", { resource_id: resourceId });

  return { success: true };
}
