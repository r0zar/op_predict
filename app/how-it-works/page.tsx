import type { Metadata } from "next"
import { HowItWorksContent } from "@/components/how-it-works-content"

export const metadata: Metadata = {
  title: "How It Works | OP_PREDICT",
  description: "Learn about prediction markets and how OP_PREDICT operates.",
}

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">How It Works</h1>
      <HowItWorksContent />
    </div>
  )
}

