import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, DollarSign } from "lucide-react"
import { DeleteMarketButton } from "@/components/delete-market-button"
import { calculateOutcomePercentages } from "@/lib/src/utils"

// Market card component with progress bar for leading outcome
export function MarketCard({ market, isUserAdmin }: { market: any; isUserAdmin: boolean }) {
    const { id, name, type, outcomes, participants, poolAmount, createdAt } = market

    // Calculate outcome percentages using the utility function
    const { outcomesWithPercentages, useFallbackVotes } = calculateOutcomePercentages(outcomes || []);

    // Find the leading outcome based on amount or votes
    const leadingOutcome = outcomesWithPercentages && outcomesWithPercentages.length > 0
        ? [...outcomesWithPercentages].sort((a, b) =>
            useFallbackVotes
                ? (b.votes || 0) - (a.votes || 0)
                : (b.amount || 0) - (a.amount || 0)
        )[0]
        : null;

    const percentage = leadingOutcome ? leadingOutcome.percentage : 0;

    // Derive category from name for demo purposes
    const category = name.includes("Bitcoin") ? "Crypto" :
        name.includes("President") ? "Politics" :
            name.includes("Apple") ? "Tech" :
                name.includes("SpaceX") || name.includes("Mars") ? "Space" :
                    name.includes("AI") ? "AI" :
                        name.includes("UEFA") || name.includes("Sports") ? "Sports" :
                            name.includes("Oscar") || name.includes("Entertainment") ? "Entertainment" :
                                name.includes("temperature") || name.includes("Climate") ? "Climate" :
                                    "General"

    return (
        <Card className="relative">
            {isUserAdmin && (
                <div className="absolute top-2 right-2 z-10">
                    <DeleteMarketButton marketId={id} />
                </div>
            )}
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                        {category}
                    </Badge>
                    <Badge variant="secondary">{type === 'binary' ? 'Yes/No' : 'Multi'}</Badge>
                </div>
                <CardTitle className="text-lg">{name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
                {leadingOutcome && (
                    <div className="mt-2 mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Leading: <span className="font-medium">{leadingOutcome.name}</span></span>
                            <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{participants || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${poolAmount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 