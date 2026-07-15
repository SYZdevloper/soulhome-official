"use client"

import { Button } from "@/components/ui/button"

interface PurchaseActionProps {
  calendlyUrl: string
  slug: string
  price?: number | null
}

export function PurchaseAction({ calendlyUrl, slug, price }: PurchaseActionProps) {
  return (
    <Button className="w-full" asChild>
      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
        {price ? `Purchase for $${price}` : "Purchase Now"}
      </a>
    </Button>
  )
}
