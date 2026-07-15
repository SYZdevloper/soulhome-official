"use client"

import React, { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Check, ChevronsUpDown, Filter } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Category } from "@/lib/types"

interface ResourceFiltersProps {
  categories: Category[]
  currentType?: string
  currentCategory?: string
  currentSearch?: string
}

// Centered overlay that shows on hover
function CategoryDescriptionOverlay({ name, description }: { name: string; description: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div
        className="animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(139, 92, 246, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          padding: '28px 36px',
          maxWidth: '400px',
          width: 'auto',
          textAlign: 'center',
        }}
      >
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          fontWeight: 700,
          color: 'hsl(var(--primary))',
          marginBottom: '12px',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          {name}
        </p>
        <div style={{
          width: '40px',
          height: '1px',
          background: 'hsl(var(--primary) / 0.3)',
          margin: '0 auto 14px',
        }} />
        <p style={{
          fontSize: '13px',
          lineHeight: '1.75',
          color: 'hsl(var(--foreground) / 0.8)',
          fontWeight: 400,
        }}>
          {description}
        </p>
      </div>
    </div>
  )
}

export function ResourceFilters({
  categories,
  currentType,
  currentCategory,
  currentSearch
}: ResourceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch || "")
  const [openCategory, setOpenCategory] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null)

  function updateFilters(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/dashboard/resources?${params.toString()}`)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateFilters('search', search || null)
  }

  function clearFilters() {
    setSearch("")
    startTransition(() => {
      router.push('/dashboard/resources')
    })
  }

  const hasFilters = currentType || currentCategory || currentSearch

  return (
    <div className="space-y-4">
      {/* Centered description overlay on hover */}
      {hoveredCategory && hoveredCategory.description && (
        <CategoryDescriptionOverlay
          name={hoveredCategory.name}
          description={hoveredCategory.description}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-sm sm:flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={currentType || 'all'}
            onValueChange={(value) => updateFilters('type', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF Guides</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-2">
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-[200px] sm:w-[250px] justify-between font-normal"
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">
                  {currentCategory && currentCategory !== 'all'
                    ? categories.find((c) => c.id === currentCategory)?.name || "All Categories"
                    : "All Categories"}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] sm:w-[250px] p-0 z-[100]" align="start">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      updateFilters('category', 'all')
                      setOpenCategory(false)
                    }}
                    onMouseEnter={() => setHoveredCategory(null)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${(!currentCategory || currentCategory === 'all') ? "opacity-100" : "opacity-0"}`}
                    />
                    All Categories
                  </CommandItem>
                  {categories && categories.length > 0 ? categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      keywords={[category.name]}
                      onSelect={() => {
                        updateFilters('category', category.id)
                        setOpenCategory(false)
                        setHoveredCategory(null)
                      }}
                      onMouseEnter={() => setHoveredCategory(category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${currentCategory === category.id ? "opacity-100" : "opacity-0"}`}
                      />
                      {category.name}
                    </CommandItem>
                  )) : null}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
