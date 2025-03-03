"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  TrendingUp,
  Users,
  HelpCircle,
  PlusCircle,
  Wallet,
  Settings,
  BarChart,
  Bug,
  X
} from "lucide-react"
import { cn } from "@/lib/src/utils"

interface SidebarProps {
  className?: string
}

export function AppSidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navigationItems = [
    { href: "/", icon: Home, text: "Home" },
    { href: "/markets", icon: BarChart, text: "Markets" },
    { href: "/explore", icon: TrendingUp, text: "Explore" },
    { href: "/leaderboard", icon: Users, text: "Leaderboard" },
    { href: "/how-it-works", icon: HelpCircle, text: "How It Works" },
  ]

  const accountItems = [
    { href: "/create", icon: PlusCircle, text: "Create Market" },
    { href: "/portfolio", icon: Wallet, text: "Portfolio" },
    { href: "/bug-reports", icon: Bug, text: "Bug Reports" },
    { href: "/settings", icon: Settings, text: "Settings" },
  ]

  const SidebarContent = () => (
    <ScrollArea className="h-full py-4">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                text={item.text}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Your Account
          </h2>
          <div className="space-y-1">
            {accountItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                text={item.text}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-3 z-40 items-center"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block border-r", className)}>
        <div className="h-screen w-64">
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}

interface NavItemProps {
  href: string
  icon: any
  text: string
  isActive?: boolean
}

function NavItem({ href, icon: Icon, text, isActive }: NavItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      asChild
      className="w-full justify-start"
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        <span>{text}</span>
      </Link>
    </Button>
  )
}

