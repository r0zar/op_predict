"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
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

export function SignUpDialog() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Handle sign up logic here
      console.log("Sign up with:", email, username, password)
    }, 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="items-center">Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">OP_PREDICT</span>
          </div>
          <DialogTitle className="text-center text-2xl">Create an account</DialogTitle>
          <DialogDescription className="text-center">
            Join OP_PREDICT to start predicting and earning rewards
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignUp} className="space-y-4 pt-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-sm font-normal">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms || password !== confirmPassword}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                Sign In
              </Button>
            </DialogTrigger>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

