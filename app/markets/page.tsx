import { getAllMarkets } from "@/app/actions/market-actions";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteMarketButton } from "@/components/delete-market-button";
import { isAdmin } from "@/lib/src/utils";
import { MarketCard } from "@/components/market-card";

export default async function MarketsPage() {
    // Get current user to check if they're an admin
    const user = await currentUser();
    const isUserAdmin = isAdmin(user?.id || '');

    const markets = await getAllMarkets();

    const activeMarkets = markets.filter((market) => market.status === 'active');

    const sortedMarkets = activeMarkets.sort((a, b) => b.poolAmount! - a.poolAmount!);

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Prediction Markets</h1>
                <Link href="/create">
                    <Button>Create Market</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedMarkets.map((market) => (
                    <div key={market.id} className="relative">
                        {isUserAdmin && (
                            <div className="absolute top-2 right-2 z-10">
                                <DeleteMarketButton marketId={market.id} />
                            </div>
                        )}
                        <MarketCard
                            market={{
                                ...market,
                                category: market.category || 'General', // Provide default category if missing
                                endDate: new Date(market.endDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })
                            } as any}
                        />
                    </div>
                ))}
            </div>

            {markets.length === 0 && (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">No markets found</h2>
                    <p className="text-muted-foreground mb-6">Be the first to create a prediction market!</p>
                    <Link href="/create">
                        <Button size="lg" className='items-center'>Create Market</Button>
                    </Link>
                </div>
            )}

            {/* Admin section indicator */}
            {isUserAdmin && (
                <div className="mt-12 p-4 border rounded-md max-w-2xl mx-auto">
                    <p className="font-medium">Admin mode active</p>
                    <p className="text-sm">You can delete markets by clicking the trash icon in the top right corner of each market card.</p>
                </div>
            )}
        </div>
    );
}