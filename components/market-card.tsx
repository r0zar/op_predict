import Link from "next/link"
import { Clock, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface MarketCardProps {
  title: string
  participants: number
  poolAmount: string
  yesPercentage: number
  category: string
  endDate: string
  disabled?: boolean
}

export function MarketCard({ title, participants, poolAmount, yesPercentage, category, endDate, disabled }: MarketCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-items-center justify-between">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {category}
          </Badge>
          <div className="flex justify-items-center text-sm text-muted-foreground items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>Ends: {endDate}</span>
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{participants.toLocaleString()} participants</span>
          <span className="text-primary font-medium">{poolAmount} pool</span>
        </div>
        <div className="mt-4 flex justify-items-center justify-between">
          <div>
            <div className="text-sm font-medium">Yes</div>
            <div className="text-xl font-bold text-primary">{yesPercentage}%</div>
          </div>
          <div>
            <div className="text-sm font-medium">No</div>
            <div className="text-xl font-bold text-destructive">{100 - yesPercentage}%</div>
          </div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${yesPercentage}%` }}></div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button className="w-full" variant="outline" disabled={disabled}>
          <Link href={`/market/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-"))}`}>
            View Market
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

