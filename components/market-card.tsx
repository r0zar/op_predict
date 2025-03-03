'use client'

import { Clock, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SignIn } from '@clerk/nextjs'
import { calculateOutcomePercentages } from "@/lib/src/utils"
import Link from "next/link"

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
    type: 'binary' | 'multiple'
  }
  disabled?: boolean
}

export function MarketCard({ market, disabled = false }: MarketCardProps) {
  const { isSignedIn } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [showAllOutcomes, setShowAllOutcomes] = useState(false)
  const { name, participants, poolAmount, outcomes, category, endDate, type } = market

  // Format the end date
  const formatEndDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate outcome percentages using the utility function
  const { outcomesWithPercentages } = calculateOutcomePercentages(outcomes || [])

  // Sort outcomes by percentage for multiple choice
  const sortedOutcomes = type === 'multiple'
    ? [...outcomesWithPercentages]
      .sort((a, b) => b.percentage - a.percentage)
    : outcomesWithPercentages.sort((a, b) =>
      // For binary, always show Yes first
      a.name.toLowerCase() === 'yes' ? -1 : 1
    )

  // Ensure percentages add up to 100
  const totalPercentage = sortedOutcomes.reduce((sum, outcome) => sum + outcome.percentage, 0)
  const normalizedOutcomes = sortedOutcomes.map(outcome => ({
    ...outcome,
    percentage: totalPercentage === 0
      ? outcome.percentage
      : (outcome.percentage / totalPercentage) * 100
  }))

  // Format pool amount as currency
  const formattedPoolAmount = typeof poolAmount === 'number'
    ? `$${poolAmount.toLocaleString()}`
    : `$${String(poolAmount)}`

  // Handle prediction attempt when not signed in
  const handlePredictionClick = () => {
    if (!isSignedIn) {
      setShowSignInDialog(true)
    }
  }

  // Handle click events
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowAllOutcomes(!showAllOutcomes)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handlePredictionClick()
  }

  // Calculate color for outcome
  const getOutcomeColor = (index: number, total: number = outcomesWithPercentages.length) => {
    if (type === 'binary') {
      // Rich, darker shades that complement dark theme
      return index === 0
        ? 'hsl(150, 80%, 25%)' // Deep green
        : 'hsl(350, 80%, 30%)' // Deep red
    }

    // For multiple choice, create a gradient from gold to blue through green
    const goldHue = 30    // Theme gold
    const greenHue = 142  // Mid green
    const blueHue = 222   // Theme blue

    // Calculate progress through the gradient (0 to 1)
    const progress = index / (total - 1)

    // First half transitions from gold to green
    // Second half transitions from green to blue
    const hue = progress < 0.5
      ? goldHue + (greenHue - goldHue) * (progress * 2)
      : greenHue + (blueHue - greenHue) * ((progress - 0.5) * 2)

    // Keep saturation high for vibrant colors but adjust lightness for contrast
    return `hsl(${Math.round(hue)}, 80%, ${Math.max(25, 45 - index * 3)}%)`
  }

  // Calculate text color based on background lightness
  const getTextColor = (index: number) => {
    if (type === 'binary') {
      return 'text-white'
    }

    // For multiple choice, always use white text for better contrast
    return 'text-white'
  }

  // Determine which outcomes to show
  const visibleOutcomes = type === 'multiple' && !showAllOutcomes
    ? normalizedOutcomes.slice(0, 2)
    : normalizedOutcomes

  return (
    <>
      {showSignInDialog && <SignIn />}
      <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col">
        <CardHeader className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-secondary/10  bg-secondary-gradient">
              {category}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Deadline: {formatEndDate(endDate)}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 text-xl mt-4 flex-1">{name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow-0 p-4 pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.toLocaleString()} participants</span>
            <span className="text-primary font-medium">{formattedPoolAmount} pool</span>
          </div>

          {type === 'binary' ? (
            // Binary market layout
            <div className="mt-4 space-y-2">
              {/* Percentage bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="flex h-full">
                  <div
                    className="h-full transition-all duration-200 ease-in-out"
                    style={{
                      width: `${visibleOutcomes[0]?.percentage || 0}%`,
                      backgroundColor: getOutcomeColor(0)
                    }}
                  />
                  <div
                    className="h-full transition-all duration-200 ease-in-out"
                    style={{
                      width: `${visibleOutcomes[1]?.percentage || 0}%`,
                      backgroundColor: getOutcomeColor(1)
                    }}
                  />
                </div>
              </div>

              {/* Labels and percentages */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getOutcomeColor(0) }}
                  />
                  <span className="font-medium" style={{ color: getOutcomeColor(0) }}>
                    {visibleOutcomes[0]?.name} ({(visibleOutcomes[0]?.percentage || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: getOutcomeColor(1) }}>
                    ({(visibleOutcomes[1]?.percentage || 0).toFixed(1)}%) {visibleOutcomes[1]?.name}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getOutcomeColor(1) }}
                  />
                </div>
              </div>

              {/* Action button for binary markets */}
              <div className="mt-2">
                {isSignedIn ? (
                  <Button
                    className="w-full items-center"
                    variant="ghost"
                    size="sm"
                    disabled={disabled || market.status !== 'active'}
                  >
                    <Link href={`/markets/${market.id}`} className="w-full">
                      View Market
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full items-center"
                    variant="outline"
                    size="sm"
                    disabled={disabled || market.status !== 'active'}
                    onClick={handleButtonClick}
                  >
                    Sign in to Predict
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Multiple choice layout
            <div className="mt-4 space-y-2">
              {/* Horizontal stacked bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="flex h-full">
                  {normalizedOutcomes.map((outcome, index) => (
                    <div
                      key={outcome.id || index}
                      className="h-full transition-all duration-200 ease-in-out"
                      style={{
                        width: `${outcome.percentage}%`,
                        backgroundColor: outcome.color || getOutcomeColor(index)
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Outcome list */}
              <div className="space-y-1.5">
                {visibleOutcomes.map((outcome, index) => (
                  <div key={outcome.id || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: outcome.color || getOutcomeColor(index) }}
                      />
                      <span className="text-sm line-clamp-1">{outcome.name}</span>
                    </div>
                    <span className="text-sm font-medium">{outcome.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              {/* Integrated show more/less button with action button for multiple choice */}
              {type === 'multiple' && normalizedOutcomes.length > 2 ? (
                <div className="flex gap-2 items-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs items-center w-full"
                    onClick={handleExpandClick}
                  >
                    {showAllOutcomes ? (
                      <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</>
                    ) : (
                      <><ChevronDown className="h-3 w-3 mr-1" /> {normalizedOutcomes.length - 2} More</>
                    )}
                  </Button>

                  {isSignedIn ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={disabled || market.status !== 'active'}
                      className="w-full items-center"
                    >
                      <Link href={`/markets/${market.id}`}>
                        View Market
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={disabled || market.status !== 'active'}
                      onClick={handleButtonClick}
                      className="flex-shrink-0 items-center"
                    >
                      Predict
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  {isSignedIn ? (
                    <Button
                      className="w-full items-center"
                      variant="ghost"
                      size="sm"
                      disabled={disabled || market.status !== 'active'}
                    >
                      <Link href={`/markets/${market.id}`} className="w-full">
                        View Market
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full items-center"
                      variant="outline"
                      size="sm"
                      disabled={disabled || market.status !== 'active'}
                      onClick={handleButtonClick}
                    >
                      Sign in to Predict
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="hidden">
          {/* Moved to integrated UI above */}
        </CardFooter>
      </Card>
    </>
  )
}
