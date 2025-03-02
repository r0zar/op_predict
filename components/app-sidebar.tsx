"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  Users,
  HelpCircle,
  PlusCircle,
  Wallet,
  Settings,
  BarChart,
  Bug
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className={`relative bg-card border-r transition-all duration-300 ${isExpanded ? "w-64" : "w-16"}`}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("absolute -right-5 top-2 z-10 items-center bg-transparent border-primary/10 hover:border-primary/50 hover:bg-primary/20 transition-all duration-300", isExpanded && "bg-primary/5 border-primary/5", !isExpanded && "text-transparent")}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      <ScrollArea className="h-screen py-4">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <SidebarItem href="/" icon={Home} text="Home" isExpanded={isExpanded} />
              <SidebarItem href="/markets" icon={BarChart} text="Markets" isExpanded={isExpanded} />
              <SidebarItem href="/explore" icon={TrendingUp} text="Explore" isExpanded={isExpanded} />
              <SidebarItem href="/leaderboard" icon={Users} text="Leaderboard" isExpanded={isExpanded} />
              <SidebarItem href="/how-it-works" icon={HelpCircle} text="How It Works" isExpanded={isExpanded} />
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className={`mb-2 px-4 text-lg font-semibold tracking-tight ${isExpanded ? "" : "hidden"}`}>
              Your Account
            </h2>
            <div className="space-y-1">
              <SidebarItem href="/create" icon={PlusCircle} text="Create Market" isExpanded={isExpanded} />
              <SidebarItem href="/portfolio" icon={Wallet} text="Portfolio" isExpanded={isExpanded} />
              <SidebarItem href="/bug-reports" icon={Bug} text="Bug Reports" isExpanded={isExpanded} />
              <SidebarItem href="/settings" icon={Settings} text="Settings" isExpanded={isExpanded} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function SidebarItem({ href, icon: Icon, text, isExpanded }: any) {
  return (
    <Button variant="ghost" asChild className="w-full justify-start">
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        <span className={isExpanded ? "" : "hidden"}>{text}</span>
      </Link>
    </Button>
  )
}

