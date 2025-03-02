import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/utils"
import { SectionHeader } from "./section-header"
import { MarketCard } from "./market-card"

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
    const isUserAdmin = isAdmin(user?.id)

    return (
        <section className="mb-8">
            <SectionHeader
                title={title}
                icon={icon}
                viewAllHref={viewAllHref}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {markets.map((market) => (
                    <Link href={`/markets/${market.id}`} key={market.id}>
                        <MarketCard market={market} isUserAdmin={isUserAdmin} />
                    </Link>
                ))}
            </div>
        </section>
    )
} 