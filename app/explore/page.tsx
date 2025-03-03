import type { Metadata } from "next"
import { ExploreContent } from "@/components/explore-content"

export const metadata: Metadata = {
  title: "Explore | OP_PREDICT",
  description: "Discover personalized prediction markets and trending categories on OP_PREDICT.",
}

export default function ExplorePage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Explore Markets</h1>
          <p className="text-muted-foreground">
            Discover personalized prediction markets and trending categories.
          </p>
        </div>
        <ExploreContent />
      </div>
    </div>
  )
}

