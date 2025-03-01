"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TrendingUp, Zap, Clock, Star, BarChart2, Plus, Bell } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data (replace with real data fetching and AI-generated content in production)
const personalizedMarkets = [
  { id: 1, title: "Bitcoin to reach $100k by EOY", category: "Crypto", engagement: 9500 },
  { id: 2, title: "Next US President 2025", category: "Politics", engagement: 8200 },
  { id: 3, title: "Apple to release VR headset", category: "Tech", engagement: 7800 },
  { id: 4, title: "SpaceX Starship to reach orbit", category: "Space", engagement: 7500 },
  { id: 5, title: "AI to pass medical licensing exam", category: "AI", engagement: 7200 },
]

const trendingMarkets = [
  { id: 1, title: "Global temperature record in 2025", category: "Climate", volume: "$1.5M" },
  { id: 2, title: "Oscar Best Picture Winner", category: "Entertainment", volume: "$800K" },
  { id: 3, title: "UEFA Champions League Winner", category: "Sports", volume: "$2.2M" },
  { id: 4, title: "First human on Mars", category: "Space", volume: "$1.8M" },
  { id: 5, title: "AI to create a Billboard top 10 song", category: "AI", volume: "$950K" },
]

const categories = [
  "Crypto",
  "Politics",
  "Tech",
  "Sports",
  "Entertainment",
  "Climate",
  "Space",
  "AI",
  "Finance",
  "Health",
]

const MarketCard = ({ title, category, metric, metricLabel }) => (
  <Card className="w-[300px] flex-shrink-0">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Badge>{category}</Badge>
      <p className="mt-2">
        {metricLabel}: {metric}
      </p>
    </CardContent>
  </Card>
)

const CategorySection = ({ title, icon: Icon, markets }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 flex justify-items-center">
      <Icon className="mr-2" />
      {title}
    </h2>
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {markets.map((market) => (
          <MarketCard
            key={market.id}
            title={market.title}
            category={market.category}
            metric={market.engagement || market.volume}
            metricLabel={market.engagement ? "Engagement" : "24h Volume"}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </section>
)

const topVaults = [
  { id: 1, name: "CryptoFutures", engagement: 9500, fairResolution: 98 },
  { id: 2, name: "SportsBettingPro", engagement: 8200, fairResolution: 99 },
  { id: 3, name: "TechTrends", engagement: 7800, fairResolution: 97 },
]

const featuredCreators = [
  {
    id: 1,
    name: "Alice Crypto",
    avatar: "/avatars/alice.jpg",
    bio: "Blockchain expert, 5 years in prediction markets",
  },
  { id: 2, name: "Bob Sports", avatar: "/avatars/bob.jpg", bio: "Former athlete, specializes in sports predictions" },
]

const soonToResolve = [
  { id: 1, title: "Oscars Best Picture Winner", category: "Entertainment", resolveDate: "2025-03-10" },
  { id: 2, title: "UEFA Champions League Winner", category: "Sports", resolveDate: "2025-06-01" },
]

const newMarkets = [
  { id: 1, title: "First Human on Mars", category: "Science", created: "2 hours ago" },
  { id: 2, title: "AI to Pass Turing Test", category: "Technology", created: "1 day ago" },
]

export function ExploreContent() {
  // const [activeTab, setActiveTab] = useState("trending")

  return (
    <div className="space-y-8">
      <CategorySection title="Personalized for You" icon={Star} markets={personalizedMarkets} />
      <CategorySection title="Trending Markets" icon={TrendingUp} markets={trendingMarkets} />
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex justify-items-center">
          <BarChart2 className="mr-2" />
          Explore by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Button key={category} variant="outline" className="w-full">
              {category}
            </Button>
          ))}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex justify-items-center">
          <Zap className="mr-2" />
          New & Notable
        </h2>
        <div className="space-y-4">
          {newMarkets.map((market) => (
            <Card key={market.id}>
              <CardHeader>
                <CardTitle>{market.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge>{market.category}</Badge>
                <p className="mt-2">Created: {market.created}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex justify-items-center">
          <Clock className="mr-2" />
          Closing Soon
        </h2>
        <div className="space-y-4">
          {soonToResolve.map((market) => (
            <Card key={market.id}>
              <CardHeader>
                <CardTitle>{market.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge>{market.category}</Badge>
                <p className="mt-2">Resolves: {market.resolveDate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Top Performing Vaults</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topVaults.map((vault) => (
          <Card key={vault.id}>
            <CardHeader>
              <CardTitle>{vault.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Engagement: {vault.engagement}</p>
              <p>Fair Resolution: {vault.fairResolution}%</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap justify-between justify-items-center mt-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Featured Vault Creators</h3>
          <div className="flex space-x-4">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="flex justify-items-center space-x-2">
                <Avatar>
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{creator.name}</p>
                  <p className="text-sm text-muted-foreground">{creator.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-lg font-semibold">Quick Stats</p>
          <p>Active Predictions: 15,234</p>
          <p>Total Value Locked: $25.6M</p>
          <p>Upcoming Resolutions: 89</p>
        </div>
      </div>
    </section>
  )
}

function ActionPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button className="flex-1">
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
          <Button className="flex-1" variant="secondary">
            <TrendingUp className="mr-2 h-4 w-4" /> Wager
          </Button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Your Activity</h3>
          <p>Active Predictions: 5</p>
          <p>Claimable Winnings: $120</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Notifications</h3>
          <Button variant="outline" className="w-full">
            <Bell className="mr-2 h-4 w-4" /> 3 New Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NavigationSidebar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Explore Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Crypto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Politics
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Sports
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Entertainment
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Technology
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Your Prediction Receipts</h3>
              <Button variant="outline" className="w-full">
                View NFTs
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Create</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  New Vault
                </Button>
                <Button variant="outline" className="w-full">
                  New Market
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

