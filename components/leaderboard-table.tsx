"use client"

import { useState } from "react"
import { ArrowUpDown, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Helper function to truncate Stacks addresses
const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`
}

// Simulated user data
const users = [
  { id: 1, name: "satoshi.btc", accuracy: 92.5, earnings: 15000 },
  { id: 2, name: "vitalik.btc", accuracy: 89.3, earnings: 12500 },
  { id: 3, name: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", accuracy: 88.1, earnings: 11000 },
  { id: 4, name: "op_predictor.btc", accuracy: 87.6, earnings: 10500 },
  { id: 5, name: "crypto_oracle.btc", accuracy: 86.9, earnings: 9800 },
  { id: 6, name: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE", accuracy: 85.4, earnings: 9200 },
  { id: 7, name: "future_seer.btc", accuracy: 84.7, earnings: 8900 },
  { id: 8, name: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", accuracy: 83.9, earnings: 8500 },
  { id: 9, name: "market_wizard.btc", accuracy: 83.2, earnings: 8100 },
  { id: 10, name: "SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B", accuracy: 82.5, earnings: 7800 },
]

type SortKey = "rank" | "accuracy" | "earnings"

export function LeaderboardTable() {
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const sortedUsers = [...users].sort((a, b) => {
    if (sortKey === "rank") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id
    }
    if (sortKey === "accuracy") {
      return sortOrder === "asc" ? a.accuracy - b.accuracy : b.accuracy - a.accuracy
    }
    if (sortKey === "earnings") {
      return sortOrder === "asc" ? a.earnings - b.earnings : b.earnings - a.earnings
    }
    return 0
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {index === 0 && <Trophy className="inline-block mr-2 text-yellow-500" />}
                {index === 1 && <Trophy className="inline-block mr-2 text-gray-400" />}
                {index === 2 && <Trophy className="inline-block mr-2 text-amber-600" />}
                {index + 1}
              </TableCell>
              <TableCell>
                {user.name.endsWith(".btc") ? (
                  <span className="font-semibold text-primary">{user.name}</span>
                ) : (
                  <span className="font-mono">{truncateAddress(user.name)}</span>
                )}
              </TableCell>
              <TableCell className="text-right">{user.accuracy.toFixed(1)}%</TableCell>
              <TableCell className="text-right">${user.earnings.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

