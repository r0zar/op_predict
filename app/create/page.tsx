"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronRight, HelpCircle, Info, Plus, Trash2, X, CheckCircle2, ListFilter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/src/utils";
import { createMarket, CreateMarketFormData } from "@/app/actions/market-actions";

// Define market types
const marketTypes = [
    {
        id: "binary",
        name: "Yes/No Question",
        description: "A simple binary prediction with two possible outcomes.",
        icon: CheckCircle2,
    },
    {
        id: "multiple",
        name: "Multiple Choice",
        description: "A prediction with multiple possible outcomes.",
        icon: ListFilter,
    },
];

// Define the form schema with Zod
const marketFormSchema = z.object({
    type: z.enum(["binary", "multiple"]),
    name: z.string().min(10, {
        message: "Market name must be at least 10 characters.",
    }).max(100, {
        message: "Market name must not exceed 100 characters."
    }),
    description: z.string().min(20, {
        message: "Description must be at least 20 characters.",
    }).max(500, {
        message: "Description must not exceed 500 characters."
    }),
    outcomes: z.array(
        z.object({
            id: z.number(),
            name: z.string().min(1, { message: "Outcome name is required" })
        })
    ).min(2, {
        message: "At least two outcomes are required."
    }).max(15, {
        message: "Maximum 15 outcomes allowed."
    }),
});

type MarketFormValues = z.infer<typeof marketFormSchema>;

// Steps for the wizard
const steps = [
    { id: "type", name: "Market Type" },
    { id: "basics", name: "Basic Information" },
    { id: "outcomes", name: "Define Outcomes" },
    { id: "review", name: "Review & Create" },
];

export default function CreateMarketPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Initialize form with default values
    const form = useForm<MarketFormValues>({
        resolver: zodResolver(marketFormSchema),
        defaultValues: {
            type: "binary",
            name: "",
            description: "",
            outcomes: [
                { id: 1, name: "Yes" },
                { id: 2, name: "No" },
            ],
        },
    });

    // Watch for type changes to update outcomes
    const marketType = form.watch("type");

    // Handle market type change
    const handleTypeChange = (type: "binary" | "multiple") => {
        form.setValue("type", type);

        // Reset outcomes based on type
        if (type === "binary") {
            form.setValue("outcomes", [
                { id: 1, name: "Yes" },
                { id: 2, name: "No" },
            ]);
        } else if (type === "multiple") {
            form.setValue("outcomes", [
                { id: 1, name: "Option 1" },
                { id: 2, name: "Option 2" },
                { id: 3, name: "Option 3" },
            ]);
        }
    };

    // Handle form submission
    async function onSubmit(data: MarketFormValues) {
        setIsSubmitting(true);

        try {
            const result = await createMarket(data as CreateMarketFormData);

            if (result.success) {
                toast.success("Market created successfully!", {
                    description: `Your prediction market "${data.name}" has been created.`,
                    duration: 5000,
                });

                // Redirect to the markets page instead of a specific market
                setTimeout(() => {
                    router.push('/markets');
                }, 1500);
            } else {
                toast.error("Failed to create market", {
                    description: result.error || "An unexpected error occurred.",
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error("Error creating market:", error);
            toast.error("Something went wrong", {
                description: "Failed to create your market. Please try again.",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Add a new outcome
    const addOutcome = () => {
        const currentOutcomes = form.getValues("outcomes");
        if (currentOutcomes.length < 15) {
            const newId = currentOutcomes.length > 0
                ? Math.max(...currentOutcomes.map(o => o.id)) + 1
                : 1;
            form.setValue("outcomes", [...currentOutcomes, { id: newId, name: "" }]);
        }
    };

    // Remove an outcome
    const removeOutcome = (id: number) => {
        const currentOutcomes = form.getValues("outcomes");
        if (currentOutcomes.length > 2) {
            form.setValue(
                "outcomes",
                currentOutcomes.filter((outcome) => outcome.id !== id)
            );
        } else {
            toast.error("Cannot remove outcome", {
                description: "At least two outcomes are required.",
                duration: 3000,
            });
        }
    };

    // Navigate to next step
    const nextStep = async (e: React.MouseEvent) => {
        // Prevent form submission
        e.preventDefault();

        // Validate current step before proceeding
        let isValid = false;

        if (currentStep === 0) {
            isValid = await form.trigger("type");
        } else if (currentStep === 1) {
            isValid = await form.trigger(["name", "description"]);
        } else if (currentStep === 2) {
            isValid = await form.trigger("outcomes");
        }

        if (isValid || currentStep === 0) {
            // Skip outcomes step for binary markets
            if (currentStep === 1 && marketType === "binary") {
                setCurrentStep(3); // Jump to review
            } else {
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            }
        }
    };

    // Go back to previous step
    const prevStep = (e: React.MouseEvent) => {
        // Prevent form submission
        e.preventDefault();

        // Skip outcomes step for binary markets when going back
        if (currentStep === 3 && marketType === "binary") {
            setCurrentStep(1); // Jump back to basics
        } else {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
    };

    return (
        <div className="container max-w-3xl py-10">
            <h1 className="text-3xl font-bold mb-2">Create a Prediction Market</h1>
            <p className="text-muted-foreground mb-8">Set up your market in a few simple steps</p>

            {/* Step indicator */}
            <div className="mb-8 px-0 w-full">
                <div className="flex items-center justify-between w-full">
                    {steps
                        // Filter out outcomes step for binary markets
                        .filter(step => !(marketType === "binary" && step.id === "outcomes"))
                        .map((step, index, filteredSteps) => {
                            // Adjust index for display
                            const displayIndex = index + 1;
                            // Calculate if step is active or completed
                            const stepIndex = steps.findIndex(s => s.id === step.id);
                            const isActive = currentStep >= stepIndex;
                            const isLastStep = index === filteredSteps.length - 1;

                            return (
                                <div key={step.id} className={`flex items-center ${isLastStep ? 'flex-grow-0' : 'flex-grow'}`}>
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${isActive
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-muted-foreground/30 text-muted-foreground"
                                            }`}
                                    >
                                        {currentStep > stepIndex ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <span>{displayIndex}</span>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="border-2 shadow-sm">
                        {/* Step 1: Market Type */}
                        {currentStep === 0 && (
                            <>
                                <CardHeader className="border-b bg-muted/50">
                                    <CardTitle className="text-xl">Choose Market Type</CardTitle>
                                    <CardDescription>
                                        Select the type of prediction market you want to create
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {marketTypes.map((type) => {
                                                        const Icon = type.icon;
                                                        return (
                                                            <div
                                                                key={type.id}
                                                                className={cn(
                                                                    "relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary/50",
                                                                    field.value === type.id
                                                                        ? "border-primary bg-primary/5"
                                                                        : "border-muted"
                                                                )}
                                                                onClick={() => handleTypeChange(type.id as "binary" | "multiple")}
                                                            >
                                                                {field.value === type.id && (
                                                                    <div className="absolute top-2 right-2 h-5 w-5 text-primary">
                                                                        <Check className="h-5 w-5" />
                                                                    </div>
                                                                )}
                                                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                                    <Icon className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h3 className="font-medium">{type.name}</h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {type.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </>
                        )}

                        {/* Step 2: Basic Information */}
                        {currentStep === 1 && (
                            <>
                                <CardHeader className="border-b bg-muted/50">
                                    <CardTitle className="text-xl">Basic Information</CardTitle>
                                    <CardDescription>
                                        Provide the essential details about your prediction market
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Market Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={marketType === "binary"
                                                            ? "e.g., Will Bitcoin reach $100k by end of 2025?"
                                                            : "e.g., Which team will win the Super Bowl in 2025?"}
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="flex items-center text-sm">
                                                    Clear, specific questions work best
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="p-3 max-w-xs">
                                                                <p>
                                                                    Good examples: &quot;Will Bitcoin reach $100k by Dec 31, 2025?&quot; or
                                                                    &quot;Which country will win the 2026 World Cup?&quot;
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
                                                        placeholder="Provide details about this prediction market, including any relevant context, rules, or criteria for resolution."
                                                        className="min-h-32 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-sm">
                                                    Include clear resolution criteria and any important context.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </>
                        )}

                        {/* Step 3: Define Outcomes (Multiple Choice only) */}
                        {currentStep === 2 && marketType === "multiple" && (
                            <>
                                <CardHeader className="border-b bg-muted/50">
                                    <CardTitle className="text-xl">Define Possible Outcomes</CardTitle>
                                    <CardDescription>
                                        Specify all possible outcomes for this prediction market
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-4">
                                        {form.watch("outcomes").map((outcome, index) => (
                                            <div key={outcome.id} className="flex items-center gap-2 group">
                                                <Badge
                                                    variant="outline"
                                                    className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-muted/50"
                                                >
                                                    {index + 1}
                                                </Badge>
                                                <FormField
                                                    control={form.control}
                                                    name={`outcomes.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 m-0">
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={`Option ${index + 1}`}
                                                                    className="h-10 transition-all border-muted group-hover:border-primary/50"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOutcome(outcome.id)}
                                                    disabled={form.watch("outcomes").length <= 2}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 border-dashed border-2 hover:border-primary transition-colors"
                                        onClick={addOutcome}
                                        disabled={form.watch("outcomes").length >= 15}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Outcome
                                    </Button>

                                    <FormMessage>
                                        {form.formState.errors.outcomes?.message}
                                    </FormMessage>
                                </CardContent>
                            </>
                        )}

                        {/* Step 4: Review & Create */}
                        {currentStep === 3 && (
                            <>
                                <CardHeader className="border-b bg-muted/50">
                                    <CardTitle className="text-xl">Review & Create</CardTitle>
                                    <CardDescription>
                                        Review your prediction market details before creating
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6 px-0 sm:px-0">
                                    <div className="space-y-6 px-6 sm:px-6">
                                        <div className="p-4 rounded-lg border bg-muted/30">
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Market Type</h3>
                                            <p className="text-base font-medium flex items-center">
                                                {marketType === "binary" ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                                                        Yes/No Question
                                                    </>
                                                ) : (
                                                    <>
                                                        <ListFilter className="h-4 w-4 mr-2 text-primary" />
                                                        Multiple Choice
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-lg border bg-muted/30">
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Market Name</h3>
                                            <p className="text-base font-medium">{form.getValues("name")}</p>
                                        </div>

                                        <div className="p-4 rounded-lg border bg-muted/30">
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                                            <p className="text-base whitespace-pre-wrap">{form.getValues("description")}</p>
                                        </div>

                                        <div className="p-4 rounded-lg border bg-muted/30">
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Possible Outcomes</h3>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {form.getValues("outcomes").map((outcome) => (
                                                    <Badge key={outcome.id} variant="secondary" className="px-3 py-1 text-sm">
                                                        {outcome.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        <CardFooter className="flex justify-between border-t bg-muted/30 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="h-10"
                            >
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
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-10 px-6 bg-primary hover:bg-primary/90 transition-colors"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Market"
                                    )}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
