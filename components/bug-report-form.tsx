'use client';

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DollarSign, CheckCircle } from "lucide-react";
import { createBugReport } from "@/app/actions/bug-report-actions";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description cannot exceed 1000 characters"),
    severity: z.string({
        required_error: "Please select a severity level",
    }),
    url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export function BugReportForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rewardPaid, setRewardPaid] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            severity: "",
            url: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        try {
            const result = await createBugReport(data);

            if (result.success) {
                // Check if the initial reward was paid
                if (result.rewardPaid) {
                    setRewardPaid(true);
                    toast.success("Bug report submitted and $10 reward issued", {
                        description: "You'll receive an additional $90 if an admin confirms this bug.",
                        duration: 5000,
                    });
                } else {
                    toast.success("Bug report submitted successfully", {
                        duration: 3000,
                    });
                }
                form.reset();
                router.refresh();
            } else {
                toast.error("Failed to submit bug report", {
                    description: result.error || "An unexpected error occurred.",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error submitting bug report:", error);
            toast.error("Something went wrong", {
                description: "Failed to submit your bug report. Please try again.",
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Reward Info Card - Keep this styling as requested */}
            <Card className="bg-slate-800 border-blue-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center text-blue-400">
                        <DollarSign className="h-5 w-5 mr-1 text-blue-400" />
                        Bug Report Rewards Program
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm text-slate-300">Earn rewards for helping us improve the platform:</p>
                        <ul className="text-sm list-disc pl-5 space-y-1 text-slate-300">
                            <li><span className="font-medium text-blue-400">$10 instant reward</span> when you submit a bug report</li>
                            <li><span className="font-medium text-blue-400">$90 additional reward</span> when your bug is confirmed by an admin</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {rewardPaid && (
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center text-green-500">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">$10 reward issued for this bug report!</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Issue Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Brief title describing the issue" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Provide a clear, concise title for the bug you encountered.
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Please describe the issue in detail. Include steps to reproduce if possible."
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Provide details about what happened, what you expected to happen, and any steps to reproduce.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Severity</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Low - Minor issue, not affecting functionality</SelectItem>
                                        <SelectItem value="medium">Medium - Affects functionality but has workarounds</SelectItem>
                                        <SelectItem value="high">High - Major functionality is broken</SelectItem>
                                        <SelectItem value="critical">Critical - System crash or security issue</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Rate how severely this issue affects your experience.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/page-with-issue" {...field} />
                                </FormControl>
                                <FormDescription>
                                    If applicable, provide the URL where the issue was encountered.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}