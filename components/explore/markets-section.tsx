import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/src/utils"
import { SectionHeader } from "./section-header"
import { MarketCard } from "@/components/market-card"
import { DeleteMarketButton } from "@/components/delete-market-button"

// Market grid for trending/personalized/new markets
export async function MarketsSection({
    title,
    icon,
    markets,
    viewAllHref
}: {
    title: string;
    icon: any;
    markets: any[];
    viewAllHref?: string;
}) {
    const user = await currentUser()
    const isUserAdmin = isAdmin(user?.id || '')

    return (
        <section className="mb-8">
            <SectionHeader
                title={title}
                icon={icon}
                viewAllHref={viewAllHref}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {markets.map((market) => (
                    <div key={market.id} className="relative">
                        {isUserAdmin && (
                            <div className="absolute -top-3 -right-3 z-10">
                                <DeleteMarketButton marketId={market.id} />
                            </div>
                        )}
                        <MarketCard
                            market={{
                                ...market,
                                category: market.category || "General",
                                endDate: market.endDate || new Date().toISOString(),
                                status: market.status || "active"
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
} 