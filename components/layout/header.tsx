'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Nav } from './nav'
import { HeaderActions } from './header-actions'
import { AuthButton } from '@/components/auth/auth-button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-gradient">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left: Navigation */}
        <div className="flex flex-1 items-center">
          <Nav />
        </div>

        {/* Center: Logo (absolute centered) */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
        >
          <Image
            src="/images/acorn_white.png"
            alt="Haver Events"
            width={72}
            height={72}
            className="object-contain"
          />
        </Link>

        {/* Right: Header Actions + Mobile menu */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Desktop header actions */}
          <div className="hidden md:flex">
            <HeaderActions />
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10 hover:text-white"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src="/images/acorn_white.png"
                    alt="Haver Events"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span className="text-xl font-bold">
                    Haver<span className="text-red-600">Events</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col space-y-6">
                <Nav mobile onLinkClick={() => setMobileMenuOpen(false)} />
                <div className="pt-4 border-t border-border">
                  <AuthButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
