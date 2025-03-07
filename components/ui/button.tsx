import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex justify-items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-transparent border border-cyber-blue/50 text-cyber-blue hover:shadow-[0_0_10px_rgba(125,249,255,0.15)] hover:scale-102 active:scale-98",
        destructive:
          "bg-transparent border border-neon-red/50 text-neon-red hover:shadow-[0_0_10px_rgba(255,85,85,0.15)] hover:scale-102 active:scale-98",
        outline:
          "border border-input bg-background hover:bg-cyber-blue/10 hover:text-cyber-blue hover:border-cyber-blue/30",
        secondary:
          "bg-transparent border border-neon-purple/50 text-neon-purple hover:shadow-[0_0_10px_rgba(189,147,249,0.15)] hover:scale-102 active:scale-98",
        ghost: 
          "hover:bg-cyber-blue/5 hover:text-cyber-blue",
        link: 
          "text-cyber-blue underline-offset-4 hover:underline",
        success:
          "bg-transparent border border-neon-green/50 text-neon-green hover:shadow-[0_0_10px_rgba(80,250,123,0.15)] hover:scale-102 active:scale-98",
        warning:
          "bg-transparent border border-neon-orange/50 text-neon-orange hover:shadow-[0_0_10px_rgba(255,184,108,0.15)] hover:scale-102 active:scale-98",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const glowClass = glow ? 
      variant === 'destructive' ? 'text-glow-red' :
      variant === 'secondary' ? 'text-glow-purple' :
      variant === 'success' ? 'text-glow-green' :
      variant === 'warning' ? 'text-glow-orange' :
      'text-glow' : '';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), glowClass)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }