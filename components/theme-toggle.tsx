"use client"

import * as React from "react"
import { Zap, Cpu, Bitcoin, Terminal, Code, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Make sure we only render after mount to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="items-center">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative overflow-hidden items-center">
          {/* Cyberpunk icon */}
          {theme === "cyberpunk" && (
            <Zap className="h-[1.2rem] w-[1.2rem] text-cyber-blue" />
          )}

          {/* Protoss icon */}
          {theme === "protoss" && (
            <Cpu className="h-[1.2rem] w-[1.2rem] text-[hsl(var(--psi-gold))]" />
          )}

          {/* Matrix icon */}
          {theme === "matrix" && (
            <Terminal className="h-[1.2rem] w-[1.2rem] text-[hsl(var(--matrix-green))]" />
          )}

          {/* Bitcoin icon */}
          {theme === "bitcoin" && (
            <Bitcoin className="h-[1.2rem] w-[1.2rem] text-[hsl(var(--btc-orange))]" />
          )}

          {/* System or fallback icon */}
          {theme !== "cyberpunk" && theme !== "protoss" && theme !== "matrix" && theme !== "bitcoin" && (
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
          )}

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("bitcoin")} className="cursor-pointer">
          <Bitcoin className="mr-2 h-4 w-4 text-[hsl(28,100%,54%)]" />
          <span>Bitcoin</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("cyberpunk")} className="cursor-pointer">
          <Zap className="mr-2 h-4 w-4 text-[hsl(var(--cyber-blue))]" />
          <span>Cyberpunk</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("matrix")} className="cursor-pointer">
          <Code className="mr-2 h-4 w-4 text-[hsl(120,100%,45%)]" />
          <span>Matrix</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("protoss")} className="cursor-pointer">
          <Cpu className="mr-2 h-4 w-4 text-[hsl(var(--psi-gold))]" />
          <span>Protoss Nexus</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}