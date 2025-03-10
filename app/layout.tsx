import type React from "react"
import type { Metadata } from "next"
import {
  JetBrains_Mono,
  Inter,
  Source_Code_Pro,
  Syncopate,
  Exo_2,
  Orbitron,
  Fira_Code
} from "next/font/google"
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
import { SignetProvider } from "@/lib/signet-context"
import { ThemeProvider as NextThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "@/lib/hooks/use-theme"
import Image from "next/image"
import crystalBallLogo from "@/public/images/crystal-ball-no-bg.png"

// Base fonts
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Cyberpunk theme fonts
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: '--font-source-code-pro',
  display: 'swap',
  // Enhanced for coding with ligatures and other features
  weight: ['400', '500', '600', '700'],
})

const syncopate = Syncopate({
  subsets: ["latin"],
  variable: '--font-syncopate',
  display: 'swap',
  weight: ['400', '700'],
})

// Protoss theme fonts
const exo2 = Exo_2({
  subsets: ["latin"],
  variable: '--font-exo-2',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: '--font-fira-code',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

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
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider>
        <SignetProvider>
          <body className={`
            ${inter.variable} 
            ${jetbrainsMono.variable} 
            ${sourceCodePro.variable} 
            ${syncopate.variable} 
            ${exo2.variable} 
            ${orbitron.variable} 
            ${firaCode.variable}
          `}>
            <NextThemeProvider
              attribute="data-theme"
              defaultTheme="cyberpunk"
              value={{
                cyberpunk: "cyberpunk",
                protoss: "protoss",
                system: "cyberpunk" // Default to cyberpunk when system theme is chosen
              }}
              enableSystem={false}
              enableColorScheme={false}
              disableTransitionOnChange
            >
              {/* Add our custom theme provider for easy theme access */}
              <ThemeProvider>
                <div className="flex min-h-screen flex-col bg-background">
                  <header className="px-4 sticky justify-items-center top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="scanline"></div>
                    <div className="container flex h-16 items-center justify-between py-4">
                      <div className="items-center gap-1 hidden sm:flex">
                        <Image src={crystalBallLogo} width={48} height={48} alt="OP_PREDICT Logo" className="translate-x-2 -translate-y-1" />
                        <Link href="/" className="text-xl font-bold tracking-tight text-glow font-display">
                          PREDICT
                        </Link>
                      </div>
                      <div className='flex sm:hidden' />
                      <nav className="hidden md:flex items-center gap-6">
                        <Link href="/markets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors capitalize">
                          Markets
                        </Link>
                        <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors capitalize">
                          Leaderboard
                        </Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors capitalize">
                          How it Works
                        </Link>
                      </nav>
                      <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <SignedOut>
                          <SignInButton mode="modal">
                            <button className="cyber-button">
                              Sign In
                            </button>
                          </SignInButton>
                          <SignUpButton mode="modal">
                            <button className="cyber-button">
                              Sign Up
                            </button>
                          </SignUpButton>
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
                        <TrendingUp className="h-5 w-5 text-cyber-blue text-glow" />
                        <span className="text-lg font-bold text-glow font-display">OP_PREDICT</span>
                      </div>
                      <p className="text-center text-xs text-muted-foreground md:text-left max-w-md">
                        TESTNET ONLY: All funds are for testing purposes with no actual USD value.
                      </p>
                      <div className="flex gap-4">
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Terms
                        </Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Privacy
                        </Link>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Contact
                        </Link>
                      </div>
                    </div>
                  </footer>
                </div>
              </ThemeProvider>
            </NextThemeProvider>
          </body>
        </SignetProvider>
      </ClerkProvider>
    </html>
  )
}