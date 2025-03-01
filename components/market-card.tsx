"use client"

import Link from "next/link"
import { Clock, Users } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SignIn
} from '@clerk/nextjs'

interface MarketCardProps {
  title: string
  participants: number
  poolAmount: string
  options: Array<{
    name: string,
    percentage: number,
    color?: string
  }>
  category: string
  endDate: string
  disabled?: boolean
}

export function MarketCard({ title, participants, poolAmount, options, category, endDate, disabled }: MarketCardProps) {
  const { isSignedIn } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)

  // Default to Yes/No if no options provided
  const marketOptions = options.length ? options : [
    { name: "Yes", percentage: 60, color: "text-primary" },
    { name: "No", percentage: 40, color: "text-destructive" }
  ]

  // Handle prediction attempt when not signed in
  const handlePredictionClick = () => {
    if (!isSignedIn) {
      setShowSignInDialog(true)
    }
    // If signed in, this would handle the prediction logic
  }

  return (
    <>
      {/* Sign In Dialog */}
      {showSignInDialog && (
        <SignIn />
      )}
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-items-center justify-between">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {category}
            </Badge>
            <div className="flex justify-items-center text-sm text-muted-foreground items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>Ends: {endDate}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.toLocaleString()} participants</span>
            <span className="text-primary font-medium">{poolAmount} pool</span>
          </div>
          <div className="mt-4 flex justify-items-center justify-between">
            {marketOptions.map((option, index) => (
              <div key={index}>
                <div className="text-sm font-medium">{option.name}</div>
                <div className={`text-xl font-bold ${option.color || "text-primary"}`}>
                  {option.percentage}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="flex h-full">
              {marketOptions.map((option, index) => (
                <div
                  key={index}
                  className="h-full"
                  style={{
                    width: `${option.percentage}%`,
                    backgroundColor: index === 0 ? "var(--primary)" :
                      index === 1 ? "var(--destructive)" :
                        `hsl(${index * 60}, 70%, 50%)`
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {isSignedIn ? (
            <div className="w-full grid grid-cols-2 gap-2">
              {marketOptions.map((option, index) => (
                <Button
                  key={index}
                  className="w-full"
                  variant={index === 0 ? "default" : index === 1 ? "outline" : "secondary"}
                  disabled={disabled}
                  onClick={handlePredictionClick}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              disabled={disabled}
              onClick={() => setShowSignInDialog(true)}
            >
              Sign in to Predict
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  )
}

