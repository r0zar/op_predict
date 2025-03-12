import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignetOnboarding } from './signet-onboarding';

export default async function OnboardingPage() {
  const user = await currentUser();

  // Redirect if not signed in
  if (!user) {
    redirect('/');
  }

  // Check if user already has a Stacks address
  const hasStacksAddress = user.publicMetadata?.stacksAddress;

  // If user already has a Stacks address, redirect to dashboard
  // if (hasStacksAddress) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <SignetOnboarding username={user.username || user.firstName || 'there'} />
    </div>
  );
}