import { Metadata } from 'next';
import LaunchpadUI from './launchpad-ui';

export const metadata: Metadata = {
  title: 'Deploy Prediction Market | OP_PREDICT',
  description: 'Deploy your own prediction market contracts and become a market administrator',
};

export default async function LaunchpadPage() {
  return (
    <div className="container py-8 px-4 md:px-8 mx-auto max-w-7xl">
      <LaunchpadUI />
    </div>
  );
}