import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import "./globals.css"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { SignUpDialog } from "@/components/auth/sign-up-dialog"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OP_PREDICT | Predict the future. Earn Bitcoin",
  description: "Explore and participate in markets for politics, sports, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <ClerkProvider>
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
                  <span className="text-sm font-medium text-muted-foreground/60 cursor-not-allowed flex items-center">
                    Explore <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>
                  </span>
                  <span className="text-sm font-medium text-muted-foreground/60 cursor-not-allowed flex items-center">
                    Leaderboard <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>
                  </span>
                  <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    How it Works
                  </Link>
                </nav>
                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="w-full border-t bg-background py-6 md:py-12 justify-items-center">
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
      </ClerkProvider>
    </html>
  )
}

