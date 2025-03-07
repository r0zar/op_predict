import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex justify-items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 items-center",
  {
    variants: {
      variant: {
        default:
          "border-cyber-blue/50 bg-cyber-blue/10 text-cyber-blue shadow-cyber-sm",
        primary:
          "border-neon-pink/50 bg-neon-pink/10 text-neon-pink",
        secondary:
          "border-neon-purple/50 bg-neon-purple/10 text-neon-purple",
        destructive:
          "border-neon-red/50 bg-neon-red/10 text-neon-red",
        success:
          "border-neon-green/50 bg-neon-green/10 text-neon-green",
        warning:
          "border-neon-orange/50 bg-neon-orange/10 text-neon-orange",
        outline:
          "border-dark-steel bg-transparent text-foreground",
      },
      glow: {
        true: "text-glow",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      glow: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, glow, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, glow }), className)} {...props} />
  )
}

export { Badge, badgeVariants }