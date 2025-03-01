import type { Metadata } from "next"
import { LeaderboardTable } from "@/components/leaderboard-table"

export const metadata: Metadata = {
  title: "Leaderboard | OP_PREDICT",
  description: "Top predictors on the OP_PREDICT platform",
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Leaderboard</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Top predictors on OP_PREDICT based on their prediction accuracy and earnings.
      </p>
      <LeaderboardTable />
    </div>
  )
}

