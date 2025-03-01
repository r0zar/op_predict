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
    <div className="space-y-10">
      <section>
        <h2 className="text-3xl font-semibold mb-4">Understanding Prediction Markets</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Prediction markets are speculative platforms where participants can make bets on the outcomes of future
          events. These markets leverage the wisdom of the crowd to forecast events, from election results to product
          launches, often with surprising accuracy.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Scale}
            title="Efficient Forecasting"
            description="Prediction markets aggregate information from diverse sources, often outperforming traditional forecasting methods."
          />
          <FeatureCard
            icon={Users}
            title="Crowd Wisdom"
            description="By incentivizing accurate predictions, these markets tap into the collective knowledge of participants."
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">How OP_PREDICT Works</h2>
        <p className="text-lg text-muted-foreground mb-6">
          OP_PREDICT is a decentralized prediction market platform built on blockchain technology. It introduces the
          concept of prediction vaults, allowing for a wide range of markets and ensuring fair play.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={ShieldCheck}
            title="Prediction Vaults"
            description="Anyone can create a prediction vault and become an administrator, overseeing various markets within their vault."
          />
          <FeatureCard
            icon={BarChart3}
            title="Market Creation"
            description="Users can create prediction markets for any imaginable outcome, from elections to technological advancements."
          />
          <FeatureCard
            icon={Coins}
            title="Token Wagering"
            description="Participants make predictions by wagering tokens on possible outcomes, receiving a Prediction Receipt NFT for each wager."
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">The Prediction Process</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Understanding the step-by-step process of how predictions work on OP_PREDICT is crucial for participants.
          Here&apos;s a detailed look at each stage of the prediction journey:
        </p>
        <PredictionProcessTimeline />
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Vault Selection and Community Trust</h2>
        <p className="text-lg text-muted-foreground mb-6">
          A key feature of OP_PREDICT is the ability for users to choose which vault they want to create their markets
          in. This freedom of choice is crucial for maintaining the integrity of the platform.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Users}
            title="Community-Driven Trust"
            description="Users are encouraged to work with vaults hosted by trusted community members, fostering a reputation-based ecosystem."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Natural Selection"
            description="Dishonest vault administrators will find it difficult to attract users, as their reputation for unfair practices will discourage market creation in their vaults."
          />
        </div>
        <p className="text-lg text-muted-foreground mt-6">
          This system of community trust and free choice acts as a powerful deterrent against manipulation and foul
          play, ensuring that the most reliable and fair vaults rise to prominence within the OP_PREDICT ecosystem.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Payout Structure</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg mb-4">When a market is resolved, the winnings are distributed as follows:</p>
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
            <p className="mt-6 text-muted-foreground">
              This structure ensures that the majority of the pot goes to successful predictors, while vault
              administrators are incentivized to create and manage high-quality markets. OP_PREDICT does not charge any
              additional fees, maximizing returns for participants.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Role of Vault Administrators</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Vault administrators play a crucial role in the OP_PREDICT ecosystem. They have significant flexibility in
          managing their vaults, which allows for innovation and specialization in different types of prediction
          markets.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Scale}
            title="Market Management"
            description="Administrators define the terms, conditions, and resolution criteria for markets within their vault."
          />
          <FeatureCard
            icon={Users}
            title="Dispute Resolution"
            description="Each administrator can implement a custom arbitration process tailored to their specific markets."
          />
        </div>
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold">Administrator Responsibilities:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Clearly communicate market rules and resolution criteria</li>
            <li>Implement fair and transparent arbitration processes</li>
            <li>Resolve markets accurately and timely</li>
            <li>Maintain the integrity and reputation of their vault</li>
          </ul>
          <p className="text-muted-foreground">
            This flexibility allows administrators to create specialized vaults for different types of predictions, from
            sports betting to financial forecasts, each with tailored rules and resolution processes.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does OP_PREDICT prevent manipulation or foul play?</AccordionTrigger>
            <AccordionContent>
              OP_PREDICT employs several mechanisms to prevent manipulation and ensure fair play:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>
                  Users have the freedom to choose any vault for creating their markets. This means dishonest vault
                  administrators will struggle to attract users to their vaults.
                </li>
                <li>
                  The platform encourages users to work with vaults hosted by trusted community members, creating a
                  reputation-based system.
                </li>
                <li>
                  All transactions and market resolutions are recorded on the blockchain, ensuring transparency and
                  immutability.
                </li>
                <li>The decentralized nature of the platform makes large-scale manipulation difficult and costly.</li>
                <li>
                  Vault administrators stake their reputation on fair market resolution, as unfair practices will lead
                  to users avoiding their vaults in the future.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What happens if there&apos;s a dispute about the market outcome?</AccordionTrigger>
            <AccordionContent>
              <p>Dispute resolution in OP_PREDICT is flexible and tailored to each vault:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Vault administrators have the freedom to create their own arbitration processes.</li>
                <li>
                  These processes are designed based on what makes the most sense for the specific markets they are
                  hosting.
                </li>
                <li>The arbitration method should be clearly communicated to users when they interact with a vault.</li>
                <li>
                  Common approaches might include:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Community voting</li>
                    <li>Expert panel reviews</li>
                    <li>Multi-stage escalation processes</li>
                    <li>Integration with external oracles or data sources</li>
                  </ul>
                </li>
                <li>
                  Users should review and understand a vault&apos;s dispute resolution process before participating in its
                  markets.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How do vault administrators ensure fair market resolution?</AccordionTrigger>
            <AccordionContent>
              <p>Vault administrators play a crucial role in ensuring fair market resolution:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>They are responsible for clearly defining the terms and conditions of each market.</li>
                <li>Administrators must specify the exact criteria for market resolution when creating a market.</li>
                <li>
                  They can implement various resolution methods, such as:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Manual resolution based on widely accepted outcomes</li>
                    <li>Automated resolution using trusted data feeds or oracles</li>
                    <li>AI-assisted resolution for complex scenarios</li>
                  </ul>
                </li>
                <li>
                  The reputation of vault administrators is tied to their fairness and accuracy in resolving markets.
                </li>
                <li>
                  Users can choose to participate in markets from administrators with a track record of fair
                  resolutions.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>How are prediction markets resolved?</AccordionTrigger>
            <AccordionContent>
              Market resolution is the responsibility of the vault administrator. They can resolve markets manually
              based on real-world outcomes, use automated data feeds for objective events, or employ AI and other
              technologies for more complex resolutions. The method of resolution should be clearly stated when the
              market is created.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>What types of events can be predicted on OP_PREDICT?</AccordionTrigger>
            <AccordionContent>
              OP_PREDICT allows for a wide range of prediction markets, including but not limited to: political events,
              financial markets, sports outcomes, technological advancements, and entertainment industry predictions.
              However, markets that encourage illegal activities or violate ethical standards are prohibited.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}

