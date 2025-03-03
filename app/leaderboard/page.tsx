import { LeaderboardTable } from "@/components/leaderboard-table"
import { getCurrentUserStats } from "../actions/leaderboard-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { currentUser } from "@clerk/nextjs/server"
import { Trophy, Medal, UserCircle, Target, BadgePercent } from "lucide-react"

export const metadata = {
  title: "Leaderboard | Charisma Prediction Markets",
  description: "See the top predictors on the Charisma prediction markets platform",
}

export default async function LeaderboardPage() {
  // Get current user stats if logged in
  const user = await currentUser()
  const userStatsResponse = user ? await getCurrentUserStats() : null
  const hasUserStats = userStatsResponse?.success && userStatsResponse?.stats

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-col space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you stack up against the best predictors on the platform.
          </p>
        </div>

        {/* User's Personal Stats Card - only show if logged in and has stats */}
        {user && hasUserStats && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Your Performance
              </CardTitle>
              <CardDescription>
                Your current ranking and prediction statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Rank */}
                <div className="bg-muted/40 rounded-lg p-3 flex flex-col">
                  <span className="text-muted-foreground text-sm">Your Rank</span>
                  <div className="flex items-center mt-1">
                    <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {userStatsResponse.stats?.rank ? `#${userStatsResponse.stats.rank}` : "Unranked"}
                    </span>
                  </div>
                </div>

                {/* Accuracy */}
                <div className="bg-muted/40 rounded-lg p-3 flex flex-col">
                  <span className="text-muted-foreground text-sm">Accuracy</span>
                  <div className="flex items-center mt-1">
                    <Target className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {userStatsResponse?.stats?.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                <div className="bg-muted/40 rounded-lg p-3 flex flex-col">
                  <span className="text-muted-foreground text-sm">Total Earnings</span>
                  <div className="flex items-center mt-1">
                    <Medal className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-2xl font-bold">
                      ${userStatsResponse?.stats?.totalEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Predictions */}
                <div className="bg-muted/40 rounded-lg p-3 flex flex-col">
                  <span className="text-muted-foreground text-sm">Predictions Made</span>
                  <div className="flex items-center mt-1">
                    <BadgePercent className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {userStatsResponse?.stats?.totalPredictions}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Leaderboard Table */}
        <LeaderboardTable />

        {/* Additional info about the leaderboard */}
        <div className="bg-muted/30 border rounded-lg p-4 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground mb-2">About the Leaderboard</h3>
          <p>
            The leaderboard tracks predictors based on their accuracy and earnings.
            Make predictions in markets to appear on the leaderboard. The more accurate
            your predictions, the higher your ranking will be.
          </p>
          <p className="mt-2">
            Rankings are updated when markets resolve and earnings are calculated
            based on the size of your predictions and their accuracy.
          </p>
        </div>
      </div>
    </div>
  )
}

