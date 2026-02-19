'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SPORTS_CATEGORIES } from '@/lib/sports-links'
import { cn } from '@/lib/utils'

interface SportsMenuProps {
  mobile?: boolean
  onLinkClick?: () => void
}

export function SportsMenu({ mobile = false, onLinkClick }: SportsMenuProps) {
  if (mobile) {
    return (
      <details className="group rounded-md border border-border/70 px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span>Sports</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 space-y-4">
          {SPORTS_CATEGORIES.map((category) => (
            <div key={category.label}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {category.label}
              </p>
              <ul className="space-y-1">
                {category.sports.map((sport) => (
                  <li key={sport.href}>
                    <a
                      href={sport.href}
                      onClick={onLinkClick}
                      className="text-sm text-foreground/85 transition-colors hover:text-foreground"
                    >
                      {sport.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            'text-white/70 hover:text-white data-[state=open]:text-white [&[data-state=open]>svg]:rotate-180'
          )}
        >
          <span>Sports</span>
          <ChevronDown className="h-4 w-4 transition-transform" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[min(90vw,700px)] p-4"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {SPORTS_CATEGORIES.map((category) => (
            <div key={category.label}>
              <DropdownMenuLabel className="px-2 pb-1 pt-0 text-xs uppercase tracking-wide text-muted-foreground">
                {category.label}
              </DropdownMenuLabel>
              <div className="space-y-1">
                {category.sports.map((sport) => (
                  <DropdownMenuItem key={sport.href} asChild className="cursor-pointer">
                    <a href={sport.href}>{sport.label}</a>
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
