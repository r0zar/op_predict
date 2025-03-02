import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getTopVaults } from "@/app/actions/explore-actions"

// Top vaults section - completely redesigned for better responsiveness
export async function VaultsSection() {
    const topVaults = await getTopVaults()

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Top Performing Vaults</h2>
                </div>
                <Link href="/vaults" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                    View all vaults
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {topVaults.map((vault) => (
                    <Card key={vault.id} className="border border-border/50 hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="bg-background">{vault.markets} Markets</Badge>
                                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/10">
                                    {vault.fairResolution}% Success
                                </Badge>
                            </div>
                            <CardTitle className="mt-2 text-lg">{vault.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <div className="flex flex-col space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Engagement</span>
                                    <span className="font-medium">{vault.engagement.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Value</span>
                                    <span className="font-medium">${vault.totalValue.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t border-border/50">
                            <Button variant="ghost" size="sm" className="w-full hover:bg-primary/10 hover:text-primary transition-colors">
                                View Vault
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    )
} 