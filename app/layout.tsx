import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import "./globals.css"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OP_PREDICT | Predict the future. Earn Bitcoin",
  description: "Explore and participate in markets for politics, sports, and more.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: "website",
    title: "OP_PREDICT | Predict the future. Earn Bitcoin",
    description: "Explore and participate in markets for politics, sports, and more.",
    siteName: "OP_PREDICT",
    locale: "en_US",
    images: [{
      url: '/og-lp.png',
      width: 1200,
      height: 630,
      alt: "OP_PREDICT - Prediction Markets Platform",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OP_PREDICT | Predict the future. Earn Bitcoin",
    description: "Explore and participate in markets for politics, sports, and more.",
    images: ['/og-lp.png'],
    creator: "@lordrozar",
  },
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
            <header className="px-4 sticky justify-items-center top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between py-4">
                <div className="items-center gap-2 hidden sm:flex">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <Link href="/" className="text-xl font-bold tracking-tight">
                    OP_PREDICT
                  </Link>
                </div>
                <div className='flex sm:hidden' />
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/markets" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Markets
                  </Link>
                  <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Leaderboard
                  </Link>
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
          <Toaster
            position="top-right"
            theme="light"
            toastOptions={{
              classNames: {
                toast: 'toast',
                title: 'title',
                description: 'description',
                actionButton: 'action-button',
                cancelButton: 'cancel-button',
                closeButton: 'close-button',
                success: 'success-toast',
                error: 'error-toast',
                warning: 'warning-toast',
                info: 'info-toast',
              },
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
            icons={{
              success: (
                <div className="h-16 w-4 rounded-full bg-primary flex items-center justify-center p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="hsl(var(--primary-foreground))"
                    className="h-3 w-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ),
            }}
          />
        </body>
      </ClerkProvider>
    </html>
  )
}

