import type { Metadata } from "next"
import { ExploreContent } from "@/components/explore-content"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = {
  title: "Explore | OP_PREDICT",
  description: "Discover personalized prediction markets and trending categories on OP_PREDICT.",
}

export default function ExplorePage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-6">Explore Markets</h1>
        <ExploreContent />
      </div>
    </div>
  )
}

