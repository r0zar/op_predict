import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import "./globals.css"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { SignUpDialog } from "@/components/auth/sign-up-dialog"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OP_PREDICT | Decentralized Predictions Market",
  description: "Predict the future. Win real rewards. OP_PREDICT is a decentralized predictions market platform.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky justify-items-center top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <Link href="/" className="text-xl font-bold tracking-tight">
                  OP_PREDICT
                </Link>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/explore" className="text-sm font-medium text-foreground">
                  Explore
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Leaderboard
                </Link>
                <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  How it Works
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <SignInDialog />
                <SignUpDialog />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="w-full border-t bg-background py-6 md:py-12">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">OP_PREDICT</span>
              </div>
              <p className="text-center text-sm text-muted-foreground md:text-left">
                © 2025 OP_PREDICT. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

