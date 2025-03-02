"use client"

import { useEffect, useState } from "react"
import { ArrowUpDown, Trophy, Medal, ChevronsUp, UserIcon, Wallet, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUserIdentifier, isStacksAddress } from "@/lib/user-utils"
import { getLeaderboard, getTopEarners, getTopAccuracy } from "@/app/actions/leaderboard-actions"
import { LeaderboardEntry } from "@/lib/user-stats-store"

type SortKey = "rank" | "accuracy" | "earnings"
type LeaderboardType = "overall" | "earnings" | "accuracy"

export function LeaderboardTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("overall")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboardData() {
      setIsLoading(true)
      try {
        let response;

        switch (leaderboardType) {
          case "earnings":
            response = await getTopEarners(10);
            break;
          case "accuracy":
            response = await getTopAccuracy(10);
            break;
          default:
            response = await getLeaderboard(10);
            break;
        }

        if (response.success && response.entries) {
          setLeaderboardData(response.entries);
        } else {
          console.error("Failed to fetch leaderboard data:", response.error);
          // Use empty array if no data
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboardData();
  }, [leaderboardType]);

  // Manual sorting after data is fetched (if needed)
  const sortedUsers = [...leaderboardData].sort((a, b) => {
    if (sortKey === "rank") {
      return sortOrder === "asc" ?
        (a.rank || 0) - (b.rank || 0) :
        (b.rank || 0) - (a.rank || 0);
    }
    if (sortKey === "accuracy") {
      return sortOrder === "asc" ?
        a.accuracy - b.accuracy :
        b.accuracy - a.accuracy;
    }
    if (sortKey === "earnings") {
      return sortOrder === "asc" ?
        a.totalEarnings - b.totalEarnings :
        b.totalEarnings - a.totalEarnings;
    }
    return 0;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const handleTabChange = (value: string) => {
    setLeaderboardType(value as LeaderboardType);
  };

  // Helper to render trophy icon based on rank
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="font-mono text-sm text-muted-foreground">{rank}</span>;
  };

  // Helper to get username display
  const getUserDisplay = (user: LeaderboardEntry) => {
    // If no username, use the formatted userId
    if (!user.username) {
      return <span className="font-mono text-sm">{formatUserIdentifier(user.userId)}</span>;
    }

    // If it's a .btc name, show it with emphasis
    if (user.username.endsWith('.btc')) {
      return <span className="font-semibold text-primary">{user.username}</span>;
    }

    // If it's a Stacks address, format it nicely
    if (isStacksAddress(user.username)) {
      return <span className="font-mono text-sm">{formatUserIdentifier(user.username)}</span>;
    }

    // If it starts with "User-", it's an anonymized id
    if (user.username.startsWith('User-')) {
      return <span className="font-mono text-sm">{user.username}</span>;
    }

    // For any other username (custom usernames, not real names)
    return <span>{user.username}</span>;
  };

  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center">
          <Trophy className="mr-2 h-6 w-6 text-primary/70" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top predictors ranked by performance
        </CardDescription>
        <p className="text-xs text-muted-foreground mt-1">
          For privacy, users without custom usernames are displayed with anonymized IDs.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overall" className="flex items-center gap-1">
              <ChevronsUp className="h-4 w-4" />
              <span>Overall</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              <span>Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Accuracy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="pt-2">
            <LeaderboardTableContent
              isLoading={isLoading}
              users={sortedUsers}
              sortKey={sortKey}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
              getRankIcon={getRankIcon}
              getUserDisplay={getUserDisplay}
            />
          </TabsContent>

          <TabsContent value="earnings" className="pt-2">
            <LeaderboardTableContent
              isLoading={isLoading}
              users={sortedUsers}
              sortKey={sortKey}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
              getRankIcon={getRankIcon}
              getUserDisplay={getUserDisplay}
            />
          </TabsContent>

          <TabsContent value="accuracy" className="pt-2">
            <LeaderboardTableContent
              isLoading={isLoading}
              users={sortedUsers}
              sortKey={sortKey}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
              getRankIcon={getRankIcon}
              getUserDisplay={getUserDisplay}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Extracted table component for reuse between tabs
interface LeaderboardTableContentProps {
  isLoading: boolean
  users: LeaderboardEntry[]
  sortKey: SortKey
  sortOrder: "asc" | "desc"
  toggleSort: (key: SortKey) => void
  getRankIcon: (rank: number) => React.ReactNode
  getUserDisplay: (user: LeaderboardEntry) => React.ReactNode
}

function LeaderboardTableContent({
  isLoading,
  users,
  sortKey,
  sortOrder,
  toggleSort,
  getRankIcon,
  getUserDisplay
}: LeaderboardTableContentProps) {

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">
              <Button variant="ghost" onClick={() => toggleSort("rank")} className="font-bold">
                Rank
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Predictor</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => toggleSort("accuracy")} className="font-bold">
                Accuracy
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => toggleSort("earnings")} className="font-bold">
                Earnings
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Predictions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                No leaderboard data available yet
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={user.userId} className={index < 3 ? "bg-muted/30" : ""}>
                <TableCell className="font-medium flex items-center justify-center">
                  {getRankIcon(user.rank || index + 1)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{getUserDisplay(user)}</span>
                      {index < 3 && (
                        <Badge variant="outline" className="w-fit text-[10px] py-0">
                          {index === 0 ? "Top Predictor" :
                            index === 1 ? "Expert" :
                              "Veteran"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {user.accuracy.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  ${user.totalEarnings.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {user.totalPredictions}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Loading skeleton for the leaderboard
function LeaderboardSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Predictor</TableHead>
            <TableHead className="text-right">Accuracy</TableHead>
            <TableHead className="text-right">Earnings</TableHead>
            <TableHead className="text-right">Predictions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-6 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

