'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientOnly } from "@/components/client/ClientOnly"
import { ClientDate } from "@/components/client/ClientDate"
import { ClientCurrency } from "@/components/client/ClientCurrency"
import { ClientNumber } from "@/components/client/ClientNumber"
import { ClientAnalytics } from "@/components/client/ClientAnalytics"
import {
  Market,
  PaginatedResult,
  SortField,
  SortDirection
} from 'wisdom-sdk'
import {
  getMarkets,
  loadMoreMarkets,
  MarketQueryParams
} from '@/app/actions/market-actions'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface MarketsTableProps {
  initialMarkets?: PaginatedResult<Market>
  defaultCategory?: string
  defaultSearch?: string
  defaultStatus?: 'active' | 'resolved' | 'all'
  defaultSortBy?: SortField
  defaultSortDirection?: SortDirection
}

// Market categories available for selection
export const MARKET_CATEGORIES = [
  'general',
  'crypto',
  'politics',
  'sports',
  'entertainment',
  'technology',
  'science',
  'economics',
  'social'
] as const;

interface MarketStats {
  totalPoolAmount: number;
  totalParticipants: number;
  averagePoolPerMarket: number;
  averageParticipantsPerMarket: number;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  typesDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export default function MarketsTable({
  initialMarkets,
  defaultCategory,
  defaultSearch = '',
  defaultStatus = 'active',
  defaultSortBy = 'createdAt',
  defaultSortDirection = 'desc'
}: MarketsTableProps) {
  // Router for URL management
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(defaultSearch)
  const [category, setCategory] = useState<string | undefined>(defaultCategory)
  const [status, setStatus] = useState<'active' | 'resolved' | 'all'>(defaultStatus)
  const [sortBy, setSortBy] = useState<SortField>(defaultSortBy)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection)
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table')

  // State for markets and loading
  const [marketsResult, setMarketsResult] = useState<PaginatedResult<Market> | null>(initialMarkets || null)
  const [isLoading, setIsLoading] = useState(!initialMarkets)

  // Pagination state
  const [cursorHistory, setCursorHistory] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Update URL when filters change
  const updateUrl = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    // Update or remove each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })

    router.replace(`${pathname}?${newParams.toString()}`)
  }

  // Load markets based on filters
  const loadMarkets = async () => {
    setIsLoading(true)

    try {
      const params: MarketQueryParams = {
        status,
        category,
        search: searchQuery,
        sortBy,
        sortDirection,
        limit: pageSize
      }

      const result = await getMarkets(params)
      setMarketsResult(result)
      setCursorHistory([]) // Reset cursor history
      setCurrentPage(1) // Reset to first page
    } catch (error) {
      console.error('Error loading markets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle pagination
  const handlePageChange = async (direction: 'next' | 'prev') => {
    if (!marketsResult) return

    try {
      setIsLoading(true)

      if (direction === 'next' && marketsResult.nextCursor) {
        const params: MarketQueryParams = {
          status,
          category,
          search: searchQuery,
          sortBy,
          sortDirection,
          limit: pageSize,
          cursor: marketsResult.nextCursor
        }

        const nextResult = await getMarkets(params)
        setMarketsResult(nextResult)
        setCursorHistory([...cursorHistory, marketsResult.nextCursor])
        setCurrentPage(currentPage + 1)
      } else if (direction === 'prev' && currentPage > 1) {
        const cursor = cursorHistory[cursorHistory.length - 2]

        const params: MarketQueryParams = {
          status,
          category,
          search: searchQuery,
          sortBy,
          sortDirection,
          limit: pageSize,
          cursor: cursor
        }

        const prevResult = await getMarkets(params)
        setMarketsResult(prevResult)
        setCursorHistory(cursorHistory.slice(0, -1))
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error('Error changing page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    // Toggle direction if same field, otherwise set to desc
    const newDirection = field === sortBy && sortDirection === 'desc' ? 'asc' : 'desc'

    setSortBy(field)
    setSortDirection(newDirection)
    updateUrl({
      sort: field,
      direction: newDirection
    })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate market statistics
  const marketStats: MarketStats = useMemo(() => {
    if (!marketsResult?.items.length) {
      return {
        totalPoolAmount: 0,
        totalParticipants: 0,
        averagePoolPerMarket: 0,
        averageParticipantsPerMarket: 0,
        categoryDistribution: [],
        statusDistribution: [],
        typesDistribution: []
      }
    }

    const markets = marketsResult.items
    const totalPoolAmount = markets.reduce((sum, market) => sum + market.poolAmount, 0)
    const totalParticipants = markets.reduce((sum, market) => sum + market.participants, 0)

    // Category distribution
    const categoryCounts: Record<string, number> = {}
    markets.forEach(market => {
      const cat = market.category || 'Uncategorized'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    const categoryDistribution = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / markets.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    // Status distribution
    const statusCounts: Record<string, number> = {}
    markets.forEach(market => {
      statusCounts[market.status] = (statusCounts[market.status] || 0) + 1
    })

    const statusDistribution = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / markets.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    // Type distribution
    const typeCounts: Record<string, number> = {}
    markets.forEach(market => {
      typeCounts[market.type] = (typeCounts[market.type] || 0) + 1
    })

    const typesDistribution = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / markets.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    return {
      totalPoolAmount,
      totalParticipants,
      averagePoolPerMarket: totalPoolAmount / markets.length,
      averageParticipantsPerMarket: totalParticipants / markets.length,
      categoryDistribution,
      statusDistribution,
      typesDistribution
    }
  }, [marketsResult])

  // Handle filter changes and update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl({
        category,
        search: searchQuery,
        status,
        sort: sortBy,
        direction: sortDirection
      })

      loadMarkets()
    }, searchQuery ? 300 : 0)

    return () => clearTimeout(timer)
  }, [searchQuery, category, status, sortBy, sortDirection, pageSize])

  return (
    <div className="space-y-6">
      {/* View toggle with cyberpunk styling */}
      <div className="flex justify-end mb-4">
        <div className="relative inline-flex rounded-md overflow-hidden border border-[hsl(var(--cyber-blue)/30)] shadow-sm bg-gradient-to-r from-[hsl(var(--space-dark))] to-[hsl(var(--space-void))]">
          {/* Table View Button */}
          <Button
            variant="ghost"
            className={`relative rounded-l-md rounded-r-none border-0 transition-all duration-300 ${viewMode === 'table'
              ? 'data-[theme="cyberpunk"]:shadow-[inset_0_0_10px_rgba(125,249,255,0.1)]'
              : 'text-muted-foreground hover:text-foreground data-[theme="cyberpunk"]:hover:bg-[hsl(var(--cyber-blue)/10)]'
              }`}
            onClick={() => setViewMode('table')}
          >
            {/* Decorative corner accent */}
            {viewMode === 'table' && (
              <>
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue))]"></span>
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue))]"></span>
              </>
            )}
            <span className={`flex items-center ${viewMode === 'table' ? 'text-[hsl(var(--foreground))] font-semibold' : ''}`}>Table View</span>
          </Button>

          {/* Divider */}
          <div className="w-[1px] bg-gradient-to-b from-transparent data-[theme='cyberpunk']:via-[hsl(var(--cyber-blue)/30)] to-transparent"></div>

          {/* Analytics Button */}
          <Button
            variant="ghost"
            className={`relative rounded-r-md rounded-l-none border-0 transition-all duration-300 ${viewMode === 'analytics'
              ? 'data-[theme="cyberpunk"]:bg-[hsl(var(--neon-purple)/5)] data-[theme="cyberpunk"]:shadow-[inset_0_0_10px_rgba(189,147,249,0.1)]'
              : 'text-muted-foreground hover:text-foreground data-[theme="cyberpunk"]:hover:bg-[hsl(var(--neon-purple)/10)]'
              }`}
            onClick={() => setViewMode('analytics')}
          >
            {/* Decorative corner accent */}
            {viewMode === 'analytics' && (
              <>
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l data-[theme='cyberpunk']:border-[hsl(var(--neon-purple))]"></span>
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r data-[theme='cyberpunk']:border-[hsl(var(--neon-purple))]"></span>
              </>
            )}
            <span className={`flex items-center ${viewMode === 'analytics' ? 'text-[hsl(var(--foreground))] font-semibold' : ''}`}>Analytics</span>
          </Button>

          {/* Subtle ambient effect */}
          <div className="absolute inset-0 pointer-events-none data-[theme='cyberpunk']:bg-gradient-to-br data-[theme='cyberpunk']:from-[hsl(var(--cyber-blue)/5)] via-transparent data-[theme='cyberpunk']:to-[hsl(var(--neon-purple)/5)] opacity-30"></div>

          {/* Active indicator line */}
          <div className={`absolute bottom-0 h-[2px] bg-gradient-to-r transition-all duration-300 ${viewMode === 'table'
            ? 'data-[theme="cyberpunk"]:from-[hsl(var(--cyber-blue)/70)] data-[theme="cyberpunk"]:to-[hsl(var(--cyber-blue)/30)] left-0 w-1/2'
            : 'data-[theme="cyberpunk"]:from-[hsl(var(--neon-purple)/30)] data-[theme="cyberpunk"]:to-[hsl(var(--neon-purple)/70)] left-1/2 w-1/2'
            }`}></div>
        </div>
      </div>

      {/* Filters section with cyberpunk styling */}
      <div className="relative p-5 mb-6 bg-panel-gradient rounded-md border border-[hsl(var(--cyber-blue)/15)] shadow-inner overflow-hidden">
        {/* Decorative corner accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(var(--cyber-blue)/60)]"></span>
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(var(--cyber-blue)/60)]"></span>

        {/* Grid pattern with 3% opacity */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--cyber-blue)/20), hsl(var(--cyber-blue)/20) 1px, transparent 1px, transparent 60px), 
                          repeating-linear-gradient(90deg, hsl(var(--cyber-blue)/20), hsl(var(--cyber-blue)/20) 1px, transparent 1px, transparent 60px)`
        }}></div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {/* Search Filter */}
          <div className="relative">
            <Label htmlFor="search" className="text-sm text-glow mb-1.5 inline-block">
              SEARCH_QUERY<span className="text-[hsl(var(--cyber-blue))]">::</span>
            </Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted border-primary/30 focus:ring-primary/30 shadow-sm placeholder:text-muted-foreground/50 transition-all duration-300"
                style={{
                  height: '40px',
                  borderRadius: '4px !important',
                }}
              />
              {/* Subtle highlight effect when focused/filled */}
              {searchQuery && (
                <div className="absolute inset-0 pointer-events-none border border-[hsl(var(--neon-purple)/30)] opacity-70 rounded-md"></div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Label htmlFor="category" className="text-sm text-glow mb-1.5 inline-block">
              CATEGORY<span className="text-[hsl(var(--cyber-blue))]">::</span>
            </Label>
            <Select
              value={category || 'all'}
              onValueChange={(value) => setCategory(value === 'all' ? undefined : value)}
            >
              <SelectTrigger id="category" className="bg-muted border-primary/30 focus:ring-primary/30 shadow-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="border-primary/30">
                <SelectItem value="all" className="focus:bg-accent/20">All Categories</SelectItem>
                {MARKET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="focus:bg-accent/20 capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status" className="text-sm text-glow mb-1.5 inline-block">
              STATUS<span className="text-[hsl(var(--cyber-blue))]">::</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value: 'active' | 'resolved' | 'all') => setStatus(value)}
            >
              <SelectTrigger id="status" className="bg-muted border-primary/30 focus:ring-primary/30 shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-primary/30">
                <SelectItem value="active" className="focus:bg-accent/20">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                    Active
                  </span>
                </SelectItem>
                <SelectItem value="resolved" className="focus:bg-accent/20">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500/80 mr-2"></span>
                    Resolved
                  </span>
                </SelectItem>
                <SelectItem value="all" className="focus:bg-accent/20">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></span>
                    All
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Size Selector */}
          <div>
            <Label htmlFor="page-size" className="text-sm text-glow mb-1.5 inline-block">
              PAGE_SIZE<span className="text-[hsl(var(--cyber-blue))]">::</span>
            </Label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger id="page-size" className="bg-muted border-primary/30 focus:ring-primary/30 shadow-sm">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent className="border-primary/30">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="focus:bg-accent/20">
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading state - Theme-aware style */}
      {isLoading && (
        <div className="text-center py-12 relative">
          {/* Theme-aware loading spinner */}
          <div className="relative mx-auto w-16 h-16">
            {/* Inner spinner - Default with Cyberpunk override */}
            <div className="absolute inset-0 rounded-full border-2 border-foreground/50 data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue)/70)] border-t-transparent animate-spin"></div>

            {/* Middle spinner (counter rotation) - Cyberpunk specific */}
            <div className="absolute inset-1 rounded-full border-2 border-foreground/40 data-[theme='cyberpunk']:border-[hsl(var(--neon-purple)/70)] border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

            {/* Outer spinner - Cyberpunk specific */}
            <div className="absolute inset-2 rounded-full border-2 border-foreground/30 data-[theme='cyberpunk']:border-[hsl(var(--neon-pink)/70)] border-l-transparent animate-spin" style={{ animationDuration: '3s' }}></div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            </div>

            {/* Glow effect - Cyberpunk only */}
            <div className="absolute inset-0 rounded-full data-[theme='cyberpunk']:shadow-[0_0_10px_rgba(125,249,255,0.3)] animate-pulse"></div>
          </div>

          {/* Loading text with typewriter effect */}
          <div className="mt-6 font-mono text-sm text-foreground/80 data-[theme='cyberpunk']:text-[hsl(var(--cyber-blue)/80)]">
            <span className="inline-block animate-pulse">Loading markets</span>
            <span className="inline-block ml-1 animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
            <span className="inline-block animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
            <span className="inline-block animate-pulse" style={{ animationDelay: '0.9s' }}>.</span>
          </div>
        </div>
      )}

      {/* Empty state with theme-aware styling */}
      {!isLoading && marketsResult?.items.length === 0 && (
        <div className="relative rounded-lg overflow-hidden bg-panel-gradient border border-muted/30 data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue)/15)]">
          {/* Decorative corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-destructive/60 data-[theme='cyberpunk']:border-[hsl(var(--neon-red)/60)]"></span>
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-destructive/60 data-[theme='cyberpunk']:border-[hsl(var(--neon-red)/60)]"></span>

          {/* Warning pattern stripes - Cyberpunk only */}
          <div className="absolute inset-0 opacity-5 data-[theme='cyberpunk']:bg-stripes" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--destructive)) 10px, hsl(var(--destructive)) 20px)`
          }}></div>

          <div className="flex flex-col items-center justify-center py-12 px-4 text-center relative z-10">
            {/* Error icon */}
            <div className="w-16 h-16 mb-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-destructive/70 data-[theme='cyberpunk']:border-[hsl(var(--neon-red)/70)] rounded-full flex items-center justify-center">
                  <span className="text-destructive data-[theme='cyberpunk']:text-[hsl(var(--neon-red))] text-2xl font-bold">!</span>
                </div>
              </div>

              {/* Pulsing glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 data-[theme='cyberpunk']:bg-[hsl(var(--neon-red)/10)] animate-pulse"></div>
              </div>
            </div>

            <h3 className="text-xl font-mono text-destructive data-[theme='cyberpunk']:text-[hsl(var(--neon-red)/90)] mb-2">No Results Found</h3>
            <p className="text-muted-foreground max-w-md">No market entities found matching your filter parameters.</p>

            <Button
              variant="outline"
              className="mt-6 relative overflow-hidden group border-destructive/50 hover:border-destructive data-[theme='cyberpunk']:border-[hsl(var(--neon-red)/50)] data-[theme='cyberpunk']:hover:border-[hsl(var(--neon-red))] hover:bg-destructive/10 data-[theme='cyberpunk']:hover:bg-[hsl(var(--neon-red)/10)] text-destructive/80 data-[theme='cyberpunk']:text-[hsl(var(--neon-red)/80)] hover:text-destructive data-[theme='cyberpunk']:hover:text-[hsl(var(--neon-red))]"
              onClick={() => {
                setSearchQuery('')
                setCategory(undefined)
                setStatus('active')
                setSortBy('createdAt')
                setSortDirection('desc')
                updateUrl({
                  category: undefined,
                  search: undefined,
                  status: 'active',
                  sort: 'createdAt',
                  direction: 'desc'
                })
              }}
            >
              {/* Decorative corner accents - Cyberpunk only */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-destructive data-[theme='cyberpunk']:border-[hsl(var(--neon-red))] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-destructive data-[theme='cyberpunk']:border-[hsl(var(--neon-red))] opacity-0 group-hover:opacity-100 transition-opacity"></span>

              {/* Add a subtle shimmer effect - Cyberpunk only */}
              <span className="animate-shimmer absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-destructive/15 data-[theme='cyberpunk']:via-[hsl(var(--neon-red)/15)] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>

              <span className="relative z-10 flex items-center">Reset Filters</span>
            </Button>
          </div>
        </div>
      )}

      {/* Table View with theme-aware styling */}
      {!isLoading && marketsResult?.items && marketsResult?.items?.length > 0 && viewMode === 'table' && (
        <div className="relative rounded-md overflow-hidden bg-panel-gradient border shadow-md">
          {/* Corner accents - Cyberpunk specific */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/30 data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue)/60)]"></span>
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/30 data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue)/60)]"></span>

          {/* Grid pattern with 3% opacity - Cyberpunk specific */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none data-[theme='cyberpunk']:bg-grid" style={{
            backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--primary)/20), hsl(var(--primary)/20) 1px, transparent 1px, transparent 60px), 
                          repeating-linear-gradient(90deg, hsl(var(--primary)/20), hsl(var(--primary)/20) 1px, transparent 1px, transparent 60px)`
          }}></div>

          <div className="relative z-10">
            <Table className="relative">
              <TableHeader>
                <TableRow className="border-b-white bg-[hsl(var(--muted)/70)]">
                  <TableHead className="w-[100px] cursor-pointer font-mono text-sm text-glow" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center group">
                      CREATED
                      <span className="ml-1 transition-transform duration-200 group-hover:text-[hsl(var(--cyber-blue))]">
                        {sortBy === 'createdAt' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-20 group-hover:opacity-70" />
                        )}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[300px] font-mono text-sm text-glow">
                    MARKET_NAME
                  </TableHead>
                  <TableHead className="cursor-pointer font-mono text-sm text-glow" onClick={() => handleSort('endDate')}>
                    <div className="flex items-center group">
                      END_DATE
                      <span className="ml-1 transition-transform duration-200 group-hover:text-[hsl(var(--cyber-blue))]">
                        {sortBy === 'endDate' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-20 group-hover:opacity-70" />
                        )}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="font-mono text-sm text-glow">CATEGORY</TableHead>
                  <TableHead className="cursor-pointer font-mono text-sm text-glow" onClick={() => handleSort('poolAmount')}>
                    <div className="flex items-center group">
                      POOL_SIZE
                      <span className="ml-1 transition-transform duration-200 group-hover:text-[hsl(var(--cyber-blue))]">
                        {sortBy === 'poolAmount' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-20 group-hover:opacity-70" />
                        )}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer font-mono text-sm text-glow" onClick={() => handleSort('participants')}>
                    <div className="flex items-center group">
                      PARTICIPANTS
                      <span className="ml-1 transition-transform duration-200 group-hover:text-[hsl(var(--cyber-blue))]">
                        {sortBy === 'participants' ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-20 group-hover:opacity-70" />
                        )}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="font-mono text-sm text-glow">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketsResult?.items.map((market) => (
                  <TableRow
                    key={market.id}
                    className="group relative cursor-pointer border-b border-primary/10 data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue)/10)] transition-colors duration-150"
                    onClick={() => router.push(`/markets/${market.id}`)}
                  >
                    <TableCell className="whitespace-nowrap font-mono text-muted-foreground">
                      <ClientDate date={market.createdAt} format="medium" />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold group-hover:text-primary data-[theme='cyberpunk']:group-hover:text-[hsl(var(--cyber-blue))] transition-colors duration-150">
                        {market.name}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80 transition-colors duration-150">
                        {market.description}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-muted-foreground">
                      <ClientDate date={market.endDate} format="medium" />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-primary/20 data-[theme='cyberpunk']:border-[hsl(var(--cyber-blue)/20)] bg-muted/20">
                        {market.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-mono ${market.poolAmount > 1000 ? "text-green-500 data-[theme='cyberpunk']:text-[hsl(var(--neon-green))]" : "text-foreground"}`}>
                      <ClientCurrency amount={market.poolAmount} />
                    </TableCell>
                    <TableCell className={`font-mono ${market.participants > 20 ? "text-purple-500 data-[theme='cyberpunk']:text-[hsl(var(--neon-purple))]" : "text-foreground"}`}>
                      <ClientNumber value={market.participants} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="capitalize relative overflow-hidden"
                        variant={
                          market.status === 'active'
                            ? new Date(market.endDate) < new Date()
                              ? 'warning'
                              : 'default'
                            : market.status === 'resolved'
                              ? 'success'
                              : 'destructive'
                        }
                      >
                        {/* Add a subtle shimmer effect */}
                        <span className="animate-shimmer absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"></span>
                        {market.status === 'active' && new Date(market.endDate) < new Date()
                          ? 'Expired'
                          : market.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Enhanced pagination controls */}
            <div className="border-t border-[hsl(var(--cyber-blue)/15)] bg-[hsl(var(--muted)/30)] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page info */}
              <div className="text-sm font-mono text-muted-foreground">
                <span className="bg-muted/50 px-3 py-1 rounded border border-[hsl(var(--cyber-blue)/20)]">
                  PAGE <span className="font-semibold">{currentPage}</span> OF <span className="font-semibold">{Math.ceil((marketsResult.total || 0) / pageSize)}</span>
                </span>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage <= 1}
                  className="relative overflow-hidden group border-[hsl(var(--cyber-blue)/30)] hover:border-[hsl(var(--cyber-blue))] hover:bg-[hsl(var(--cyber-blue)/10)] disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {/* Corner accents */}
                  <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[hsl(var(--cyber-blue))] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[hsl(var(--cyber-blue))] opacity-0 group-hover:opacity-100 transition-opacity"></span>

                  <span className="flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="font-mono text-xs">PREV</span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('next')}
                  disabled={!marketsResult.hasMore}
                  className="relative overflow-hidden group border-[hsl(var(--cyber-blue)/30)] hover:border-[hsl(var(--cyber-blue))] hover:bg-[hsl(var(--cyber-blue)/10)] disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {/* Corner accents */}
                  <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[hsl(var(--cyber-blue))] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[hsl(var(--cyber-blue))] opacity-0 group-hover:opacity-100 transition-opacity"></span>

                  <span className="flex items-center">
                    <span className="font-mono text-xs">NEXT</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </Button>
              </div>

              {/* Count info */}
              <div className="text-sm font-mono text-muted-foreground">
                <span className="bg-muted/50 px-3 py-1 rounded border border-[hsl(var(--cyber-blue)/20)]">
                  <span className="font-semibold">{marketsResult.items.length}</span> OF <span className="font-semibold">{marketsResult.total || 0}</span> MARKETS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View with cyberpunk styling */}
      {!isLoading && marketsResult?.items && marketsResult?.items.length > 0 && viewMode === 'analytics' && (
        <ClientAnalytics
          marketStats={marketStats}
          topMarkets={[...marketsResult.items].sort((a, b) => b.poolAmount - a.poolAmount).slice(0, 5)}
        />
      )}
    </div>
  )
}