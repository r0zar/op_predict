'use client'

import { Clock, Users, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SignIn } from '@clerk/nextjs'
import { calculateOutcomePercentages, cn } from "@/lib/utils"
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
  const { isSignedIn, userId } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [showAllOutcomes, setShowAllOutcomes] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const { name, participants, poolAmount, outcomes, category, endDate, type, id: marketId, status } = market

  // Check if user is admin (this would be handled better with a proper auth check)
  const isUserAdmin = userId && typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true'

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
    ? [...outcomesWithPercentages].sort((a, b) => b.percentage - a.percentage)
    : outcomesWithPercentages.sort((a, b) => a.name.toLowerCase() === 'yes' ? -1 : 1)

  // Ensure percentages add up to 100
  const totalPercentage = sortedOutcomes.reduce((sum, outcome) => sum + outcome.percentage, 0)
  const normalizedOutcomes = sortedOutcomes.map(outcome => ({
    ...outcome,
    percentage: totalPercentage === 0 ? outcome.percentage : (outcome.percentage / totalPercentage) * 100
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

  // Calculate color for outcome (with reduced opacity)
  const getOutcomeColor = (index: number, total: number = outcomesWithPercentages.length) => {
    if (type === 'binary') {
      // Based on Signet colors but with reduced opacity
      return index === 0
        ? 'hsl(var(--neon-green))' // Green for Yes
        : 'hsl(var(--neon-red))' // Red for No
    }

    // For multiple choice, create a gradient from Signet colors
    const colors = [
      'hsl(var(--cyber-blue))',   // Cyber Blue
      'hsl(var(--neon-purple))',  // Neon Purple
      'hsl(var(--neon-pink))',    // Neon Pink
      'hsl(var(--neon-orange))',  // Neon Orange
      'hsl(var(--neon-green))'    // Neon Green
    ];

    // Cycle through colors
    return colors[index % colors.length];
  }

  // Determine which outcomes to show
  const visibleOutcomes = type === 'multiple' && !showAllOutcomes
    ? normalizedOutcomes.slice(0, 2)
    : normalizedOutcomes

  return (
    <>
      {showSignInDialog && <SignIn />}
      <Card
        variant="default"
        tilt={false}
        glowHover={true}
        className="theme-market-card"
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        <CardHeader className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-transparent border-border text-muted-foreground">
              {category}
            </Badge>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>Ends {formatEndDate(endDate)}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 text-xl mt-3 mb-1 flex-1 text-foreground">
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow-0 p-4 pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{participants.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-cyber-blue/90">${formattedPoolAmount}</span>
            </div>
          </div>

          {type === 'binary' ? (
            // Binary market layout
            <div className="mt-4 space-y-3">
              {/* Percentage bar with reduced glow */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-space-void">
                <div className="flex h-full">
                  <div
                    className="h-full transition-all duration-200 ease-in-out"
                    style={{
                      width: `${visibleOutcomes[0]?.percentage || 0}%`,
                      backgroundColor: getOutcomeColor(0),
                      boxShadow: `0 0 4px ${getOutcomeColor(0)}70` // Adding 70 for 70% opacity
                    }}
                  />
                  <div
                    className="h-full transition-all duration-200 ease-in-out"
                    style={{
                      width: `${visibleOutcomes[1]?.percentage || 0}%`,
                      backgroundColor: getOutcomeColor(1),
                      boxShadow: `0 0 4px ${getOutcomeColor(1)}70` // Adding 70 for 70% opacity
                    }}
                  />
                </div>
              </div>

              {/* Labels and percentages */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getOutcomeColor(0),
                      boxShadow: `0 0 2px ${getOutcomeColor(0)}60` // Reduced glow
                    }}
                  />
                  <span style={{ color: `${getOutcomeColor(0)}CC` }}> {/* CC for 80% opacity */}
                    {visibleOutcomes[0]?.name} ({(visibleOutcomes[0]?.percentage || 0).toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: `${getOutcomeColor(1)}CC` }}> {/* CC for 80% opacity */}
                    ({(visibleOutcomes[1]?.percentage || 0).toFixed(0)}%) {visibleOutcomes[1]?.name}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getOutcomeColor(1),
                      boxShadow: `0 0 2px ${getOutcomeColor(1)}60` // Reduced glow
                    }}
                  />
                </div>
              </div>

              {/* Action buttons for binary markets */}
              <div className="mt-4 flex items-center gap-2">
                {isUserAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
                      !showDelete && "opacity-0"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // We'd add the delete logic here - the same as in DeleteMarketButton
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}

                {isSignedIn ? (
                  <Button
                    className="w-full"
                    variant="default"
                    size="sm"
                    disabled={disabled || status !== 'active'}
                  >
                    <Link href={`/markets/${marketId}`} className="w-full flex items-center justify-center">
                      View Market
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="default"
                    size="sm"
                    disabled={disabled || status !== 'active'}
                    onClick={handleButtonClick}
                  >
                    Sign in to Predict
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Multiple choice layout
            <div className="mt-4 space-y-3">
              {/* Horizontal stacked bar with reduced glow */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-space-void">
                <div className="flex h-full">
                  {normalizedOutcomes.map((outcome, index) => (
                    <div
                      key={outcome.id || index}
                      className="h-full transition-all duration-200 ease-in-out"
                      style={{
                        width: `${outcome.percentage}%`,
                        backgroundColor: outcome.color || getOutcomeColor(index),
                        boxShadow: `0 0 4px ${outcome.color || getOutcomeColor(index)}70` // 70% opacity
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Outcome list */}
              <div className="space-y-1.5">
                {visibleOutcomes.map((outcome, index) => (
                  <div key={outcome.id || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: outcome.color || getOutcomeColor(index),
                          boxShadow: `0 0 2px ${outcome.color || getOutcomeColor(index)}60` // Reduced glow
                        }}
                      />
                      <span className="text-xs line-clamp-1"
                        style={{ color: `${outcome.color || getOutcomeColor(index)}CC` }}> {/* CC for 80% opacity */}
                        {outcome.name}
                      </span>
                    </div>
                    <span className="text-xs"
                      style={{ color: `${outcome.color || getOutcomeColor(index)}CC` }}>
                      {outcome.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Integrated show more/less button with action button for multiple choice */}
              {type === 'multiple' && normalizedOutcomes.length > 2 ? (
                <div className="flex items-center gap-2 mt-4">
                  {isUserAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
                        !showDelete && "opacity-0"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // We'd add the delete logic here - the same as in DeleteMarketButton
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs items-center"
                    onClick={handleExpandClick}
                  >
                    {showAllOutcomes ? (
                      <><ChevronUp className="h-3 w-3 mr-1" /> Less</>
                    ) : (
                      <><ChevronDown className="h-3 w-3 mr-1" /> More</>
                    )}
                  </Button>

                  {isSignedIn ? (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={disabled || status !== 'active'}
                      className="w-full"
                    >
                      <Link href={`/markets/${marketId}`} className="w-full flex items-center justify-center">
                        View
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={disabled || status !== 'active'}
                      onClick={handleButtonClick}
                      className="w-full"
                    >
                      Predict
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2">
                  {isUserAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
                        !showDelete && "opacity-0"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // We'd add the delete logic here - the same as in DeleteMarketButton
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {isSignedIn ? (
                    <Button
                      className="w-full"
                      variant="default"
                      size="sm"
                      disabled={disabled || status !== 'active'}
                    >
                      <Link href={`/markets/${marketId}`} className="w-full flex items-center justify-center">
                        View Market
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="default"
                      size="sm"
                      disabled={disabled || status !== 'active'}
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
      </Card>
    </>
  )
}