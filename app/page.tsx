import Link from "next/link"
import { ChevronRight, TrendingUp, Users, Zap } from "lucide-react"
import { auth, currentUser } from '@clerk/nextjs/server';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketCard } from "@/components/market-card"
import { TopMarkets } from "@/components/top-markets"

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();

  // Use user data...
  console.log(userId, user);

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
                  <Button size="lg" className="gap-1.5 items-center" disabled>
                    Explore Markets
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Link href="/how-it-works">
                    <Button size="lg" variant="outline" className="items-center">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-items-center justify-center">
                <Card className="w-full max-w-md border-primary/10 bg-background/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Featured Market</CardTitle>
                    <CardDescription>Most active prediction market right now</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Will Bitcoin reach $100k by end of 2025?</h3>
                      <div className="flex justify-items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>2,456 participants</span>
                        <span className="text-primary font-medium">$124,500 pool</span>
                      </div>
                      <div className="mt-4 flex justify-items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Yes</div>
                          <div className="text-2xl font-bold text-primary">64%</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">No</div>
                          <div className="text-2xl font-bold text-destructive">36%</div>
                        </div>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: "64%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="w-full">Place Prediction</Button>
                  </CardFooter>
                </Card>
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
              <MarketCard
                title="Will Ethereum 2.0 launch before July 2025?"
                participants={1245}
                poolAmount="$78,900"
                options={[
                  { name: "Yes", percentage: 72, color: "text-primary" },
                  { name: "No", percentage: 28, color: "text-destructive" }
                ]}
                category="Crypto"
                endDate="June 30, 2025"
                disabled={true}
              />
              <MarketCard
                title="Will the US Federal Reserve cut rates in Q2 2025?"
                participants={3567}
                poolAmount="$156,700"
                options={[
                  { name: "Yes", percentage: 48, color: "text-primary" },
                  { name: "No", percentage: 52, color: "text-destructive" }
                ]}
                category="Finance"
                endDate="June 15, 2025"
                disabled={true}
              />
              <MarketCard
                title="Will Apple release a foldable device in 2025?"
                participants={2189}
                poolAmount="$94,300"
                options={[
                  { name: "Yes", percentage: 31, color: "text-primary" },
                  { name: "No", percentage: 69, color: "text-destructive" }
                ]}
                category="Technology"
                endDate="Dec 31, 2025"
                disabled={true}
              />
              <MarketCard
                title="Will global average temperature set a new record in 2025?"
                participants={1876}
                poolAmount="$67,200"
                options={[
                  { name: "Yes", percentage: 83, color: "text-primary" },
                  { name: "No", percentage: 17, color: "text-destructive" }
                ]}
                category="Climate"
                endDate="Dec 31, 2025"
                disabled={true}
              />
              <MarketCard
                title="Will SpaceX complete a successful Starship orbital flight?"
                participants={4231}
                poolAmount="$187,500"
                options={[
                  { name: "Yes", percentage: 91, color: "text-primary" },
                  { name: "No", percentage: 9, color: "text-destructive" }
                ]}
                category="Space"
                endDate="Aug 15, 2025"
                disabled={true}
              />
              <MarketCard
                title="Will the S&P 500 finish 2025 above 5,500?"
                participants={3012}
                poolAmount="$142,800"
                options={[
                  { name: "Yes", percentage: 62, color: "text-primary" },
                  { name: "No", percentage: 38, color: "text-destructive" }
                ]}
                category="Finance"
                endDate="Dec 31, 2025"
                disabled={true}
              />
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="lg" className="gap-1.5 items-center" disabled>
                View All Markets
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
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

