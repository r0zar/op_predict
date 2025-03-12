import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex justify-items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 items-center",
  {
    variants: {
      variant: {
        default:
          "border-primary/50 bg-primary/10 text-primary shadow-sm data-[theme='cyberpunk']:border-cyber-blue/50 data-[theme='cyberpunk']:bg-cyber-blue/10 data-[theme='cyberpunk']:text-cyber-blue data-[theme='cyberpunk']:shadow-cyber-sm",
        primary:
          "border-accent/50 bg-accent/10 text-accent data-[theme='cyberpunk']:border-neon-pink/50 data-[theme='cyberpunk']:bg-neon-pink/10 data-[theme='cyberpunk']:text-neon-pink",
        secondary:
          "border-secondary/50 bg-secondary/10 text-secondary data-[theme='cyberpunk']:border-neon-purple/50 data-[theme='cyberpunk']:bg-neon-purple/10 data-[theme='cyberpunk']:text-neon-purple",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive data-[theme='cyberpunk']:border-neon-red/50 data-[theme='cyberpunk']:bg-neon-red/10 data-[theme='cyberpunk']:text-neon-red",
        success:
          "border-green-500/50 bg-green-500/10 text-green-500 data-[theme='cyberpunk']:border-neon-green/50 data-[theme='cyberpunk']:bg-neon-green/10 data-[theme='cyberpunk']:text-neon-green",
        warning:
          "border-orange-500/50 bg-orange-500/10 text-orange-500 data-[theme='cyberpunk']:border-neon-orange/50 data-[theme='cyberpunk']:bg-neon-orange/10 data-[theme='cyberpunk']:text-neon-orange",
        outline:
          "border-muted-foreground/30 bg-transparent text-foreground data-[theme='cyberpunk']:border-dark-steel",
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