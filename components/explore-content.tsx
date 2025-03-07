import { ShieldAlert, TrendingUp, Star, Zap } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/utils"
import {
  getMarkets,
  getTrendingMarkets
} from "@/app/actions/market-actions"

// Import all section components
import { VaultsSection } from "./explore/vaults-section"
import { FeaturedAndStatsSection } from "./explore/featured-and-stats-section"
import { CategoriesSection } from "./explore/categories-section"
import { MarketsSection } from "./explore/markets-section"

// Main explore content component
export async function ExploreContent() {
  const user = await currentUser()
  const isUserAdmin = isAdmin(user?.id || '')

  // Get markets with our new paginated API
  const marketsResult = await getMarkets({
    status: 'active',
    limit: 20
  })

  // Get trending markets with optimized function
  const trendingMarkets = await getTrendingMarkets(4)

  // Get markets sorted by creation date
  const newestMarketsResult = await getMarkets({
    status: 'active',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    limit: 4
  })

  // For personalized markets, we'll just use a slice of the main markets for now
  // In a real implementation, this would use user preferences or history
  const personalizedMarkets = marketsResult.items.slice(0, 4)

  return (
    <div className="mx-auto px-4">

      {/* Top Vaults Section */}
      {/* <VaultsSection /> */}

      {/* Featured Creators and Platform Stats in New Layout */}
      <FeaturedAndStatsSection />

      {/* Categories */}
      {/* <CategoriesSection /> */}

      {/* Market sections */}
      <MarketsSection
        title="Trending Markets"
        icon={TrendingUp}
        markets={trendingMarkets}
        viewAllHref="/markets?sort=poolAmount&direction=desc"
      />

      <MarketsSection
        title="Personalized For You"
        icon={Star}
        markets={personalizedMarkets}
        viewAllHref="/markets?sort=personalized"
      />

      <MarketsSection
        title="New & Notable"
        icon={Zap}
        markets={newestMarketsResult.items}
        viewAllHref="/markets?sort=createdAt&direction=desc"
      />

      {/* Admin notice */}
      {isUserAdmin && (
        <div className="mt-8 p-4 border border-amber-500/20 bg-amber-500/10 rounded-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-amber-500">Admin Mode Active</h2>
          </div>
          <p className="text-sm text-amber-400/80 mt-1">
            You can delete markets by clicking the trash icon on market cards.
          </p>
        </div>
      )}
    </div>
  )
} 