'use client'

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
// Define Market type locally
type Market = any

type SortField = "participants" | "poolAmount" | "volume24h" | "change24h"
type SortDirection = "asc" | "desc"

type TableMarket = {
  id: string
  title: string
  category: string
  participants: number
  poolAmount: string
  yesPercentage: number
  volume24h: string
  change24h: number
}

export function MarketsTable({ markets }: { markets: Market[] }) {
  const [sortField, setSortField] = useState<SortField>("participants")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const tableMarkets = markets.map(market => ({
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

  const sortedMarkets = [...tableMarkets].sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortField) {
      case "participants":
        aValue = a.participants
        bValue = b.participants
        break
      case "poolAmount":
        aValue = Number.parseFloat(a.poolAmount.replace(/[^0-9.-]+/g, ""))
        bValue = Number.parseFloat(b.poolAmount.replace(/[^0-9.-]+/g, ""))
        break
      case "volume24h":
        aValue = Number.parseFloat(a.volume24h.replace(/[^0-9.-]+/g, ""))
        bValue = Number.parseFloat(b.volume24h.replace(/[^0-9.-]+/g, ""))
        break
      case "change24h":
        aValue = a.change24h
        bValue = b.change24h
        break
      default:
        aValue = a.participants
        bValue = b.participants
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
  })

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Market</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("participants")}>
              <div className="flex justify-items-center">
                Participants
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortField === "participants" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("poolAmount")}>
              <div className="flex justify-items-center">
                Pool Size
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortField === "poolAmount" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead>Yes %</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("volume24h")}>
              <div className="flex justify-items-center">
                24h Volume
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortField === "volume24h" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("change24h")}>
              <div className="flex justify-items-center">
                24h Change
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortField === "change24h" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
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
                <Button variant="outline" size="sm" className="gap-1.5 items-center">
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
