import Link from "next/link"
import { ChevronRight, TrendingUp, Users, Zap } from "lucide-react"
import { auth, currentUser } from '@clerk/nextjs/server';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketCard } from "@/components/market-card"
import { TopMarkets } from "@/components/top-markets"
import { getAllMarkets } from "@/app/actions/market-actions"
import { calculateOutcomePercentages } from "@/lib/src/utils"

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();

  // Fetch real markets from the database
  const markets = await getAllMarkets();

  // Get the most active market by participants count (or pool amount)
  const featuredMarket = markets.length > 0
    ? [...markets]
      .filter(m => m.status === 'active')
      .sort((a, b) => (b.participants || 0) - (a.participants || 0))[0]
    : null;

  // Get trending markets (excluding the featured one and completed markets)
  const trendingMarkets = markets.length > 1
    ? [...markets]
      .filter(m => m.id !== featuredMarket?.id && m.status === 'active')
      .sort((a, b) => (b.participants || 0) - (a.participants || 0))
      .slice(0, 6)
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container justify-self-center px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 mb-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Predict the Future. <div className="text-primary">Earn Bitcoin.</div>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-lg">
                    Explore and participate in markets for politics, sports, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/markets">
                    <Button size="lg" className="gap-1.5 items-center">
                      Explore Markets
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button size="lg" variant="outline" className="items-center">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-items-center justify-center">
                {featuredMarket ? (
                  <Card className="w-full max-w-md border-primary/10 bg-background/60 backdrop-blur">
                    <CardHeader>
                      <CardTitle>Featured Market</CardTitle>
                      <CardDescription>Most active prediction market right now</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">{featuredMarket.name}</h3>
                        <div className="flex justify-items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{(featuredMarket.participants || 0).toLocaleString()} participants</span>
                          <span className="text-primary font-medium">${(featuredMarket.poolAmount || 0).toLocaleString()} pool</span>
                        </div>
                        {featuredMarket.outcomes?.length > 0 && (
                          <>
                            <div className="mt-4 flex justify-items-center justify-between">
                              {calculateOutcomePercentages(featuredMarket.outcomes.map(outcome => ({
                                id: String(outcome.id),
                                name: outcome.name,
                                votes: outcome.votes,
                                amount: outcome.amount
                              }))).outcomesWithPercentages.slice(0, 2).map((outcome, index) => (
                                <div key={outcome.id}>
                                  <div className="text-sm font-medium">{outcome.name}</div>
                                  <div className={`text-2xl font-bold ${index === 0 ? "text-primary" : "text-destructive"}`}>
                                    {outcome.percentage}%
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full bg-primary" style={{
                                width: `${calculateOutcomePercentages(featuredMarket.outcomes.map(outcome => ({
                                  id: String(outcome.id),
                                  name: outcome.name,
                                  votes: outcome.votes,
                                  amount: outcome.amount
                                }))).outcomesWithPercentages[0]?.percentage || 0}%`
                              }}></div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/markets/${featuredMarket.id}`} className="w-full">
                        <Button className="w-full" variant="outline">View Market</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="w-full max-w-md border-primary/10 bg-background/60 backdrop-blur">
                    <CardHeader>
                      <CardTitle>Featured Market</CardTitle>
                      <CardDescription>Most active prediction market right now</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">No markets available yet</h3>
                        <p className="text-muted-foreground">Be the first to create a prediction market!</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/create">
                        <Button className="w-full items-center justify-center">Create Market</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container justify-self-center px-4 md:px-6">
            <div className="flex flex-col justify-items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  <Zap className="mr-2 inline-block h-4 w-4" />
                  Active Markets
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Trending Prediction Markets</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed justify-self-center lg:text-base/relaxed xl:text-xl/relaxed">
                  Browse and participate in the most active prediction markets on the platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {trendingMarkets.length > 0 ? (
                trendingMarkets.map(market => (
                  <Link href={`/markets/${market.id}`} key={market.id}>
                    <MarketCard
                      market={{
                        id: market.id,
                        name: market.name,
                        type: market.type,
                        participants: market.participants || 0,
                        poolAmount: market.poolAmount || 0,
                        outcomes: (market.outcomes || []).map(outcome => ({
                          id: String(outcome.id),
                          name: outcome.name,
                          votes: outcome.votes,
                          amount: outcome.amount
                        })),
                        category: market.category || 'General',
                        endDate: new Date(market.createdAt).toLocaleDateString(),
                        status: market.status || 'inactive'
                      }}
                      disabled={market.status !== 'active'}
                    />
                  </Link>
                ))
              ) : (
                <div className="text-center col-span-3 py-12">
                  <h3 className="text-xl font-semibold mb-2">No markets available yet</h3>
                  <p className="text-muted-foreground mb-6">Be the first to create a prediction market!</p>
                  <Link href="/create">
                    <Button size="lg" className="items-center justify-center" >Create Market</Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Link href="/markets">
                <Button variant="outline" size="lg" className="gap-1.5 items-center">
                  View All Markets
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container justify-self-center px-4 md:px-6">
            <div className="flex flex-col justify-items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Top Performing Markets</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed justify-self-center lg:text-base/relaxed xl:text-xl/relaxed">
                  The most liquid and active prediction markets with the highest rewards.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-6xl py-12">
              <TopMarkets />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
