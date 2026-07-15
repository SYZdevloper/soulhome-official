import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
        Link Expired or Invalid
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        This login link is no longer valid. Magic links can only be used once and expire after a short time for your security.
      </p>
      
      <Link href="/auth/login">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Go to Login Page
        </Button>
      </Link>
    </div>
  )
}
