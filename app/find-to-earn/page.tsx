import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AlertCircle, ChevronRight, Clock, Flame, TrendingUp, Trophy } from "lucide-react"

import { FindToEarnGameCard } from "./components/find-to-earn-game-card"
import { FilterControls } from "./components/filter-controls"

// Find-To-Earn game categories
const FTE_CATEGORIES = ["all", "upcoming", "ongoing", "completed"]

// Find-To-Earn game formats
const FTE_FORMATS = ["individual", "team"]

// Mock data for Find-To-Earn games
const MOCK_GAMES = [
  {
    id: "fte-1",
    name: "Skull Island Treasure Hunt",
    description: "Find the hidden treasure on Skull Island before time runs out!",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    status: "ongoing",
    format: "individual",
    participants: 24,
    poolAmount: 5000,
    outcomes: [
      { id: 1, name: "CaptainSparrow", amount: 1200 },
      { id: 2, name: "PirateQueen", amount: 900 },
      { id: 3, name: "BlackBeard", amount: 700 },
      { id: 4, name: "TreasureHunter", amount: 600 },
      { id: 5, name: "GoldDigger", amount: 500 },
      { id: 6, name: "SeaDog", amount: 400 },
      { id: 7, name: "BuccaneerBill", amount: 350 },
      { id: 8, name: "Corsair", amount: 350 }
    ],
    category: "treasure-hunt",
    createdBy: "Skullcoin"
  },
  {
    id: "fte-2",
    name: "Kraken's Lair Competition",
    description: "Teams compete to locate the mythical Kraken's Lair in the Skeleton Sea.",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), // 5 hours from now
    status: "ongoing",
    format: "team",
    participants: 42,
    poolAmount: 7500,
    outcomes: [
      { id: 1, name: "Streamers", amount: 4000 },
      { id: 2, name: "Audience", amount: 3500 }
    ],
    category: "team-challenge",
    createdBy: "Skullcoin"
  },
  {
    id: "fte-3",
    name: "Ghost Ship Discovery",
    description: "Find the legendary ghost ship hiding in the foggy waters.",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
    status: "upcoming",
    format: "individual",
    participants: 18,
    poolAmount: 3200,
    outcomes: [
      { id: 1, name: "PegLeg", amount: 800 },
      { id: 2, name: "SilverHook", amount: 700 },
      { id: 3, name: "MaroonedJack", amount: 500 },
      { id: 4, name: "ShipwreckSally", amount: 400 },
      { id: 5, name: "RumRunner", amount: 300 },
      { id: 6, name: "GunpowderGrace", amount: 300 },
      { id: 7, name: "CutlassCraig", amount: 200 }
    ],
    category: "discovery",
    createdBy: "Skullcoin"
  },
  {
    id: "fte-4",
    name: "Davy Jones' Locker Race",
    description: "Race to the bottom of the ocean to find Davy Jones' locker.",
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    status: "completed",
    format: "team",
    participants: 36,
    poolAmount: 6000,
    outcomes: [
      { id: 1, name: "Streamers", amount: 3500 },
      { id: 2, name: "Audience", amount: 2500 }
    ],
    category: "race",
    createdBy: "Skullcoin",
    resolvedOutcomeId: 2, // Audience won
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
  }
]

// Player statistics
const PLAYER_STATS = [
  { name: "CaptainSparrow", totalGames: 24, wins: 7, winPercentage: 29.2 },
  { name: "PirateQueen", totalGames: 31, wins: 12, winPercentage: 38.7 },
  { name: "BlackBeard", totalGames: 19, wins: 5, winPercentage: 26.3 },
  { name: "TreasureHunter", totalGames: 27, wins: 9, winPercentage: 33.3 },
  { name: "GoldDigger", totalGames: 15, wins: 3, winPercentage: 20.0 },
  { name: "SeaDog", totalGames: 8, wins: 1, winPercentage: 12.5 },
  { name: "PegLeg", totalGames: 11, wins: 2, winPercentage: 18.2 },
  { name: "SilverHook", totalGames: 16, wins: 4, winPercentage: 25.0 }
]

function PlayerStatsTable() {
  return (
    <div className="rounded-md border overflow-hidden">
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Player</th>
              <th className="text-center p-3">Games</th>
              <th className="text-center p-3">Wins</th>
              <th className="text-center p-3">Win %</th>
            </tr>
          </thead>
          <tbody>
            {PLAYER_STATS.map((player, index) => (
              <tr key={player.name} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                <td className="text-left p-3">{player.name}</td>
                <td className="text-center p-3 font-mono">{player.totalGames}</td>
                <td className="text-center p-3 font-mono">{player.wins}</td>
                <td className="text-center p-3 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-primary/20">
                    {player.winPercentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function FindToEarnPage() {
  // In a real implementation, this would fetch data from an API
  const activeGames = MOCK_GAMES.filter(game => game.status === 'ongoing')
  const upcomingGames = MOCK_GAMES.filter(game => game.status === 'upcoming')
  const completedGames = MOCK_GAMES.filter(game => game.status === 'completed')
  
  return (
    <div className="container max-w-7xl py-10">
      {/* Header section */}
      <div className="relative mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Find-To-Earn Predictions
            </h1>
            <p className="text-muted-foreground">
              Predict the winners of Skullcoin's Find-To-Earn treasure hunts and earn rewards
            </p>
          </div>
          <Button>
            Create New Game
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <FilterControls categories={FTE_CATEGORIES} formats={FTE_FORMATS} />
      
      {/* Main Content with Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="active">
            Active Games ({activeGames.length + upcomingGames.length})
          </TabsTrigger>
          <TabsTrigger value="stats">
            Player Stats
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedGames.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {/* Ongoing Games */}
          {activeGames.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ongoing Games</h2>
                <Badge variant="outline" className="font-mono">
                  LIVE NOW
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activeGames.map(game => (
                  <FindToEarnGameCard key={game.id} game={game} />
                ))}
              </div>
            </>
          )}
          
          {/* Upcoming Games */}
          {upcomingGames.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upcoming Games</h2>
                <Badge variant="outline" className="font-mono">
                  STARTING SOON
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingGames.map(game => (
                  <FindToEarnGameCard key={game.id} game={game} />
                ))}
              </div>
            </>
          )}
          
          {activeGames.length === 0 && upcomingGames.length === 0 && (
            <div className="rounded-md border p-8 text-center">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Games</h3>
                <p className="text-muted-foreground mb-4">There are no ongoing or upcoming Find-To-Earn games at the moment.</p>
                <Button>
                  Create New Game
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Player Statistics</h2>
            <Badge variant="outline" className="font-mono">
              TOP PLAYERS
            </Badge>
          </div>
          <PlayerStatsTable />
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Completed Games</h2>
            <Badge variant="outline" className="font-mono">
              PAST EVENTS
            </Badge>
          </div>
          
          {completedGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGames.map(game => (
                <FindToEarnGameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border p-8 text-center">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Games</h3>
                <p className="text-muted-foreground mb-4">There are no completed Find-To-Earn games yet.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}