import React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/server"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Library, Users, FolderOpen, LogOut, ArrowLeft, Home, FileText, Mail } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import Image from "next/image"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[v0] Admin layout - User:', user?.id)

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('[v0] Admin layout - Profile:', profile)
  console.log('[v0] Admin layout - Is admin:', profile?.is_admin)

  if (!profile?.is_admin) {
    console.log('[v0] Admin layout - Not admin, redirecting')
    redirect("/dashboard")
  }

  console.log('[v0] Admin layout - Access granted')

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/blogs", label: "Blog Content", icon: FileText },
    { href: "/admin/resources", label: "Resource Library", icon: Library },
    { href: "/admin/categories", label: "System Categories", icon: FolderOpen },
    { href: "/admin/members", label: "User Management", icon: Users },
    { href: "/admin/waitlist", label: "Waitlist", icon: Users },
    { href: "/admin/email", label: "Email Hub", icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0a0a0b]">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-primary/20 bg-primary md:block z-[60]">
        <div className="flex h-full flex-col p-6">
          <Link href="/admin" className="flex items-center gap-3 px-2 mb-10">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/20 p-2 shadow-inner">
              <Image
                src="/logo.png"
                alt="Soul Home"
                width={24}
                height={24}
                className="h-full w-full object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-primary-foreground leading-none tracking-tight">Admin Portal</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70 font-semibold mt-1">Management Console</span>
            </div>
          </Link>

          <nav className="flex-1 space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary-foreground/80 transition-all duration-300 hover:bg-white/10 hover:text-primary-foreground relative overflow-hidden"
              >
                <link.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                {link.label}
                <div className="absolute left-0 h-4 w-1 bg-primary-foreground rounded-r-full transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-primary-foreground/20">
            <Button variant="outline" size="sm" className="w-full justify-start gap-3 rounded-xl border-primary-foreground/20 bg-transparent text-primary-foreground/90 hover:bg-white/10 hover:text-primary-foreground transition-all duration-300" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Main Website
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-3 rounded-xl border-primary-foreground/20 bg-transparent text-primary-foreground/90 hover:bg-white/10 hover:text-primary-foreground transition-all duration-300" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Member Area
              </Link>
            </Button>
            <form action={signOut} className="w-full">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-3 rounded-xl text-red-200/90 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-72 flex flex-col min-h-screen">
        {/* Top bar for mobile or extra info */}
        <header className="sticky top-0 z-50 md:hidden border-b border-border/40 bg-white/70 backdrop-blur-xl dark:bg-black/70 px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
             <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
             <span className="font-serif font-bold">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
             <LayoutDashboard className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full">
           {children}
        </main>
      </div>
    </div>
  )
}
