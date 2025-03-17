"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface FilterControlsProps {
  categories: string[]
  formats: string[]
}

export function FilterControls({ categories, formats }: FilterControlsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [format, setFormat] = useState("all")
  const [sortBy, setSortBy] = useState("endDate")
  
  // These state changes would typically trigger a data fetch or filter application
  // For now they just update the local state
  
  return (
    <div className="relative p-5 mb-6 bg-panel-gradient rounded-md border shadow-inner overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {/* Search Filter */}
        <div className="relative">
          <Label htmlFor="search" className="text-sm mb-1.5 inline-block">
            SEARCH
          </Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Search games..."
              className="bg-muted shadow-sm placeholder:text-muted-foreground/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <Label htmlFor="category" className="text-sm mb-1.5 inline-block">
            STATUS
          </Label>
          <Select 
            defaultValue={category}
            onValueChange={setCategory}
          >
            <SelectTrigger id="category" className="bg-muted shadow-sm">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Format Filter */}
        <div>
          <Label htmlFor="format" className="text-sm mb-1.5 inline-block">
            FORMAT
          </Label>
          <Select 
            defaultValue={format}
            onValueChange={setFormat}
          >
            <SelectTrigger id="format" className="bg-muted shadow-sm">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {formats.map((formatOption) => (
                <SelectItem key={formatOption} value={formatOption} className="capitalize">
                  {formatOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sort Order */}
        <div>
          <Label htmlFor="sort" className="text-sm mb-1.5 inline-block">
            SORT BY
          </Label>
          <Select 
            defaultValue={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger id="sort" className="bg-muted shadow-sm">
              <SelectValue placeholder="End Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="endDate">End Date</SelectItem>
              <SelectItem value="poolAmount">Pool Size</SelectItem>
              <SelectItem value="participants">Participants</SelectItem>
              <SelectItem value="createdAt">Create Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}