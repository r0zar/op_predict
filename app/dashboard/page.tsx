import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  BarChart3,
  History
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getStacksBalance(address: string): Promise<number> {
  try {
    // Make a request to get the balance from the contract
    // This is a simplified version - you would need to implement the actual contract call
    // Similar to fetchContractBalance in the userBalanceStore.ts file
    return 1000; // Placeholder balance
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return 0;
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();

  // Redirect if not signed in
  if (!userId) {
    redirect('ign-in');
  }

  const user = await currentUser();

  // Check if user has a Stacks address
  const stacksAddress = user?.publicMetadata?.stacksAddress as string | undefined;

  // If no Stacks address, redirect to onboarding
  if (!stacksAddress) {
    redirect('/onboarding');
  }

  // Get balance from Stacks contract
  const balance = stacksAddress ? await getStacksBalance(stacksAddress) : 0;

  // Format the address for display
  const formattedAddress = stacksAddress
    ? `${stacksAddress.slice(0, 6)}...${stacksAddress.slice(-4)}`
    : '';

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <CardDescription className="flex items-center">
              <Wallet className="h-4 w-4 mr-1" />
              {formattedAddress}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Using Stacks Blockchain
            </p>
          </CardContent>
          <CardFooter className="pt-1">
            <Link href="/settings">
              <Button variant="outline" size="sm">Manage Wallet</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Active Predictions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <CardDescription>
              <TrendingUp className="h-4 w-4 mr-1 inline" />
              Current bets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              $0 total staked
            </p>
          </CardContent>
          <CardFooter className="pt-1">
            <Link href="/markets">
              <Button variant="outline" size="sm">Place Prediction</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Accuracy Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Accuracy</CardTitle>
            <CardDescription>
              <BarChart3 className="h-4 w-4 mr-1 inline" />
              Prediction success rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">
              Make predictions to build your score
            </p>
          </CardContent>
          <CardFooter className="pt-1">
            <Link href="/markets">
              <Button variant="outline" size="sm">Explore Markets</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <CardDescription>
              <History className="h-4 w-4 mr-1 inline" />
              Last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              No recent activity
            </p>
          </CardContent>
          <CardFooter className="pt-1">
            <Link href="/history">
              <Button variant="outline" size="sm">View History</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recommended Markets Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Recommended Markets</h2>
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-lg mb-4">Ready to make your first prediction?</p>
          <Link href="/markets">
            <Button size="lg">
              Explore Markets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}