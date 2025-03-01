import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Coins, type LucideIcon, Scale, ShieldCheck, Users } from "lucide-react"
import { PredictionProcessTimeline } from "@/components/prediction-process-timeline"

const FeatureCard = ({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex justify-items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

export function HowItWorksContent() {
  return (
    <div className="space-y-20 mb-64">
      <section className="border-b border-primary/10">
        <h2 className="text-3xl font-semibold mb-4">Understanding Prediction Markets</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Prediction markets harness collective intelligence to forecast future events with remarkable accuracy. By participating,
          you become part of a dynamic ecosystem where knowledge is valued and rewarded.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Scale}
            title="Efficient Forecasting"
            description="These markets aggregate diverse perspectives and insights, often outperforming traditional forecasting methods by tapping into distributed knowledge."
          />
          <FeatureCard
            icon={Users}
            title="Collective Wisdom"
            description="Your unique insights contribute to a powerful network effect—the more participants share their knowledge, the more accurate the predictions become."
          />
        </div>
      </section>

      <section className="border-b border-border/50 pb-24">
        <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground mb-6">
          This platform empowers you to create, participate in, and benefit from decentralized prediction markets.
          The innovative vault system puts control in your hands while ensuring transparency and fairness.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={ShieldCheck}
            title="Prediction Vaults"
            description="Create your own prediction vault and become an administrator, shaping the future of forecasting in your areas of expertise."
          />
          <FeatureCard
            icon={BarChart3}
            title="Market Creation"
            description="Launch prediction markets on topics you're passionate about—from global events to niche interests—and attract like-minded participants."
          />
          <FeatureCard
            icon={Coins}
            title="Token Wagering"
            description="Back your insights with tokens and receive unique NFT receipts for each prediction, creating a verifiable record of your participation."
          />
        </div>
      </section>

      <section className="border-b border-border/50 pb-24">
        <h2 className="text-3xl font-semibold mb-4">The Prediction Process</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Success begins with understanding the journey. Follow this step-by-step guide to navigate the prediction
          process and maximize your potential for positive outcomes:
        </p>
        <PredictionProcessTimeline />
      </section>

      <section className="border-b border-border/50 pb-24">
        <h2 className="text-3xl font-semibold mb-4">Community Trust & Vault Selection</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Your freedom to choose which vaults to participate in creates a natural ecosystem where integrity and
          reputation matter. This approach empowers you while protecting the community.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Users}
            title="Trust-Based Ecosystem"
            description="Engage with vaults managed by trusted community members whose values align with yours, fostering a network built on mutual respect."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Merit-Based Selection"
            description="Your choices shape the marketplace—administrators who demonstrate fairness and transparency naturally attract more participants."
          />
        </div>
        <p className="text-lg text-muted-foreground mt-6">
          This self-regulating system of community trust and free choice creates powerful incentives for honest
          behavior, ensuring that reliability and fairness become the foundation of successful vaults.
        </p>
      </section>

      <section className="border-b border-border/50 pb-24">
        <h2 className="text-3xl font-semibold mb-4">Payout Structure</h2>
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="space-y-4 md:col-span-3">
            <p className="text-lg">
              Value flows to those who contribute most—predictors who get it right.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>95% to winning participants</li>
              <li>5% to vault administrators</li>
              <li>Zero platform fees</li>
            </ul>
            <p className="text-muted-foreground">
              This aligns incentives across the ecosystem, rewarding accuracy and good management.
            </p>
          </div>

          <Card className="md:col-span-2 mr-auto min-w-[360px]">
            <CardHeader>
              <CardTitle>Distribution of Winnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between justify-items-center border-b border-border pb-2">
                  <span className="font-semibold">Winning Participants</span>
                  <span className="text-2xl font-bold text-primary">95%</span>
                </div>
                <div className="flex justify-between justify-items-center border-b border-border pb-2">
                  <span className="font-semibold">Vault Administrator</span>
                  <span className="text-2xl font-bold text-primary">5%</span>
                </div>
                <div className="flex justify-between justify-items-center pt-2">
                  <span className="font-semibold">Platform Fees</span>
                  <span className="text-2xl font-bold text-primary">0%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b border-border/50 pb-24">
        <h2 className="text-3xl font-semibold mb-4">Role of Vault Administrators</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Vault administrators serve as stewards of their prediction communities. Their flexibility in management
          allows for innovation and specialization in different markets.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Scale}
            title="Market Management"
            description="Administrators define clear terms and resolution criteria, creating a foundation of trust for all participants."
          />
          <FeatureCard
            icon={Users}
            title="Dispute Resolution"
            description="Each administrator implements custom arbitration processes tailored to their specific markets, ensuring fair outcomes."
          />
        </div>
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold">Administrator Responsibilities:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Communicate market rules with clarity and transparency</li>
            <li>Implement fair and accessible arbitration processes</li>
            <li>Resolve markets accurately and promptly</li>
            <li>Build and maintain community trust</li>
          </ul>
          <p className="text-muted-foreground">
            This flexibility enables the creation of specialized vaults for diverse interests—from sports to finance to
            technology—each with tailored rules that serve their unique communities.
          </p>
        </div>
      </section>

      <section className="">
        <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does the platform prevent manipulation or foul play?</AccordionTrigger>
            <AccordionContent>
              Several mechanisms work together to ensure fairness and integrity:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>
                  Your freedom to choose any vault creates natural accountability—dishonest administrators quickly lose participants.
                </li>
                <li>
                  The community naturally gravitates toward trusted members with proven track records.
                </li>
                <li>
                  Blockchain technology ensures all transactions and resolutions are transparent and immutable.
                </li>
                <li>The decentralized structure makes large-scale manipulation both difficult and costly.</li>
                <li>
                  Administrators stake their reputation on fair market resolution, creating powerful incentives for honest behavior.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What happens if there&apos;s a dispute about the market outcome?</AccordionTrigger>
            <AccordionContent>
              <p>Dispute resolution is tailored to each vault's unique needs:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Administrators design arbitration processes that best serve their specific communities.</li>
                <li>
                  These processes are clearly communicated before you participate in any market.
                </li>
                <li>Common approaches include:</li>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Community voting systems</li>
                  <li>Expert panel reviews</li>
                  <li>Multi-stage escalation processes</li>
                  <li>Integration with trusted external data sources</li>
                </ul>
                <li>
                  Before participating, take time to understand a vault's dispute resolution approach to ensure it aligns with your expectations.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How do administrators ensure fair market resolution?</AccordionTrigger>
            <AccordionContent>
              <p>Administrators build trust through consistent fairness:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>They clearly define terms and conditions when creating each market.</li>
                <li>Resolution criteria are specified upfront, eliminating ambiguity.</li>
                <li>
                  Resolution methods may include:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Manual resolution based on widely accepted outcomes</li>
                    <li>Automated resolution using trusted data feeds</li>
                    <li>AI-assisted resolution for complex scenarios</li>
                  </ul>
                </li>
                <li>
                  An administrator's reputation—their most valuable asset—depends on fair and accurate resolutions.
                </li>
                <li>
                  You can choose to participate with administrators who have demonstrated consistent fairness.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>How are prediction markets resolved?</AccordionTrigger>
            <AccordionContent>
              Vault administrators resolve markets according to the criteria established at creation. Methods range from manual resolution
              based on real-world outcomes to automated data feeds for objective events. The specific resolution approach is always
              clearly communicated when the market is created, ensuring transparency for all participants.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>What types of events can be predicted on the platform?</AccordionTrigger>
            <AccordionContent>
              The platform supports a diverse range of prediction markets, including political events, financial outcomes,
              sports results, technological developments, and entertainment industry forecasts. This flexibility allows you to
              leverage your knowledge in areas where you have unique insights. Markets promoting illegal activities or violating
              ethical standards are not permitted.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}

