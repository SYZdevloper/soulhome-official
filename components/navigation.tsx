"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

interface NavigationProps {
  isLoggedIn?: boolean
  isAdmin?: boolean
}

export function Navigation({ isLoggedIn = false, isAdmin = false }: NavigationProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fix Radix UI body pointer-events bug when navigating from mobile menu
  useEffect(() => {
    document.body.style.pointerEvents = "auto"
  }, [pathname])

  const isHome = pathname === "/"
  const isTransparent = isHome && !scrolled
  const isDarkText = !isHome && !scrolled

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-primary/95 backdrop-blur-md shadow-lg py-0 border-b-0"
        : "bg-transparent py-2"
    )}>
      <nav className={cn(
        "mx-auto flex max-w-[1400px] items-center px-6 sm:px-8 lg:px-12 transition-all duration-300 relative",
        scrolled ? "h-20" : "h-28"
      )}>
        {/* Mobile Navigation Trigger - Absolute Right */}
        <div className="absolute right-6 lg:hidden z-50">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(
                "relative z-[60] shadow-lg rounded-full backdrop-blur-md transition-all duration-300", 
                isDarkText 
                  ? "text-primary bg-primary/5 hover:bg-primary/15 border border-primary/10" 
                  : "text-white bg-black/20 hover:bg-black/40 border border-white/20"
              )}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                    <Image
                      src="/logo.png"
                      alt="Soulhome Logo"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                    <span className="font-serif text-lg uppercase tracking-[0.2em] text-primary">Soulhome</span>
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t">
                  {isLoggedIn ? (
                    <>
                      {isAdmin && (
                        <Button variant="outline" asChild className="w-full bg-transparent">
                          <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
                        </Button>
                      )}
                      <Button asChild className="w-full bg-primary/5 border border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/40 hover:border-primary transition-all duration-500">
                        <Link href="/dashboard" onClick={() => setOpen(false)}>Kundalini School</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full">
                        <Link href="/auth/login" onClick={() => setOpen(false)}>Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Centered on Mobile using Absolute Positioning, Left on Desktop */}
        <div className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 lg:flex-1 lg:flex lg:justify-start transition-opacity duration-300",
          isTransparent ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Soulhome Logo"
              width={80}
              height={80}
              className={cn(
                "object-contain transition-all h-16 w-16 md:h-20 md:w-20",
              )}
            />
            <span className={cn(
              "font-serif text-lg uppercase tracking-[0.2em] drop-shadow-lg transition-colors hidden lg:block",
              isDarkText ? "text-primary" : "text-white"
            )}>Soulhome</span>
          </Link>
        </div>

        {/* Desktop Navigation & Auth */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-opacity-80 block",
                  isDarkText ? "text-primary hover:text-primary/80" : "text-white hover:text-white/80",
                  pathname === link.href && "underline underline-offset-8"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" asChild className={cn(
                    "hover:bg-white/10 rounded-full",
                    isDarkText ? "text-primary hover:text-primary/80 hover:bg-primary/10" : "text-white hover:text-white/80"
                  )}>
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" asChild className={cn(
                  "rounded-full transition-all duration-500 backdrop-blur-md border shadow-sm px-6",
                  isDarkText 
                    ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/40 hover:border-primary" 
                    : "bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary hover:shadow-lg hover:shadow-white/40 hover:border-white"
                )}>
                  <Link href="/dashboard">Kundalini School</Link>
                </Button>
              </>
            ) : (
              <Button asChild className={cn(
                "rounded-full px-8 shadow-sm transition-all active:scale-95 py-2 h-auto",
                isDarkText ? "bg-primary text-white hover:bg-primary/90" : "bg-white text-primary hover:bg-white/90"
              )}>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>


      </nav>
    </header>
  )
}
