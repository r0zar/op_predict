"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
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
  X,
  Map,
  MapPinned
} from "lucide-react"
import { cn } from "@/lib/utils"

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

  const categories = [
    { href: "/find-to-earn", icon: MapPinned, text: "Find-to-Earn" },
  ]

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

  // Shared sidebar content to maintain consistency between mobile and desktop
  const SidebarContent = () => (
    <ScrollArea className="h-full py-4">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm font-medium tracking-tight text-muted-foreground uppercase">
            Navigation
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                text={item.text}
                isActive={pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/")}
              />
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm font-medium tracking-tight text-muted-foreground uppercase">
            Categories
          </h2>
          <div className="space-y-1">
            {categories.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                text={item.text}
                isActive={pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/")}
              />
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm font-medium tracking-tight text-muted-foreground uppercase">
            Your Account
          </h2>
          <div className="space-y-1">
            {accountItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                text={item.text}
                isActive={pathname.startsWith(item.href)}
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
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[320px] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative overflow-hidden"
        >
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <X className="h-4 w-4" />
            <span className="sr-only">Close navigation menu</span>
          </SheetClose>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/15 to-transparent bg-[length:200%_100%] animate-nav-shimmer"></div>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn("hidden md:block", className)}
        aria-label="Main navigation"
      >
        <div className="h-full min-h-screen w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/15 to-transparent bg-[length:200%_100%] animate-nav-shimmer"></div>
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  text: string
  isActive?: boolean
}

function NavItem({ href, icon: Icon, text, isActive }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start transition-transform duration-medium",
        "hover:bg-cyber-blue/5",
        "focus-visible:bg-cyber-blue/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-blue/30",
        isActive && "bg-cyber-blue/5 border-l border-cyber-blue/50 font-medium"
      )}
    >
      <Link href={href}>
        <span className="flex items-center w-full">
          <Icon className={cn(
            "mr-2 h-4 w-4 transition-colors duration-medium",
            isActive ? "text-cyber-blue/80" : "text-muted-foreground"
          )} />
          <span className={cn("transition-colors duration-medium")}>
            {text}
          </span>
        </span>
      </Link>
    </Button>
  )
}