'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Shield,
  Check,
  X,
  ArrowRight,
  Loader2,
  Download,
  Key,
  Zap,
  Lock,
} from 'lucide-react';
import { updateStacksAddress } from '@/app/actions/user-actions';
import styles from './animations.module.css';

interface SignetOnboardingProps {
  username: string;
}

type OnboardingStep = 'welcome' | 'checkExtension' | 'getStatus' | 'connecting' | 'success';

let signet;

export function SignetOnboarding({ username }: SignetOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(null);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only run client-side effects after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function initSignet() {
      try {
        signet = await require('signet-sdk');

        // Set up message subscription
        signet.subscribe((message) => {
          console.log('Message from Signet:', message);

          if (message.type === signet.MessageType.CHECK_EXTENSION_INSTALLED) {
          }

          if (message.type === signet.MessageType.GET_STATUS) {

            // If we got status, we can proceed
            if (message.data?.connected) {
              // Get signer address if available
              const subnets = signet.getSubnetIds(message.data);
              if (subnets.length > 0 && message.data[subnets[0]]?.signer) {
                setSignerAddress(message.data[subnets[0]].signer);
              }
            }
          }

          // When user responds to notification
          if (message.type === 'response') {
          }
        });
      } catch (error) {
        console.error('Failed to initialize Signet:', error);
      }
    }

    initSignet();
  }, []);

  // Automatically save the address when we have it
  useEffect(() => {
    if (signerAddress) {
      saveAddressToClerk();
    }
  }, [signerAddress]);

  async function checkExtension() {
    if (!signet) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await signet.checkExtensionInstalled();
      setExtensionInstalled(result.installed);

      if (result.installed) {
        setStep('checkExtension');
      }
    } catch (error) {
      console.error('Error checking extension:', error);
      setExtensionInstalled(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function connectWallet() {
    if (!signet) {
      return;
    }

    setIsLoading(true);
    setStep('getStatus');

    try {
      const status = await signet.getSignetStatus();
      const subnetIds = signet.getSubnetIds(status);

      if (subnetIds.length > 0 && status[subnetIds[0]]?.signer) {
        setSignerAddress(status[subnetIds[0]].signer);
        setStep('connecting');
      }
    } catch (error) {
      console.error('Error getting status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function saveAddressToClerk() {
    if (!signerAddress) return;

    setIsLoading(true);
    setStep('connecting');

    try {
      // Use FormData to submit the address
      const formData = new FormData();
      formData.append('stacksAddress', signerAddress);

      const result = await updateStacksAddress(formData);

      if (result.success) {
        setStep('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/markets');
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Enhanced backdrop with gradients */}
      <div className="fixed inset-0 bg-black" />

      {/* Matrix digital rain background - only rendered client-side after mount */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {isMounted && [...Array(60)].map((_, i) => {
          // Generate random characters outside of the render for better performance
          const chars = Array(20).fill(0).map(() =>
            String.fromCharCode(33 + Math.floor(Math.random() * 94))
          ).join('');

          return (
            <motion.div
              key={i}
              className="absolute font-mono text-primary/30 text-sm opacity-20 select-none"
              style={{
                left: `${i * 1.8}%`,
                top: -30,
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                letterSpacing: '-6px',
              }}
              initial={{ y: -100 }}
              animate={{
                y: window.innerHeight + 100,
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: 6 + (Math.random() * 8),
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: i * 0.1
              }}
            >
              {chars}
            </motion.div>
          );
        })}
      </div>

      {/* Rich gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Subtle scan line effect */}
      <div className={`fixed inset-0 pointer-events-none ${styles.scanLine}`}></div>

      {/* Radial gradient spots for futuristic feel */}
      <motion.div
        className="fixed top-[15%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(125,249,255,0.08)_0%,transparent_70%)] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="fixed bottom-[10%] left-[5%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(255,77,109,0.08)_0%,transparent_70%)] pointer-events-none"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2
        }}
      />

      {/* Step indicators on the side */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3">
        <div className={`bg-black/40 backdrop-blur-sm rounded-full py-2 px-4 text-xs border border-primary/30 text-primary font-medium`}>
          {step === 'welcome' && 'INITIALIZING'}
          {step === 'checkExtension' && 'EXTENSION DETECTED'}
          {step === 'getStatus' && 'CONNECTING'}
          {step === 'connecting' && 'SYNCING DATA'}
          {step === 'success' && 'CONNECTED'}
        </div>

        <div className="flex flex-col items-center gap-4 py-4 px-3 bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20">
          {['welcome', 'checkExtension', 'getStatus', 'connecting', 'success'].map((s, i) => (
            <motion.div key={s} className="flex flex-col items-center">
              <motion.div
                className={`h-3 w-3 rounded-full ${['welcome', 'checkExtension', 'getStatus', 'connecting', 'success'].indexOf(step) >= i
                  ? 'bg-primary'
                  : 'bg-gray-700'
                  }`}
                animate={{
                  scale: step === s ? [1, 1.5, 1] : 1,
                  backgroundColor: ['welcome', 'checkExtension', 'getStatus', 'connecting', 'success'].indexOf(step) >= i
                    ? 'rgb(125, 249, 255)'
                    : 'rgb(55, 65, 81)'
                }}
                transition={{ duration: 0.5, repeat: step === s ? Infinity : 0, repeatDelay: 1 }}
              />
              {i < 4 && (
                <div className="h-8 w-0.5 bg-gray-700 mt-1"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container max-w-5xl mx-auto pt-[20rem] pb-20 px-4 relative z-20">
        {/* Main content area with integrated layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Text content - left side */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full z-10 flex"
          >
            {step === 'welcome' && (
              <div className="space-y-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-blue-400">
                    Welcome
                  </h1>
                  <h2 className="text-3xl font-bold text-white/90 mb-6">{username}</h2>
                </motion.div>

                {/* Main text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <p className="text-xl text-gray-300 leading-relaxed backdrop-blur-sm bg-black/20 rounded-lg p-4 border-l-4 border-primary/40">
                    Connect your Signet wallet to access on-chain prediction markets
                  </p>
                </motion.div>
                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10 w-full"
                >
                  <Button
                    onClick={checkExtension}
                    disabled={isLoading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-black font-bold py-6 text-xl relative overflow-hidden items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        INITIALIZING...
                      </>
                    ) : (
                      <>
                        ACTIVATE
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                    <motion.span
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: "-100%" }}
                      animate={{ x: ["120%", "-120%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                        repeatDelay: 1.5
                      }}
                    />
                  </Button>
                </motion.div>
              </div>
            )}

            {step !== 'welcome' && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {step === 'checkExtension' && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold mb-4">Signet Extension</h2>

                      {extensionInstalled ? (
                        <>
                          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                            <div className="flex items-center gap-3">
                              <Check className="w-6 h-6 text-green-500" />
                              <h3 className="font-medium text-green-400">Extension Detected</h3>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 ml-9">Ready to connect with your wallet</p>
                          </div>

                          <p className="text-gray-300">
                            Click the button below to connect your wallet. You'll need to approve the connection request in the Signet extension.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                            <div className="flex items-center gap-3">
                              <X className="w-6 h-6 text-red-500" />
                              <h3 className="font-medium text-red-400">Extension Not Found</h3>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 ml-9">Please install the Signet extension</p>
                          </div>

                          <p className="text-gray-300">
                            The Signet extension is required to connect your wallet. Install it from your browser's extension store.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={'https://signet-omega.vercel.app/download.html'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-md text-lg font-medium bg-primary text-black hover:bg-primary/90 flex-1"
                            >
                              <Download className="h-5 w-5" />
                              Install Signet
                            </a>

                            <Button
                              onClick={checkExtension}
                              variant="outline"
                              disabled={isLoading}
                              className="flex-1 items-center"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                "Check Again"
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {step === 'getStatus' && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold mb-4">Connecting</h2>
                      <p className="text-gray-300">
                        Establishing a secure connection to your wallet.
                      </p>

                      {false && (
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mt-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <h4 className="font-medium">Approval Required</h4>
                          </div>
                          <p className="text-sm text-gray-300">
                            Please approve the connection request in the Signet extension.
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="w-full mt-4 items-center"
                      >
                        Skip for now
                      </Button>
                    </div>
                  )}

                  {step === 'connecting' && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold mb-4">Almost Done</h2>
                      <p className="text-gray-300 mb-4">
                        Linking your wallet to your account.
                      </p>

                      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-yellow-400" />
                          <h3 className="font-medium text-yellow-400">Sign-in Required</h3>
                        </div>
                        <p className="text-sm text-gray-300 mt-2 ml-9">
                          Make sure you are signed into your wallet in the Signet extension to complete this step.
                        </p>
                      </div>

                      {signerAddress ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm text-gray-400 mb-1">Your Stacks Address</h3>
                            <div className="p-3 bg-black/50 rounded-lg border border-primary/20 text-sm">
                              <code className="text-primary break-all">
                                {signerAddress}
                              </code>
                            </div>
                          </div>

                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2 }}
                              className="h-full bg-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Loader2 className="w-6 h-6 text-yellow-400" />
                              </motion.div>
                              <h3 className="font-medium text-yellow-400">Waiting for Connection</h3>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 ml-9">No wallet address detected yet</p>
                          </div>

                          <Button
                            onClick={() => {
                              setStep('checkExtension');
                              setIsLoading(false);
                            }}
                            className="w-full bg-primary/80 hover:bg-primary text-black font-medium py-2 relative overflow-hidden flex items-center justify-center gap-2"
                          >
                            Try Again
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'success' && (
                    <div className="space-y-6">
                      <div className="relative">
                        <h2 className={`text-4xl font-bold mb-4 ${styles.glitchEffect}`}>CONNECTED</h2>
                        <motion.div
                          className="absolute -bottom-2 left-0 h-[1px] bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>

                      <p className="text-gray-300 mb-4 bg-black/20 backdrop-blur-sm p-3 border-l-2 border-green-500/50">
                        Your wallet has been successfully connected to OP Predict.
                      </p>

                      <div className={`bg-green-500/10 p-6 rounded-lg border border-green-500/30 relative overflow-hidden ${styles.glowingBorder}`}>
                        {/* Matrix-style scan line */}
                        <motion.div
                          className="absolute left-0 h-[2px] w-full bg-green-500/40"
                          initial={{ top: -10 }}
                          animate={{ top: 100 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                        />

                        <div className="text-center relative z-10">
                          <h3 className="text-xl font-medium text-green-400 mb-1">Wallet Connected</h3>
                          <div className="bg-black/40 inline-block px-3 py-1 rounded mt-1">
                            <p className="text-sm font-mono text-green-300">STATUS: <span className="text-green-400">ACTIVE</span></p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push('/markets')}
                        size="lg"
                        className="w-full bg-green-500 hover:bg-green-600 text-black h-12 mt-4 items-center relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                        {/* Matrix-style animation overlay */}
                        <motion.span
                          className="absolute inset-0 bg-white/10"
                          initial={{ x: "-100%" }}
                          animate={{ x: ["120%", "-120%"] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear",
                            repeatDelay: 1.5
                          }}
                        />
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Visual container - right side */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex flex-col items-center"
          >
            {step === 'welcome' && (
              <div className="space-y-8 flex flex-col items-center">
                {/* Visual circle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative flex items-center justify-center"
                >
                  <div className="relative w-[280px] h-[280px]">
                    {/* Outer rotating ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <div className="w-full h-full rounded-full border border-primary/30" />

                      {/* Tech dots positioned around the circle */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
                    </motion.div>

                    {/* Interior glowing circle */}
                    <motion.div
                      className="absolute inset-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden"
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(125, 249, 255, 0.1)',
                          '0 0 30px rgba(125, 249, 255, 0.3)',
                          '0 0 0px rgba(125, 249, 255, 0.1)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    >
                      {/* Geometric symbol instead of wallet */}
                      <motion.div
                        animate={{ rotate: 45, scale: [0.9, 1.1, 0.9] }}
                        transition={{
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 4, repeat: Infinity, repeatType: "reverse" }
                        }}
                        className="relative"
                      >
                        <div className="w-24 h-24 border-4 border-primary/60 relative flex items-center justify-center">
                          <div className="w-12 h-12 bg-primary/30 absolute" />
                        </div>
                      </motion.div>

                      {/* Data flow lines */}
                      <motion.div
                        className="absolute top-1/4 left-0 h-[1px] w-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      />
                      <motion.div
                        className="absolute bottom-1/4 left-0 h-[1px] w-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </motion.div>

                    {/* Angular corner accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40" />
                  </div>
                </motion.div>
              </div>
            )}

            {step === 'checkExtension' && (
              <div className="space-y-8 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center h-full"
                >
                  {extensionInstalled ? (
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 8 }}
                        className="bg-green-500/10 w-40 h-40 rounded-full flex items-center justify-center border border-green-500/30"
                      >
                        <Check className="w-20 h-20 text-green-500" />
                      </motion.div>
                      <p className="mt-6 text-gray-300 text-center">Signet extension detected</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 8 }}
                        className="bg-red-500/10 w-40 h-40 rounded-full flex items-center justify-center border border-red-500/30"
                      >
                        <X className="w-20 h-20 text-red-500" />
                      </motion.div>
                      <p className="mt-6 text-gray-300 text-center">Extension not found</p>
                    </div>
                  )}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10 w-full"
                >
                  {extensionInstalled ? (
                    <Button
                      onClick={connectWallet}
                      disabled={isLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-black font-bold py-6 text-xl relative overflow-hidden items-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          CONNECTING...
                        </>
                      ) : (
                        <>
                          CONNECT WALLET
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                      <motion.span
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: "-100%" }}
                        animate={{ x: ["120%", "-120%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                          repeatDelay: 1.5
                        }}
                      />
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={checkExtension}
                        variant="outline"
                        disabled={isLoading}
                        className="flex-1 items-center py-3 text-lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            CHECKING...
                          </>
                        ) : (
                          "CHECK AGAIN"
                        )}
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {step === 'getStatus' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full rounded-full border-2 border-t-primary border-r-primary/60 border-b-primary/20 border-l-primary/20" />
                  </motion.div>
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <p className="mt-6 text-gray-300 text-center">
                  {false ? "Please respond to Signet notification" : "Connecting..."}
                </p>
              </motion.div>
            )}

            {step === 'connecting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-[220px] h-[120px] flex items-center justify-center">
                  {/* First connection node */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-black border border-primary/30 rounded-lg flex items-center justify-center">
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          boxShadow: [
                            'inset 0 0 0 rgba(125, 249, 255, 0.3)',
                            'inset 0 0 15px rgba(125, 249, 255, 0.5)',
                            'inset 0 0 0 rgba(125, 249, 255, 0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-8 h-8 bg-primary/20 rounded-sm flex items-center justify-center"
                      >
                        <div className="w-4 h-4 bg-primary rounded-sm" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Connection line with animated pulse */}
                  <motion.div className="absolute left-[50px] top-1/2 -translate-y-1/2 h-[2px] bg-primary/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0, x: 0 }}
                      animate={{ width: "100%", x: 120 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "100%" }}
                      className="w-[120px] h-full"
                    />
                  </motion.div>

                  {/* Second connection node */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-black border border-primary/30 rounded-lg flex items-center justify-center">
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          boxShadow: [
                            'inset 0 0 0 rgba(125, 249, 255, 0.3)',
                            'inset 0 0 15px rgba(125, 249, 255, 0.5)',
                            'inset 0 0 0 rgba(125, 249, 255, 0.3)'
                          ]
                        }}
                        transition={{ duration: 2, delay: 1, repeat: Infinity }}
                        className="w-8 h-8 bg-primary/20 rounded-sm flex items-center justify-center"
                      >
                        <div className="w-4 h-4 bg-primary rounded-sm" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Connection success indicator */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: signerAddress ? 1 : 0, opacity: signerAddress ? 1 : 0 }}
                    transition={{ delay: 2, duration: 0.3, type: "spring" }}
                    className="absolute bg-green-500 rounded-full p-1 z-10 top-0 right-3"
                  >
                    <Check className="w-5 h-5 text-black" />
                  </motion.div>
                </div>

                {signerAddress ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center"
                  >
                    <div className="bg-black/60 border border-primary/20 px-4 py-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">STACKS ADDRESS</p>
                      <code className="text-primary text-xs break-all font-mono">
                        {signerAddress}
                      </code>
                    </div>

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-1 bg-gradient-to-r from-primary/40 to-primary/80 rounded-full max-w-xs mt-4"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                  >
                    <Button
                      onClick={() => {
                        setStep('checkExtension');
                        setIsLoading(false);
                      }}
                      variant="outline"
                      className="mt-4 border-yellow-400/30 hover:bg-yellow-400/10 text-yellow-400 items-center"
                      size="sm"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Retry Connection
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                  {/* Pulsing success background */}
                  <motion.div
                    className="absolute inset-16 rounded-full bg-green-500/5"
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0px rgba(34, 197, 94, 0.2)',
                        '0 0 30px rgba(34, 197, 94, 0.4)',
                        '0 0 0px rgba(34, 197, 94, 0.2)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  />

                  {/* Outer ring */}
                  <motion.div
                    className="absolute inset-10 rounded-full border-2 border-dashed border-green-500/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Inner ring with particles */}
                  <div className="absolute inset-16 rounded-full border border-green-500/30 overflow-hidden">
                    {/* Animated particles */}
                    <motion.div
                      initial={{ top: '100%' }}
                      animate={{ top: '-20%' }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/4 w-1 h-1 bg-green-400/60 rounded-full"
                    />
                    <motion.div
                      initial={{ top: '100%' }}
                      animate={{ top: '-20%' }}
                      transition={{ duration: 6, delay: 1, repeat: Infinity, ease: "linear" }}
                      className="absolute left-2/3 w-1 h-1 bg-green-400/60 rounded-full"
                    />
                    <motion.div
                      initial={{ top: '100%' }}
                      animate={{ top: '-20%' }}
                      transition={{ duration: 10, delay: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/3 w-1 h-1 bg-green-400/60 rounded-full"
                    />
                  </div>

                  {/* Center success symbol */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.3
                    }}
                    className="absolute inset-24 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                        delay: 0.5
                      }}
                    >
                      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-10 h-10 text-black" />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Status text */}
                  <div className="absolute -bottom-10">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-green-400 font-medium text-xl"
                    >
                      Connection Complete
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}