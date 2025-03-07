import { getMarkets } from "@/app/actions/market-actions";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/utils";
import MarketsTable from "@/app/components/markets-table";
import { createSampleMarkets } from "@/app/actions/seed-data";
import AdminControls from "@/app/components/admin-controls";

export default async function MarketsPage({
    searchParams
}: {
    searchParams: {
        category?: string;
        search?: string;
        status?: string;
        sort?: string;
        direction?: string;
        limit?: string;
    }
}) {
    // Get current user to check if they're an admin
    const user = await currentUser();
    const isUserAdmin = isAdmin(user?.id || '');

    // Parse the sort field from query params
    const sortBy = searchParams.sort as 'createdAt' | 'endDate' | 'poolAmount' | 'participants' | undefined;
    const sortDirection = searchParams.direction as 'asc' | 'desc' | undefined;
    const limit = parseInt(searchParams.limit || '10', 10);

    // Get initial markets with our new paginated API
    const initialMarkets = await getMarkets({
        category: searchParams.category,
        search: searchParams.search,
        status: (searchParams.status as 'active' | 'resolved' | 'all') || 'active',
        sortBy: sortBy || 'poolAmount',
        sortDirection: sortDirection || 'desc',
        limit: limit
    });

    return (
        <div className="container max-w-7xl py-10">
            {/* Enhanced header with cyber styling */}
            <div className="relative mb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-glow mb-2">Prediction Markets</h1>
                        <p className="text-muted-foreground">
                            Explore market predictions and discover future outcomes
                        </p>
                    </div>

                    <Link href="/create">
                        <Button size="lg" className="items-center relative overflow-hidden group bg-gradient-to-r from-[hsl(var(--space-dark))] to-[hsl(var(--space-void))] border border-[hsl(var(--cyber-blue)/30)]">
                            {/* Add a subtle shimmer effect */}
                            <span className="animate-shimmer absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-[hsl(var(--cyber-blue)/15)] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>

                            <span className="relative z-10 text-glow">Create Market</span>

                            {/* Corner accents for that cyberpunk feel */}
                            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[hsl(var(--cyber-blue))]"></span>
                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[hsl(var(--cyber-blue))]"></span>
                        </Button>
                    </Link>
                </div>

                {/* Decorative elements removed */}
            </div>

            <div className="relative overflow-visible">
                {/* Background decoration - more subtle and within bounds */}
                <div className="absolute top-[5%] right-[5%] w-60 h-60 bg-[hsl(var(--cyber-blue)/1)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
                <div className="absolute bottom-[10%] left-[5%] w-60 h-60 bg-[hsl(var(--neon-purple)/1)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

                {/* Linear gradient background instead of circles */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--space-black))] via-[hsl(var(--space-black))] to-[hsl(var(--space-void))] opacity-20 pointer-events-none"></div>

                <div className="relative">
                    <MarketsTable
                        initialMarkets={initialMarkets}
                        defaultCategory={searchParams.category}
                        defaultSearch={searchParams.search}
                        defaultStatus={(searchParams.status as 'active' | 'resolved' | 'all') || 'active'}
                        defaultSortBy={sortBy || 'poolAmount'}
                        defaultSortDirection={sortDirection || 'desc'}
                    />
                </div>
            </div>

            {initialMarkets.items.length === 0 && !searchParams.search && !searchParams.category && (
                <div className="relative mt-8 py-16 border border-[hsl(var(--cyber-blue)/20)] rounded-lg bg-gradient-to-b from-[hsl(var(--space-dark)/50)] to-[hsl(var(--space-void)/50)] text-center overflow-hidden">
                    {/* Decorative corner accents */}
                    <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[hsl(var(--cyber-blue))]"></span>
                    <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[hsl(var(--cyber-blue))]"></span>

                    {/* Subtle grid background - more subtle */}
                    <div className="absolute inset-0 opacity-2" style={{
                        backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--cyber-blue)/40), hsl(var(--cyber-blue)/40) 1px, transparent 1px, transparent 40px), 
                                        repeating-linear-gradient(90deg, hsl(var(--cyber-blue)/40), hsl(var(--cyber-blue)/40) 1px, transparent 1px, transparent 40px)`
                    }}></div>

                    <h2 className="text-2xl font-display font-bold text-glow mb-2">Prediction Database Empty</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">Initiate the first market prediction and establish the foundation for future forecasts</p>

                    <Link href="/create">
                        <Button size="lg" className="relative overflow-hidden group bg-gradient-to-r from-[hsl(var(--space-dark))] to-[hsl(var(--space-void))] border border-[hsl(var(--neon-green)/40)]">
                            {/* Add a subtle shimmer effect */}
                            <span className="animate-shimmer absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-[hsl(var(--neon-green)/15)] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>

                            <span className="relative z-10 text-[hsl(var(--neon-green))]">Create First Market</span>

                            {/* Corner accents */}
                            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[hsl(var(--neon-green))]"></span>
                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[hsl(var(--neon-green))]"></span>
                        </Button>
                    </Link>
                </div>
            )}

            {/* Admin section */}
            {isUserAdmin && <AdminControls className="mt-12" />}
        </div>
    );
}