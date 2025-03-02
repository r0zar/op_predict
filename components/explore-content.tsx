import { ShieldAlert, TrendingUp, Star, Zap } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/utils"
import { getAllMarkets } from "@/app/actions/market-actions"

// Import all section components
import { VaultsSection } from "./explore/vaults-section"
import { FeaturedAndStatsSection } from "./explore/featured-and-stats-section"
import { CategoriesSection } from "./explore/categories-section"
import { MarketsSection } from "./explore/markets-section"

// Main explore content component
export async function ExploreContent() {
  const user = await currentUser()
  const isUserAdmin = isAdmin(user?.id)
  const markets = await getAllMarkets()

  // Filter functions for different sections
  const getTrendingMarkets = (markets: any[]) =>
    [...markets].sort((a, b) => (b.participants || 0) - (a.participants || 0)).slice(0, 3)

  const getPersonalizedMarkets = (markets: any[]) =>
    markets.slice(0, 3)

  const getNewestMarkets = (markets: any[]) =>
    [...markets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3)

  return (
    <div className="max-w-screen-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Explore Markets</h1>

      {/* Top Vaults Section */}
      <VaultsSection />

      {/* Featured Creators and Platform Stats in New Layout */}
      <FeaturedAndStatsSection />

      {/* Categories */}
      <CategoriesSection />

      {/* Market sections */}
      <MarketsSection
        title="Trending Markets"
        icon={TrendingUp}
        markets={getTrendingMarkets(markets)}
        viewAllHref="/markets?sort=trending"
      />

      <MarketsSection
        title="Personalized For You"
        icon={Star}
        markets={getPersonalizedMarkets(markets)}
        viewAllHref="/markets?sort=personalized"
      />

      <MarketsSection
        title="New & Notable"
        icon={Zap}
        markets={getNewestMarkets(markets)}
        viewAllHref="/markets?sort=newest"
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