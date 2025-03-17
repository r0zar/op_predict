"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight, Flame, TrendingUp, Trophy } from "lucide-react"

// Static components can be defined outside the main component
function GameStatBadge({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-md border">
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-xs font-mono font-bold">{value}</span>
    </div>
  )
}

function PlayerOutcomeBar({ name, amount, total }: { name: string, amount: number, total: number }) {
  const percentage = Math.round((amount / total) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{name}</span>
        <span className="font-mono">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-in-out bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function TeamOutcomeBar({ name, amount, total }: { name: string, amount: number, total: number }) {
  const percentage = Math.round((amount / total) * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{amount.toLocaleString()} points</span>
          <Badge className="font-mono">{percentage}%</Badge>
        </div>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-in-out bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function PoolSizeDisplay({ amount }: { amount: number }) {
  const formattedAmount = amount.toLocaleString()

  return (
    <div className="flex items-center gap-2 bg-primary-foreground p-2 rounded-md border-2 border-primary">
      <Trophy className="h-5 w-5 text-primary" />
      <div>
        <div className="text-sm font-semibold text-muted-foreground">Prize Pool</div>
        <div className="text-xl font-bold font-mono">{formattedAmount} <span className="text-sm text-muted-foreground">points</span></div>
      </div>
    </div>
  )
}

// Client component with real-time countdown
function LiveCountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false
  })

  useEffect(() => {
    function calculateTimeLeft() {
      const endDateTime = new Date(endDate).getTime()
      const now = new Date().getTime()
      const difference = endDateTime - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isEnded: false
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.isEnded) {
    return <span className="text-muted-foreground">Ended</span>
  }

  let urgencyLevel = 'normal'
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 30) {
    urgencyLevel = 'imminent'
  } else if (timeLeft.days === 0 && timeLeft.hours < 3) {
    urgencyLevel = 'urgent'
  } else if (timeLeft.days === 0 && timeLeft.hours < 12) {
    urgencyLevel = 'soon'
  }

  return (
    <div className="flex items-center gap-1.5">
      <Clock className={`h-4 w-4 ${urgencyLevel === 'imminent' ? 'text-destructive' : urgencyLevel === 'urgent' ? 'text-secondary' : 'text-primary'}`} />
      <span className={`font-mono transition-colors duration-300 ${urgencyLevel === 'imminent' && "animate-pulse text-destructive font-bold"} ${urgencyLevel === 'urgent' && "text-secondary font-semibold"}`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

// Game structure type definition
interface Outcome {
  id: number
  name: string
  amount: number
}

interface GameProps {
  id: string
  name: string
  description: string
  endDate: string
  status: "ongoing" | "upcoming" | "completed" | string
  format: string
  participants: number
  poolAmount: number
  outcomes: Outcome[]
  category: string
  createdBy: string
  resolvedOutcomeId?: number
  resolvedAt?: string
}

export function FindToEarnGameCard({ game }: { game: GameProps }) {
  const totalAmount = game.outcomes.reduce((sum, outcome) => sum + outcome.amount, 0)
  const isTeamFormat = game.format === 'team'
  const isCompleted = game.status === 'completed'

  return (
    <Card className="h-full relative overflow-hidden">
      {/* Status badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge
          variant={game.status === 'upcoming' ? "outline" : "default"}
          className={
            game.status === 'ongoing' ? "bg-primary" :
              game.status === 'upcoming' ? "border-secondary text-secondary" :
                "bg-muted text-muted-foreground"
          }
        >
          {game.status === 'ongoing' && <Flame className="mr-1 h-3 w-3" />}
          {game.status === 'upcoming' && <TrendingUp className="mr-1 h-3 w-3" />}
          {game.status}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{game.name}</CardTitle>
            <CardDescription className="line-clamp-1">{game.description}</CardDescription>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex flex-wrap gap-2">
            <GameStatBadge label="FORMAT" value={game.format} />
            <GameStatBadge label="PLAYERS" value={game.participants} />
          </div>
          <div>
            <LiveCountdownTimer endDate={game.endDate} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <PoolSizeDisplay amount={game.poolAmount} />
        </div>

        {isTeamFormat ? (
          <div className="space-y-4">
            {game.outcomes.map(outcome => (
              <TeamOutcomeBar
                key={outcome.id}
                name={outcome.name}
                amount={outcome.amount}
                total={totalAmount}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {game.outcomes.slice(0, 5).map(outcome => (
              <PlayerOutcomeBar
                key={outcome.id}
                name={outcome.name}
                amount={outcome.amount}
                total={totalAmount}
              />
            ))}
            {game.outcomes.length > 5 && (
              <div className="text-xs text-center text-muted-foreground mt-1">
                +{game.outcomes.length - 5} more players
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t mt-2">
        {isCompleted && game.resolvedOutcomeId ? (
          <div className="w-full">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Winner
                </Badge>
                <span className="font-semibold">
                  {game.outcomes.find(o => o.id === game.resolvedOutcomeId)?.name}
                </span>
              </div>
              <Button variant="ghost" asChild>
                <Link href={`/market/${game.id}`}>
                  View Results <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button className="flex-1 sm:flex-none">
              Place Prediction
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/market/${game.id}`}>
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}