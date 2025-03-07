import { SignetDemo } from '@/components/signet-demo';

export default function SignetDemoPage() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Signet Extension Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates integration with the Signet Chrome extension.
          </p>
        </div>
        
        <div className="flex justify-center w-full my-8">
          <SignetDemo />
        </div>
        
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">About Signet</h2>
          <p>
            Signet is a Chrome extension that handles transaction signatures, prediction market operations,
            and user notifications for the OP_PREDICT platform.
          </p>
          <p>
            For more information, see our{' '}
            <a 
              href="/docs/SIGNET-CLIENT.md" 
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Signet Client documentation
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}