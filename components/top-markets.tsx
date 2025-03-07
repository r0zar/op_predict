"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getMarkets } from "@/app/actions/market-actions"
// Define Market type locally
type Market = any;

type SortField = "participants" | "poolAmount" | "volume24h" | "change24h"
type SortDirection = "asc" | "desc"

export function TopMarkets() {
  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    const fetchMarkets = async () => {
      const result = await getMarkets()
      setMarkets(result.items || [])
    }
    fetchMarkets()
  }, [])

  const sortedMarkets = markets
    .filter(market => market.status === 'active')
    .sort((a, b) => (b.poolAmount || 0) - (a.poolAmount || 0))
    .slice(0, 10)
    .map(market => ({
      id: market.id,
      title: market.name,
      category: market.category,
      participants: market.participants || 0,
      poolAmount: `$${market.poolAmount?.toLocaleString() || '0'}`,
      yesPercentage: market.outcomes[0].votes && market.outcomes[1].votes ?
        Math.round((market.outcomes[0].votes / (market.outcomes[0].votes + market.outcomes[1].votes)) * 100) : 50,
      volume24h: "$0", // TODO: Add volume tracking to market store
      change24h: 0 // TODO: Add change tracking to market store
    }))

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Market</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Pool Size</TableHead>
            <TableHead>Yes %</TableHead>
            <TableHead>24h Volume</TableHead>
            <TableHead>24h Change</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMarkets.map((market) => (
            <TableRow key={market.id}>
              <TableCell className="font-medium">
                <Link href={`/markets/${market.id}`} className="hover:text-primary hover:underline">
                  {market.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {market.category}
                </Badge>
              </TableCell>
              <TableCell>{market.participants.toLocaleString()}</TableCell>
              <TableCell>{market.poolAmount}</TableCell>
              <TableCell>
                <div className="flex justify-items-center gap-2 items-center">
                  <div className="h-2 w-12 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${market.yesPercentage}%` }}></div>
                  </div>
                  <span>{market.yesPercentage}%</span>
                </div>
              </TableCell>
              <TableCell>{market.volume24h}</TableCell>
              <TableCell>
                <span className={market.change24h > 0 ? "text-green-500" : market.change24h < 0 ? "text-red-500" : ""}>
                  {market.change24h > 0 ? "+" : ""}
                  {market.change24h}%
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="gap-1.5 items-center" disabled>
                  <Link href={`/markets/${market.id}`}>Trade</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
