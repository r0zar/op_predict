"use client"

import { useEffect, useState } from "react"
import { ArrowUpDown, Trophy, Medal, ChevronsUp, UserIcon, Wallet, Target, HelpCircle, ChevronDown } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatUserIdentifier, isStacksAddress, truncateUserId } from "@/lib/user-utils"
import { getLeaderboard, getTopEarners, getTopAccuracy, getCurrentUserStats } from "@/app/actions/leaderboard-actions"
import { type LeaderboardEntry } from "wisdom-sdk"
import { useAuth } from "@clerk/nextjs"

// NOTE: We rely on the score returned from the backend
// The backend now returns scores directly from Redis or calculates them consistently if needed

type SortKey = "rank" | "accuracy" | "earnings" | "score"
type LeaderboardType = "overall" | "earnings" | "accuracy"

export function LeaderboardTable() {
  // Use optional chaining for auth to prevent errors if auth context is unavailable
  const authData = useAuth()
  const userId = authData?.userId || null

  const [isLoading, setIsLoading] = useState(true)
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("overall")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [sortKey, setSortKey] = useState<SortKey>("score") // Default to sorting by score
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc") // Default to highest scores first
  const [currentUserStats, setCurrentUserStats] = useState<LeaderboardEntry | null>(null)
  const [displayLimit, setDisplayLimit] = useState(10) // For pagination
  const [totalEntries, setTotalEntries] = useState(0)

  // For debugging
  useEffect(() => {
    console.log("Auth data:", authData)
    console.log("Current user ID:", userId)
  }, [authData, userId])

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboardData() {
      setIsLoading(true)
      try {
        let response;

        // Use displayLimit for pagination
        switch (leaderboardType) {
          case "earnings":
            response = await getTopEarners(displayLimit);
            break;
          case "accuracy":
            response = await getTopAccuracy(displayLimit);
            break;
          default:
            response = await getLeaderboard(displayLimit);
            break;
        }

        console.log("Leaderboard response:", response);

        if (response.success && response.entries) {
          setLeaderboardData(response.entries);
          setTotalEntries(response.totalCount || response.entries.length);
        } else {
          console.error("Failed to fetch leaderboard data:", response.error);
          // Use empty array if no data
          setLeaderboardData([]);
          setTotalEntries(0);
        }

        // Fetch current user stats if logged in
        if (userId) {
          try {
            console.log("Fetching stats for user:", userId);
            const userResponse = await getCurrentUserStats();
            console.log("User stats response:", userResponse);

            if (userResponse.success && userResponse.stats) {
              // Make sure all required fields are present with defaults
              const safeStats = {
                ...userResponse.stats,
                userId: userResponse.stats.userId || userId,
                accuracy: userResponse.stats.accuracy ?? 0,
                totalPredictions: userResponse.stats.totalPredictions ?? 0,
                totalEarnings: userResponse.stats.totalEarnings ?? 0,
                score: userResponse.stats.score ?? 0,
                rank: userResponse.stats.rank ?? 0
              };
              setCurrentUserStats(safeStats);
            } else {
              console.error("No stats found or invalid response format:", userResponse);
            }
          } catch (error) {
            console.error("Error fetching user stats:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboardData([]);
        setTotalEntries(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboardData();
  }, [leaderboardType, displayLimit, userId]);

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
    if (sortKey === "score") {
      // Use the score provided by the backend or default to 0
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      return sortOrder === "asc" ?
        scoreA - scoreB :
        scoreB - scoreA;
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

    // Set appropriate sort key based on tab
    switch (value) {
      case "earnings":
        setSortKey("earnings");
        setSortOrder("desc");
        break;
      case "accuracy":
        setSortKey("accuracy");
        setSortOrder("desc");
        break;
      default:
        setSortKey("score");  // for the overall tab, use the composite score
        setSortOrder("desc");
        break;
    }
  };

  // Helper to render trophy icon based on rank
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" aria-label="1st Place" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" aria-label="2nd Place" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" aria-label="3rd Place" />;
    return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-semibold text-sm">{rank}</div>;
  };

  // Helper to get username display
  const getUserDisplay = (user: LeaderboardEntry) => {
    if (!user) return <span className="font-mono text-sm text-muted-foreground">Unknown</span>;

    // If no username or userId, show anonymous
    if (!user.username && !user.userId) {
      return <span className="font-mono text-sm text-muted-foreground">Anonymous</span>;
    }

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
      return <span className="font-mono text-sm">{truncateUserId(user.userId)}</span>;
    }

    // If it starts with "user-", it's an anonymized id
    if (user.userId.startsWith('user-')) {
      return <span className="font-mono text-sm">{truncateUserId(user.userId)}</span>;
    }

    // For any other username (custom usernames, not real names)
    return <span>{truncateUserId(user.userId)}</span>;
  };

  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center">
          <Trophy className="mr-2 h-6 w-6 text-primary/70" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top predictors ranked by our composite scoring algorithm
        </CardDescription>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>
            Score components: 40% accuracy (weighted by consistency), 30% earnings, 30% prediction volume
          </p>
          <p>
            For privacy, users without custom usernames are displayed with anonymized IDs.
          </p>
        </div>
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
              userId={userId}
              totalEntries={totalEntries}
              displayLimit={displayLimit}
              setDisplayLimit={setDisplayLimit}
              currentUserStats={currentUserStats}
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
              userId={userId}
              totalEntries={totalEntries}
              displayLimit={displayLimit}
              setDisplayLimit={setDisplayLimit}
              currentUserStats={currentUserStats}
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
              userId={userId}
              totalEntries={totalEntries}
              displayLimit={displayLimit}
              setDisplayLimit={setDisplayLimit}
              currentUserStats={currentUserStats}
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
  userId: string | null
  totalEntries: number
  displayLimit: number
  setDisplayLimit: (limit: number) => void
  currentUserStats: LeaderboardEntry | null
}

function LeaderboardTableContent({
  isLoading,
  users,
  sortKey,
  sortOrder,
  toggleSort,
  getRankIcon,
  getUserDisplay,
  userId,
  totalEntries,
  displayLimit,
  setDisplayLimit,
  currentUserStats
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => toggleSort("accuracy")} className="font-bold">
                      Accuracy
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      <HelpCircle className="ml-1 h-3.5 w-3.5 text-muted-foreground/70" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Percentage of correct predictions out of total predictions made, weighted by consistency.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => toggleSort("earnings")} className="font-bold">
                      Earnings
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      <HelpCircle className="ml-1 h-3.5 w-3.5 text-muted-foreground/70" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Total earnings from winning predictions minus the amount spent on predictions.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-end">
                      Predictions
                      <HelpCircle className="ml-1 h-3.5 w-3.5 text-muted-foreground/70" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Total number of predictions made across all markets.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => toggleSort("score")} className="font-bold">
                      Score
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      <HelpCircle className="ml-1 h-3.5 w-3.5 text-muted-foreground/70" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Composite score based on: 40% accuracy, 30% earnings, and 30% prediction volume.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                No leaderboard data available yet
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow
                key={user.userId}
                className={`
                  ${((user.rank ?? 0) <= 3 && (user.rank ?? 0) > 0) || index < 3 ? "bg-muted/30" : ""}
                  ${userId && user.userId === userId ? "bg-primary/10 hover:bg-primary/20" : ""}
                `}
              >
                <TableCell className="font-medium flex items-center justify-center">
                  {getRankIcon(user.rank ?? (index + 1))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-row items-center gap-2">
                      <span>{getUserDisplay(user)}</span>
                      {(((user.rank ?? 0) <= 3 && (user.rank ?? 0) > 0) || index < 3) && (
                        <Badge
                          variant={((user.rank ?? 0) === 1 || index === 0) ? "default" : "outline"}
                          className={`w-fit whitespace-nowrap text-[10px] py-0 ${((user.rank ?? 0) === 1 || index === 0) ? "bg-amber-500/90 hover:bg-amber-500/80" : ""}`}
                        >
                          {((user.rank ?? 0) === 1 || index === 0) ? "🏆 Top Predictor" :
                            ((user.rank ?? 0) === 2 || index === 1) ? "🥈 Expert" :
                              "🥉 Veteran"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {(user.accuracy ?? 0).toFixed(1)}%
                </TableCell>
                <TableCell className={`text-right font-semibold ${(user.totalEarnings ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(user.totalEarnings ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {user.totalPredictions ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${((user.rank ?? 0) === 1 || index === 0) ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(((user.score ?? 0) * 1.5), 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-primary">{(user.score ?? 0).toFixed(1)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Load More Button */}
      {users.length > 0 && users.length < totalEntries && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setDisplayLimit(displayLimit + 10)}
          >
            Load More
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Current User Row (if not already visible) */}
      {userId && currentUserStats && !users.some(u => userId && u.userId === userId) && (
        <div className="mt-6 border-t pt-4">
          <div className="text-sm text-muted-foreground mb-2">Your Position</div>
          <div className="rounded-md border">
            <Table>
              <TableBody>
                <TableRow className="bg-primary/10 border-l-4 border-primary">
                  <TableCell className="font-medium flex items-center justify-center">
                    {getRankIcon(currentUserStats.rank ?? 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{getUserDisplay(currentUserStats)}</span>
                        <Badge variant="outline" className="w-fit text-[10px] py-0">You</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {(currentUserStats.accuracy ?? 0).toFixed(1)}%
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${(currentUserStats.totalEarnings ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(currentUserStats.totalEarnings ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {currentUserStats.totalPredictions ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(((currentUserStats.score ?? 0) * 1.5), 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-primary">{(currentUserStats.score ?? 0).toFixed(1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
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
            <TableHead className="text-right">Score</TableHead>
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
              <TableCell className="text-right">
                <Skeleton className="h-4 w-10 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

