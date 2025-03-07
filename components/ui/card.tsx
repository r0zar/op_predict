import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tilt?: boolean
  glowHover?: boolean
  cornerAccents?: boolean
  variant?: 'default' | 'cyber' | 'panel'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tilt = false, glowHover = false, cornerAccents = false, variant = 'default', ...props }, ref) => {
    const baseClasses = "rounded-lg border text-card-foreground shadow transition-all duration-medium";
    
    const variantClasses = 
      variant === 'cyber' ? 'bg-cyber-gradient border-cyber-blue/30' :
      variant === 'panel' ? 'bg-panel-gradient border-cyber-blue/20' :
      'bg-card border-input'; 
    
    const tiltClasses = tilt ? 'tilt-card' : '';
    const glowClasses = glowHover ? 'glow-effect' : '';
    const cornerClasses = cornerAccents ? 'corner-accents' : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses,
          tiltClasses,
          glowClasses,
          cornerClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glow?: 'cyber' | 'purple' | 'pink' | 'none' }
>(({ className, glow = 'none', ...props }, ref) => {
  const glowClass = 
    glow === 'cyber' ? 'text-glow text-cyber-blue' : 
    glow === 'purple' ? 'text-glow-purple text-neon-purple' : 
    glow === 'pink' ? 'text-glow-pink text-neon-pink' : 
    '';
  
  return (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", glowClass, className)}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }