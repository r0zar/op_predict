"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ChevronRight,
  Code,
  ArrowLeft,
  Info,
  Rocket,
  Coins,
  Wallet,
  HelpCircle,
  Sparkles,
  BadgeCheck,
  Key,
  BarChart3,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define popular tokens for the selection step
const popularTokens = [
  {
    id: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.blaze-welsh-v1",
    name: "WELSH",
    symbol: "WELSH",
    image: "/welsh-logo.png",
    description: "The original meme coin on Stacks",
  },
  {
    id: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-charisma",
    name: "Charisma",
    symbol: "CHA",
    image: "/cha-token.png",
    description: "Community-driven project on Stacks",
  },
  {
    id: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.blaze-leo-v1",
    name: "LEO",
    symbol: "LEO",
    image: "/leo-logo.png",
    description: "Brave and mighty meme coin",
  },
  {
    id: "SP1XQMR8RVGSAZN5P4JSHWN9EVZ12PR9VVP0X63PM.blaze-not-v1",
    name: "NOT",
    symbol: "NOT",
    image: "/not-logo.png",
    description: "Decentralized meme coin",
  },
];

// Define contract deployment form schema with Zod
const contractDeploymentSchema = z.object({
  tokenContract: z.string().min(1, {
    message: "Token contract is required.",
  }),
  contractName: z.string().min(3, {
    message: "Contract name must be at least 3 characters.",
  }).max(64, {
    message: "Contract name must not exceed 64 characters."
  }).regex(/^[a-z0-9-]+$/, {
    message: "Contract name can only contain lowercase letters, numbers, and hyphens.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }).max(500, {
    message: "Description must not exceed 500 characters."
  }),
  adminFee: z.number().min(0, {
    message: "Admin fee must be at least 0%."
  }).max(15, {
    message: "Admin fee cannot exceed 15%."
  }),
  batchSize: z.number().min(50, {
    message: "Batch size must be at least 50."
  }).max(300, {
    message: "Batch size cannot exceed 300."
  }),
});

type ContractDeploymentFormValues = z.infer<typeof contractDeploymentSchema>;

// Steps for the wizard
const steps = [
  { id: "token", name: "Select Token" },
  { id: "configure", name: "Configure Contract" },
  { id: "deploy", name: "Deploy & Verify" },
];

// Token interface
interface Token {
  id: string;
  name: string;
  symbol: string;
  image: string;
  description: string;
}

export default function LaunchpadUI() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentTxId, setDeploymentTxId] = useState<string | null>(null);
  const [deploymentContractId, setDeploymentContractId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [customTokenId, setCustomTokenId] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const router = useRouter();

  // Initialize form with default values
  const form = useForm<ContractDeploymentFormValues>({
    resolver: zodResolver(contractDeploymentSchema),
    defaultValues: {
      tokenContract: "",
      contractName: "",
      description: "",
      adminFee: 5,
      batchSize: 200,
    },
  });

  // Filter tokens based on search query
  const filteredTokens = popularTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    form.setValue("tokenContract", token.id);
    form.setValue("contractName", `predict-${token.symbol.toLowerCase()}-v1`);
    form.setValue("description", `Prediction market vault for ${token.name} (${token.symbol}) token. Users can create markets, make predictions, and claim rewards.`);

    // Generate mock contract code
    const mockCode = generateMockContractCode(token);
    setGeneratedCode(mockCode);

    // Move to next step
    setCurrentStep(1);
  };

  const validateCustomToken = async () => {
    if (!customTokenId) return;

    setIsValidatingToken(true);

    try {
      // Mock token validation - in a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock finding a token (for demo purposes)
      const customToken = {
        id: customTokenId,
        name: "Custom Token",
        symbol: "CUSTOM",
        image: "/stx-logo.png",
        description: "Custom token for prediction markets",
      };

      handleTokenSelect(customToken);
    } catch (error) {
      console.error("Error validating token:", error);
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Generate mock Clarity contract code
  const generateMockContractCode = (token: Token) => {
    const formValues = form.getValues();
    return `;; Title: blaze
;; Version: predict-${token.symbol.toLowerCase()}-v1
;; Description: ${formValues.description}
;;   Implementation of a prediction market vault for the Stacks blockchain that
;;   supports both on-chain and off-chain (signed) operations.
;;   Allows users to create markets, make predictions, and claim rewards.
;;   Market resolution is controlled by the vault deployer or authorized admins.

;; Constants
(define-constant DEPLOYER tx-sender)
(define-constant CONTRACT (as-contract tx-sender))
(define-constant ERR_UNAUTHORIZED (err u403))
(define-constant ERR_MARKET_EXISTS (err u401))
(define-constant ERR_MARKET_NOT_FOUND (err u404))
(define-constant ADMIN_FEE u${Math.floor(formValues.adminFee * 10000)})   ;; ${formValues.adminFee}% fee to admin
(define-constant MAX_BATCH_SIZE u${formValues.batchSize})  ;; Maximum number of operations in a batch

;; Main token contract
(define-constant TOKEN-CONTRACT '${token.id})

;; Define NFT for prediction receipts
(define-non-fungible-token prediction-receipt uint)

;; Data structures
(define-map markets (string-ascii 64) {
  creator: principal,
  name: (string-ascii 64),
  description: (string-ascii 128),
  outcome-names: (list 16 (string-ascii 32)),
  outcome-pools: (list 16 uint),
  total-pool: uint,
  is-open: bool,
  is-resolved: bool,
  winning-outcome: uint,
  resolver: (optional principal),
  creation-time: uint,
  resolution-time: uint
})

;; ... more contract code would be here ...`;
  };

  // Handle form submission
  const handleDeployContract = async () => {
    // Validate the form before deploying
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    setDeploymentStatus('deploying');
    setDeploymentError(null);

    try {
      // In a real implementation, this would call an API to deploy the contract
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful deployment
      setDeploymentTxId("0x8a9c4ced9d5214a6f12a18a0aad1697b29d5518c8cc7d3413f71124c27513d86");
      setDeploymentContractId(`SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.${form.getValues("contractName")}`);
      setDeploymentStatus('success');
    } catch (error) {
      console.error("Error deploying contract:", error);
      setDeploymentError("Failed to deploy prediction market contract");
      setDeploymentStatus('error');
    }
  };

  // Navigate to next step
  const nextStep = async () => {
    // Validate current step before proceeding
    let isValid = false;

    if (currentStep === 0) {
      isValid = selectedToken !== null;
    } else if (currentStep === 1) {
      isValid = await form.trigger(["contractName", "description", "adminFee", "batchSize"]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  // Go back to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Render token selection step
  const renderTokenSelectionStep = () => (
    <>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-xl">Select Token</CardTitle>
        <CardDescription>
          Choose the token for your prediction market contract
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="relative">
          <Input
            placeholder="Search for a token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10"
          />
          <div className="absolute left-3 top-3 text-muted-foreground">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredTokens.map((token) => (
            <Card
              key={token.id}
              className={cn(
                "cursor-pointer hover:border-primary transition-all hover:-translate-y-1",
                selectedToken?.id === token.id ? "border-primary ring-1 ring-primary" : "border-border"
              )}
              onClick={() => handleTokenSelect(token)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="relative w-16 h-16 mb-3">
                  <Image
                    src={token.image}
                    alt={token.name}
                    fill
                    className="object-contain rounded-full"
                  />
                  {selectedToken?.id === token.id && (
                    <div className="absolute -top-1 -right-1 bg-primary text-background rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium">{token.name}</h3>
                <p className="text-sm text-muted-foreground">{token.symbol}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-lg font-medium mb-4">Use Custom Token</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter token contract ID..."
              value={customTokenId}
              onChange={(e) => setCustomTokenId(e.target.value)}
              className="h-12"
            />
            <Button
              variant="outline"
              onClick={validateCustomToken}
              disabled={!customTokenId || isValidatingToken}
              className="whitespace-nowrap"
            >
              {isValidatingToken ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Use Custom Token"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );

  // Render contract configuration step
  const renderContractConfigurationStep = () => (
    <>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-xl">Configure Contract</CardTitle>
        <CardDescription>
          Customize your prediction market contract settings
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {selectedToken && (
          <div className="p-4 bg-muted/30 rounded-lg flex items-center space-x-3 mb-4">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={selectedToken.image}
                alt={selectedToken.name}
                fill
                className="object-contain rounded-full"
              />
            </div>
            <div>
              <h3 className="font-medium">{selectedToken.name} ({selectedToken.symbol})</h3>
              <p className="text-xs text-muted-foreground truncate max-w-md">{selectedToken.id}</p>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="contractName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Contract Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="predict-token-v1"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-center text-sm">
                Choose a unique identifier for your contract
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="p-3 max-w-xs">
                      <p>
                        Contract names can only use lowercase letters, numbers, and hyphens.
                        The name must be unique within your account.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your prediction market contract"
                  className="min-h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-sm">
                This description helps users understand the purpose of your prediction market.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adminFee"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="text-base">Admin Fee</FormLabel>
                <span className="text-sm font-medium">{value}%</span>
              </div>
              <FormControl>
                <Slider
                  min={0}
                  max={15}
                  step={0.5}
                  value={[value]}
                  onValueChange={(values) => onChange(values[0])}
                  className="py-4"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>5% (Default)</span>
                <span>15%</span>
              </div>
              <FormDescription className="text-sm mt-2 flex items-center">
                Market admins earn this percentage when resolving markets
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="p-3 max-w-xs">
                      <p>
                        The admin fee is the percentage of the total pool that goes to the admin who resolves the market.
                        The remainder (95% by default) is distributed among winning participants.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="batchSize"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="text-base">Batch Size</FormLabel>
                <span className="text-sm font-medium">{field.value} operations</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue('batchSize', 100)}
                  className={cn(
                    'text-xs py-4 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                    field.value === 100 && 'bg-primary text-primary-foreground'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span>Conservative</span>
                    <span className="text-[10px] text-primary-foreground/60">100 ops</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue('batchSize', 200)}
                  className={cn(
                    'text-xs py-4 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                    field.value === 200 && 'bg-primary text-primary-foreground'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span>Balanced</span>
                    <span className="text-[10px] text-primary-foreground/60">200 ops</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue('batchSize', 300)}
                  className={cn(
                    'text-xs py-4 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                    field.value === 300 && 'bg-primary text-primary-foreground'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span>Optimized</span>
                    <span className="text-[10px] text-primary-foreground/60">300 ops</span>
                  </div>
                </Button>
              </div>
              <FormControl>
                <Slider
                  min={50}
                  max={300}
                  step={25}
                  value={[field.value]}
                  onValueChange={(values) => form.setValue('batchSize', values[0])}
                  className="py-4"
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50</span>
                <span>200 (Default)</span>
                <span>300</span>
              </div>
              <FormDescription className="text-sm mt-2 flex items-center">
                Maximum operations to process in a single transaction
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="p-3 max-w-xs">
                      <p>
                        Higher batch sizes allow more operations to be processed at once, improving throughput.
                        However, very large batch sizes may exceed blockchain resource limits.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Contract Code Preview</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              {showCode ? "Hide Code" : "Show Code"}
            </Button>
          </div>
          {showCode && (
            <div className="bg-muted/50 p-4 rounded-md overflow-x-auto border border-muted">
              <pre className="text-xs">{generatedCode}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );

  // Render deployment step
  const renderDeploymentStep = () => (
    <>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-xl">Deploy Contract</CardTitle>
        <CardDescription>
          Review and deploy your prediction market contract
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4 px-2">
          <div className="p-4 rounded-lg border bg-muted/30">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Base Token</h3>
            <div className="flex items-center">
              {selectedToken && (
                <>
                  <div className="relative w-5 h-5 mr-2">
                    <Image
                      src={selectedToken.image}
                      alt={selectedToken.name}
                      fill
                      className="object-contain rounded-full"
                    />
                  </div>
                  <p className="text-base font-medium">{selectedToken.name} ({selectedToken.symbol})</p>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Contract Name</h3>
            <p className="text-base font-medium">{form.getValues("contractName")}</p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
            <p className="text-base whitespace-pre-wrap">{form.getValues("description")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Admin Fee</h3>
              <p className="text-base font-medium">{form.getValues("adminFee")}%</p>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Batch Size</h3>
              <p className="text-base font-medium">{form.getValues("batchSize")} operations</p>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <h3 className="text-base font-medium">Deployment Status</h3>

          {deploymentStatus === 'idle' && (
            <div className="bg-muted/20 border rounded-lg p-4">
              <p className="text-sm text-center text-muted-foreground">
                Ready to deploy your prediction market contract
              </p>
            </div>
          )}

          {deploymentStatus === 'deploying' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                <p className="text-sm font-medium text-blue-500">Deploying your contract...</p>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                This may take a minute. Please don't close this page.
              </p>
            </div>
          )}

          {deploymentStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm font-medium text-green-500">Deployment Successful!</p>
              </div>

              {deploymentContractId && (
                <div className="mt-3 rounded-md bg-muted/30 p-2">
                  <p className="text-xs font-mono overflow-hidden text-ellipsis">{deploymentContractId}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                {deploymentTxId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://explorer.stacks.co/txid/${deploymentTxId}`, '_blank')}
                    className="text-xs"
                  >
                    View Transaction
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/markets')}
                  className="text-xs"
                >
                  Go to Markets
                </Button>
              </div>
            </div>
          )}

          {deploymentStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm font-medium text-red-500">Deployment Failed</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {deploymentError || "There was an error deploying your prediction market contract."}
              </p>
              <Button
                className="w-full mt-4"
                size="sm"
                variant="destructive"
                onClick={() => setDeploymentStatus('idle')}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-base font-medium mb-4">What You Can Do After Deployment</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex space-x-3 p-3 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Create Markets</h4>
                <p className="text-xs text-muted-foreground">Launch prediction markets for various events</p>
              </div>
            </div>

            <div className="flex space-x-3 p-3 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Manage Admin Access</h4>
                <p className="text-xs text-muted-foreground">Control who can resolve markets and collect fees</p>
              </div>
            </div>

            <div className="flex space-x-3 p-3 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Collect Fees</h4>
                <p className="text-xs text-muted-foreground">Earn {form.getValues("adminFee")}% from resolved markets</p>
              </div>
            </div>

            <div className="flex space-x-3 p-3 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">View Analytics</h4>
                <p className="text-xs text-muted-foreground">Track market performance and user engagement</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderTokenSelectionStep();
      case 1:
        return renderContractConfigurationStep();
      case 2:
        return renderDeploymentStep();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Deploy Your Prediction Vault</h1>
        <p className="text-muted-foreground text-lg">
          Create a self-service prediction vault for your favorite token and collect fees from activity.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 px-0 w-full">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isActive = currentStep >= index;
            const isLastStep = index === steps.length - 1;

            return (
              <div key={step.id} className={`flex items-center ${isLastStep ? 'flex-grow-0' : 'flex-grow'}`}>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                >
                  {currentStep > index ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  {step.name}
                </span>
                {!isLastStep && (
                  <div className="relative h-0.5 flex-grow mx-2 bg-muted-foreground/30">
                    <div
                      className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out`}
                      style={{
                        width: isActive ? '100%' : '0%',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleDeployContract)} className="space-y-8">
          <Card className="border-2 shadow-sm">
            {renderStepContent()}

            <CardFooter className="flex justify-between border-t bg-muted/30 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="h-10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-10 px-6 transition-all"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleDeployContract}
                  disabled={deploymentStatus === 'deploying' || deploymentStatus === 'success'}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 transition-colors"
                >
                  {deploymentStatus === 'deploying' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : deploymentStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Deployed
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Deploy Contract
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Benefits Section */}
      <div className="mt-12 bg-muted/20 rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold mb-6 text-center">Benefits of Running Your Prediction Market</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BadgeCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Become a Market Admin</h3>
            <p className="text-sm text-muted-foreground">Create and manage markets for your community. You decide which events to predict.</p>
          </div>

          <div className="p-4 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Earn Admin Fees</h3>
            <p className="text-sm text-muted-foreground">Collect fees from resolved markets. The more activity your markets generate, the more you earn.</p>
          </div>

          <div className="p-4 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Grow Your Token</h3>
            <p className="text-sm text-muted-foreground">Increase engagement and utility for your favorite token by creating prediction markets around it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}