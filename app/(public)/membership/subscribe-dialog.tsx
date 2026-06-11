"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2 } from "lucide-react"

interface SubscribeDialogProps {
  planId: string
  buttonText?: string
  className?: string
}

export function SubscribeDialog({ planId, buttonText = "Subscribe Now", className }: SubscribeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showError, setShowError] = useState(false)
  const [checks, setChecks] = useState({
    age: false,
    terms: false,
    privacy: false,
    downloads: false,
    safety: false,
  })

  // All boxes must be checked
  const isReady = checks.age && checks.terms && checks.privacy && checks.downloads && checks.safety

  const handleSubscribe = () => {
    if (!isReady) {
      setShowError(true)
      return
    }
    setIsPending(true)
    // Small delay for UI feedback before redirect
    setTimeout(() => {
      router.push(`/checkout?plan=${planId}`)
    }, 300)
  }

  // Reset state when dialog closes
  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setTimeout(() => {
        setChecks({ 
          age: false, 
          terms: false, 
          privacy: false,
          downloads: false, 
          safety: false 
        })
        setShowError(false)
        setIsPending(false)
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={className}>
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Before you proceed...</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            Please confirm the following to continue to payment:
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="check-age" 
                checked={checks.age} 
                onCheckedChange={(c) => {
                  setChecks(prev => ({ ...prev, age: c as boolean }))
                  if (c) setShowError(false)
                }} 
                className="mt-1"
              />
              <Label htmlFor="check-age" className="text-sm leading-snug cursor-pointer font-normal">
                <span className="font-medium text-foreground">I am 18 or over.</span>{" "}
                <span className="text-muted-foreground">(Star children content must be accessed by a parent or guardian first)</span>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="check-terms" 
                checked={checks.terms} 
                onCheckedChange={(c) => {
                  setChecks(prev => ({ ...prev, terms: c as boolean }))
                  if (c) setShowError(false)
                }} 
                className="mt-1"
              />
              <Label htmlFor="check-terms" className="text-sm leading-snug cursor-pointer font-normal text-foreground">
                I have read and agree to the{" "}
                <a 
                  href="/terms" 
                  target="_blank" 
                  className="font-medium text-primary hover:underline underline-offset-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms & Conditions
                </a>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="check-privacy" 
                checked={checks.privacy} 
                onCheckedChange={(c) => {
                  setChecks(prev => ({ ...prev, privacy: c as boolean }))
                  if (c) setShowError(false)
                }} 
                className="mt-1"
              />
              <Label htmlFor="check-privacy" className="text-sm leading-snug cursor-pointer font-normal text-foreground">
                I have read and agree to the{" "}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="font-medium text-primary hover:underline underline-offset-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="check-downloads" 
                checked={checks.downloads} 
                onCheckedChange={(c) => {
                  setChecks(prev => ({ ...prev, downloads: c as boolean }))
                  if (c) setShowError(false)
                }} 
                className="mt-1"
              />
              <Label htmlFor="check-downloads" className="text-sm leading-snug cursor-pointer font-normal text-foreground">
                <span className="font-medium">I agree to only download 3 healings per month, not binge</span>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="check-safety" 
                checked={checks.safety} 
                onCheckedChange={(c) => {
                  setChecks(prev => ({ ...prev, safety: c as boolean }))
                  if (c) setShowError(false)
                }} 
                className="mt-1"
              />
              <Label htmlFor="check-safety" className="text-sm leading-snug cursor-pointer font-normal text-foreground">
                <span className="font-medium">All practices must be carried out with my own safety precautions in a suitable environment</span>
              </Label>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-primary/5 p-6 text-center italic text-primary">
            <p className="font-serif leading-relaxed">
              {"\""}Don{"'"}t seek results, do what you need to do- to love yourself truly. This is what Krishna teaches us, with the love of his Divine Shakti, Radha.{"\""}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:justify-center">
          {showError && (
            <p className="text-sm text-center font-medium text-destructive animate-in fade-in slide-in-from-top-1">
              Please tick all boxes to confirm you agree before proceeding.
            </p>
          )}
          <Button 
            size="lg" 
            className="w-full" 
            disabled={isPending}
            onClick={handleSubscribe}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Proceeding...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
