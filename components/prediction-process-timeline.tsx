"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { TrendingUp } from "lucide-react"

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

const PredictionIcon = ({ progress }: { progress: number }) => (
  <TrendingUp className="w-6 h-6" style={{ transform: `scale(${progress})` }} />
)

export function PredictionProcessTimeline() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div ref={containerRef} className="py-10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Vertical line */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-primary/20"
            style={{ scaleY: scaleX }}
          />

          {/* Prediction icon */}
          <motion.div
            className="sticky top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-primary"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
          >
            <PredictionIcon progress={useTransform(scrollYProgress, [0, 1], [0.5, 1]) as any} />
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
      <div className="w-5/12" />
      <div className="z-20">
        <div className="flex justify-items-center justify-center w-8 h-8 bg-primary rounded-full">
          <div className="w-3 h-3 bg-background rounded-full" />
        </div>
      </div>
      <motion.div
        className="w-5/12 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
      >
        <div className="p-4 bg-card rounded-lg shadow-md border border-primary/10">
          <span className="font-bold text-primary">Step {event.step}</span>
          <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
          <p className="text-muted-foreground">{event.description}</p>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
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

