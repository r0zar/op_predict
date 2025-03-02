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
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Creators - Spans 2 columns on larger screens */}
            {/* <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CircleUser className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Featured Creators</h2>
                    </div>
                    <Link href="/creators" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        View all
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featuredCreators.map((creator) => (
                        <Card key={creator.id} className="border border-border/50 hover:border-primary/30 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex space-x-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-background">
                                        <AvatarImage src={creator.avatar} alt={creator.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary">{creator.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-base truncate">{creator.name}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{creator.bio}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className="bg-background text-xs">
                                                {creator.marketsCreated} Markets
                                            </Badge>
                                            <Badge className="bg-primary/10 text-primary border-primary/10 text-xs">
                                                {creator.successRate}% Success
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div> */}

            {/* Platform Stats - Takes 1 column on larger screens */}
            <div className="h-full">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Platform Stats</h2>
                </div>

                <Card className="border border-border/50 h-[calc(100%-32px)]">
                    <CardContent className="p-6 flex flex-col h-full justify-center space-y-6">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground mb-1">Active Predictions</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-semibold">{formatNumber(stats.activePredictions)}</span>
                                <span className="text-emerald-400 text-sm pb-1">+12% this week</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-muted-foreground mb-1">Total Value Locked</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-semibold">{formatCurrency(stats.totalValueLocked)}</span>
                                <span className="text-emerald-400 text-sm pb-1">+5.2% today</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-muted-foreground mb-1">Resolving Soon</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-semibold">{stats.upcomingResolutions}</span>
                                <span className="text-sm text-muted-foreground pb-1">markets</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
} 