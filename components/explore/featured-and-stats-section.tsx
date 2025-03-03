import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, CircleUser, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getFeaturedCreators, getPlatformStats } from "@/app/actions/explore-actions"

// Featured creators and Platform stats in a responsive layout
export async function FeaturedAndStatsSection() {
    const featuredCreators = await getFeaturedCreators()
    const stats = await getPlatformStats()

    // Format numbers for display
    const formatNumber = (num: number) => {
        return num.toLocaleString()
    }

    const formatCurrency = (num: number) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
        return `$${num}`
    }

    return (
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-5 gap-6">

            <div className="flex flex-col bg-muted/40 rounded-lg p-4">
                <span className="text-muted-foreground mb-1">Active Predictions</span>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold">{formatNumber(stats.activePredictions)}</span>
                    <span className="text-emerald-400 text-sm pb-1">+12% this week</span>
                </div>
            </div>

            <div className="flex flex-col bg-muted/40 rounded-lg p-4">
                <span className="text-muted-foreground mb-1">Total Value Locked</span>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold">{formatCurrency(stats.totalValueLocked)}</span>
                    <span className="text-emerald-400 text-sm pb-1">+5.2% today</span>
                </div>
            </div>

            <div className="flex flex-col bg-muted/40 rounded-lg p-4">
                <span className="text-muted-foreground mb-1">Resolving Soon</span>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold">{stats.upcomingResolutions}</span>
                    <span className="text-sm text-muted-foreground pb-1">markets</span>
                </div>
            </div>
        </section>
    )
} 