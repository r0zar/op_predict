"use client"

import type React from "react"

import { useState } from "react"
import { TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function SignInDialog() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Handle sign in logic here
      console.log("Sign in with:", email, password)
    }, 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="items-center">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">OP_PREDICT</span>
          </div>
          <DialogTitle className="text-center text-2xl">Welcome back</DialogTitle>
          <DialogDescription className="text-center">Sign in to your account to continue</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me for 30 days
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <DialogTrigger asChild>
              <Button variant="link" className="items-center">
                Sign Up
              </Button>
            </DialogTrigger>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

