import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { BarChart2 } from "lucide-react"
import Link from "next/link"
import { SectionHeader } from "./section-header"

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

// Categories section
export function CategoriesSection() {
    return (
        <section className="mb-8">
            <SectionHeader
                title="Explore by Category"
                icon={BarChart2}
            />
            <ScrollArea className="w-full">
                <div className="flex space-x-2 pb-2">
                    {categories.map((category) => (
                        <Link key={category} href={`/markets?category=${category}`} className="flex-shrink-0">
                            <Button variant="outline" size="sm">
                                {category}
                            </Button>
                        </Link>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </section>
    )
} 