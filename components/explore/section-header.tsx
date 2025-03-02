import Link from "next/link"
import { ChevronRight } from "lucide-react"

// Section header with view all link
export function SectionHeader({
    title,
    icon: Icon,
    viewAllHref
}: {
    title: string;
    icon: any;
    viewAllHref?: string;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            {viewAllHref && (
                <Link href={viewAllHref} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <span>View all</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            )}
        </div>
    )
} 