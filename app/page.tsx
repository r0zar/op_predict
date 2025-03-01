import Link from "next/link"
import { ChevronRight, TrendingUp, Users, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketCard } from "@/components/market-card"
import { TopMarkets } from "@/components/top-markets"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { SignUpDialog } from "@/components/auth/sign-up-dialog"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container justify-self-center px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Predict the Future. Win Real Rewards.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    OP_PREDICT is a decentralized predictions market where you can bet on real-world events and earn
                    rewards.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/explore">
                    <Button size="lg" className="gap-1.5 items-center">
                      Explore Markets
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="items-center">
                    Learn More
                  </Button>
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
                    <Button className="w-full">Place Prediction</Button>
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
                yesPercentage={72}
                category="Crypto"
                endDate="June 30, 2025"
              />
              <MarketCard
                title="Will the US Federal Reserve cut rates in Q2 2025?"
                participants={3567}
                poolAmount="$156,700"
                yesPercentage={48}
                category="Finance"
                endDate="June 15, 2025"
              />
              <MarketCard
                title="Will Apple release a foldable device in 2025?"
                participants={2189}
                poolAmount="$94,300"
                yesPercentage={31}
                category="Technology"
                endDate="Dec 31, 2025"
              />
              <MarketCard
                title="Will global average temperature set a new record in 2025?"
                participants={1876}
                poolAmount="$67,200"
                yesPercentage={83}
                category="Climate"
                endDate="Dec 31, 2025"
              />
              <MarketCard
                title="Will SpaceX complete a successful Starship orbital flight?"
                participants={4231}
                poolAmount="$187,500"
                yesPercentage={91}
                category="Space"
                endDate="Aug 15, 2025"
              />
              <MarketCard
                title="Will the S&P 500 finish 2025 above 5,500?"
                participants={3012}
                poolAmount="$142,800"
                yesPercentage={62}
                category="Finance"
                endDate="Dec 31, 2025"
              />
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="lg">
                View All Markets
                <ChevronRight className="ml-2 h-4 w-4" />
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
            <div className="mx-auto max-w-4xl py-12">
              <TopMarkets />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

