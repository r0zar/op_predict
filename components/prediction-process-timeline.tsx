"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/src/utils"

const timelineEvents = [
  {
    step: 1,
    title: "Create a Prediction Vault",
    description: "A user creates a prediction vault and becomes its administrator.",
    details:
      "Vault administrators have the power to oversee and manage various markets within their vault, setting the stage for diverse prediction opportunities.",
  },
  {
    step: 2,
    title: "Create Prediction Markets",
    description: "Within the vault, prediction markets are created for various events.",
    details:
      "Markets can cover a wide range of topics, from political outcomes to technological advancements, allowing users to leverage their knowledge and insights.",
  },
  {
    step: 3,
    title: "Place Predictions",
    description: "Participants wager tokens on their predicted outcomes.",
    details:
      "Users analyze available information and place their bets, contributing to the collective wisdom of the market.",
  },
  {
    step: 4,
    title: "Receive Prediction Receipt NFTs",
    description: "Each wager is represented by a Prediction Receipt NFT.",
    details:
      "These NFTs serve as proof of participation and are crucial for claiming winnings if the prediction is correct.",
  },
  {
    step: 5,
    title: "Market Resolution",
    description: "After the event occurs, the administrator resolves the market.",
    details: "The outcome is determined based on real-world events, and the market is closed for further predictions.",
  },
  {
    step: 6,
    title: "Claim Winnings",
    description: "Winners can redeem their Receipt NFTs for a share of the pot.",
    details:
      "Successful predictors receive their winnings, with 95% of the pot distributed among them and 5% going to the vault administrator.",
  },
]

export function PredictionProcessTimeline() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Simple scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 90%", "end 90%"],
  })

  // Add spring physics to make the animation smoother
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Create pulsing effect with yellow tones
  const pulseOpacity = useTransform(
    smoothProgress,
    (value) => 0.7 + Math.sin(value * 10) * 0.15
  )

  // Create color transform for yellow highlight
  const lineColor = useTransform(
    smoothProgress,
    (value) => {
      const pulseValue = Math.sin(value * 12) * 0.5 + 0.5;
      return `rgba(255, 165, 0, ${pulseValue * 0.5})`;
    }
  )

  // Set visibility when timeline comes into view
  useEffect(() => {
    // Implementation of useEffect
  }, [smoothProgress])

  return (
    <div ref={containerRef} className="py-10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Vertical line */}
          <motion.div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-primary/20"
            style={{
              height: expandedEvent === timelineEvents.length - 1
                ? "calc(100% - 235px)" // Shorter when last item is expanded
                : "calc(100% - 140px)",
              top: "30px",
              transition: "height 0.3s ease" // Add smooth transition for height changes
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 5 }}
          >
            <motion.div
              className="w-full bg-primary animate-pulse"
              style={{
                height: "100%",
                scaleY: smoothProgress,
                opacity: smoothProgress,
                transformOrigin: "top",
                boxShadow: `0 0 8px ${lineColor}`
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              {/* Pulsing glow overlay */}
              <motion.div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: "100%",
                  scaleY: smoothProgress,
                  opacity: pulseOpacity,
                  background: "linear-gradient(to bottom, rgba(255,165,0,0.2), rgba(255,140,0,0.1))",
                  transformOrigin: "top",
                  borderRadius: "4px"
                }}
              />
            </motion.div>
          </motion.div>

          {timelineEvents.map((event, index) => (
            <TimelineEvent
              key={event.step}
              event={event}
              index={index}
              isExpanded={expandedEvent === index}
              onToggle={() => setExpandedEvent(expandedEvent === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineEvent({
  event,
  index,
  isExpanded,
  onToggle,
}: {
  event: (typeof timelineEvents)[0]
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <motion.div
      ref={ref}
      className={`mb-8 flex justify-between justify-items-center w-full ${index % 2 === 0 ? "flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <div className="w-4/12 md:w-5/12" />
      <div className="z-20">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
          <div className="w-3 h-3 bg-background rounded-full flex-shrink-0" />
        </div>
      </div>
      <motion.div
        className={cn("w-5/12 cursor-pointer")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggle();
            e.preventDefault();
          }
        }}
      >
        <div className={cn("p-4 bg-card rounded-lg shadow-md border border-primary/10 hover:border-primary/50 transition-all duration-300", isExpanded && "hover:border-primary/90 border-primary/50")}>
          <span className="font-bold text-primary">Step {event.step}</span>
          <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
          <p className="text-muted-foreground">{event.description}</p>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-sm text-muted-foreground">{event.details}</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

