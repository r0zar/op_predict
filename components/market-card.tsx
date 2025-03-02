"use client"

import Link from "next/link"
import { Clock, Users, DollarSign } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SignIn } from '@clerk/nextjs'
import { calculateOutcomePercentages } from "@/lib/utils"

interface MarketCardProps {
  market: {
    id: string
    name: string
    participants: number
    poolAmount: number
    outcomes: Array<{
      id: string
      name: string
      votes?: number
      amount?: number
      color?: string
    }>
    category: string
    endDate: string
    status: string
  }
  disabled?: boolean
}

export function MarketCard({ market, disabled }: MarketCardProps) {
  const { isSignedIn } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)

  const { name, participants, poolAmount, outcomes, category, endDate, id } = market

  // Calculate outcome percentages using the utility function
  const { outcomesWithPercentages } = calculateOutcomePercentages(outcomes || [])

  // Format pool amount as currency
  const formattedPoolAmount = typeof poolAmount === 'number'
    ? `$${poolAmount.toLocaleString()}`
    : poolAmount

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
          <CardTitle className="line-clamp-2 text-lg">{name}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.toLocaleString()} participants</span>
            <span className="text-primary font-medium">{formattedPoolAmount} pool</span>
          </div>
          <div className="mt-4 flex justify-items-center justify-between">
            {outcomesWithPercentages.map((outcome, index) => (
              <div key={outcome.id || index}>
                <div className="text-sm font-medium">{outcome.name}</div>
                <div className={`text-xl font-bold ${outcome.color ||
                  (index === 0 ? "text-primary" :
                    index === 1 ? "text-destructive" : "text-primary")}`}>
                  {outcome.percentage}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="flex h-full">
              {outcomesWithPercentages.map((outcome, index) => (
                <div
                  key={outcome.id || index}
                  className="h-full"
                  style={{
                    width: `${outcome.percentage}%`,
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
              {outcomesWithPercentages.slice(0, 2).map((outcome, index) => (
                <Button
                  key={outcome.id || index}
                  className="w-full"
                  variant={index === 0 ? "default" : index === 1 ? "outline" : "secondary"}
                  disabled={disabled || market.status !== 'active'}
                  onClick={handlePredictionClick}
                >
                  {outcome.name}
                </Button>
              ))}
            </div>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              disabled={disabled || market.status !== 'active'}
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

