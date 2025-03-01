"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data for top markets
const markets = [
  {
    id: 1,
    title: "Will Bitcoin reach $100k by end of 2025?",
    category: "Crypto",
    participants: 2456,
    poolAmount: "$124,500",
    yesPercentage: 64,
    volume24h: "$12,450",
    change24h: 2.3,
  },
  {
    id: 2,
    title: "Will the US Federal Reserve cut rates in Q2 2025?",
    category: "Finance",
    participants: 3567,
    poolAmount: "$156,700",
    yesPercentage: 48,
    volume24h: "$18,900",
    change24h: -1.2,
  },
  {
    id: 3,
    title: "Will SpaceX complete a successful Starship orbital flight?",
    category: "Space",
    participants: 4231,
    poolAmount: "$187,500",
    yesPercentage: 91,
    volume24h: "$24,300",
    change24h: 5.7,
  },
  {
    id: 4,
    title: "Will global average temperature set a new record in 2025?",
    category: "Climate",
    participants: 1876,
    poolAmount: "$67,200",
    yesPercentage: 83,
    volume24h: "$8,900",
    change24h: 0.5,
  },
  {
    id: 5,
    title: "Will the S&P 500 finish 2025 above 5,500?",
    category: "Finance",
    participants: 3012,
    poolAmount: "$142,800",
    yesPercentage: 62,
    volume24h: "$15,600",
    change24h: -0.8,
  },
]

type SortField = "participants" | "poolAmount" | "volume24h" | "change24h"
type SortDirection = "asc" | "desc"

export function TopMarkets() {
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

  const sortedMarkets = [...markets].sort((a, b) => {
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
                <Link href={`/market/${market.id}`} className="hover:text-primary hover:underline">
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
                  <Link href={`/market/${market.id}`}>Trade</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

