'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";
import { toast } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { updateBugReportStatus } from "@/app/actions/bug-report-actions";
import type { BugReportStatus } from "@/app/actions/bug-report-actions";
// Define the BugReport type locally instead of importing it
type BugReport = any;
import { DollarSign, CheckCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface BugReportTableProps {
    reports: BugReport[];
    isAdmin: boolean;
}

export function BugReportTable({ reports, isAdmin }: BugReportTableProps) {
    const router = useRouter();
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
    
    const toggleReportExpand = (reportId: string) => {
        setExpandedReportId(expandedReportId === reportId ? null : reportId);
    };

    // Status update handler
    async function updateStatus(reportId: string, status: BugReportStatus) {
        try {
            const result = await updateBugReportStatus(reportId, status);

            if (result.success) {
                let message = "Status updated successfully";

                // If a confirmation reward was paid, show a more specific message
                if (result.confirmationRewardPaid) {
                    message = "Status updated and $90 reward was issued to the reporter";
                }

                toast.success(message, {
                    duration: 3000,
                });
                router.refresh();
            } else {
                toast.error("Failed to update status", {
                    description: result.error || "An unexpected error occurred.",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error updating bug report status:", error);
            toast.error("Something went wrong", {
                description: "Failed to update status. Please try again.",
                duration: 3000,
            });
        }
    }

    // Function to render status badge with appropriate color
    function renderStatusBadge(status: string) {
        switch (status) {
            case "open":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Open</Badge>;
            case "in-progress":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">In Progress</Badge>;
            case "resolved":
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Resolved</Badge>;
            case "closed":
                return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    // Function to render severity badge with appropriate color
    function renderSeverityBadge(severity: string) {
        switch (severity) {
            case "low":
                return <Badge variant="secondary">Low</Badge>;
            case "medium":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
            case "high":
                return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
            case "critical":
                return <Badge variant="destructive">Critical</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    }

    // Function to render reward status
    function renderRewardStatus(report: BugReport) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium">Initial $10:</span>
                    {report.initialRewardPaid ? (
                        <span className="flex items-center text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </span>
                    ) : (
                        <span className="flex items-center text-yellow-500">
                            <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium">Confirmation $90:</span>
                    {report.confirmationRewardPaid ? (
                        <span className="flex items-center text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </span>
                    ) : report.status === 'resolved' ? (
                        <span className="flex items-center text-yellow-500">
                            <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                    ) : (
                        <span className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" /> Awaiting resolution
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="whitespace-nowrap">
                            <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-blue-400" /> Rewards
                            </span>
                        </TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <React.Fragment key={report.id}>
                            <TableRow 
                                className={`cursor-pointer hover:bg-muted/50 ${expandedReportId === report.id ? 'bg-muted/50' : ''}`}
                                onClick={() => toggleReportExpand(report.id)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        {expandedReportId === report.id ? 
                                            <ChevronUp className="h-4 w-4 mr-2 flex-shrink-0" /> : 
                                            <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                                        }
                                        {report.title}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{renderSeverityBadge(report.severity)}</TableCell>
                                <TableCell>{renderStatusBadge(report.status)}</TableCell>
                                <TableCell>{renderRewardStatus(report)}</TableCell>
                                {isAdmin && (
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            defaultValue={report.status}
                                            onValueChange={(value: BugReportStatus) => updateStatus(report.id, value)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Update Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                )}
                            </TableRow>
                            
                            {expandedReportId === report.id && (
                                <TableRow className="border-0">
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="p-4 bg-muted/30">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="font-medium text-lg">Description</h3>
                                                <div className="whitespace-pre-wrap p-3 rounded-md border bg-card">
                                                    {report.description}
                                                </div>
                                            </div>
                                            
                                            {report.url && (
                                                <div className="space-y-2">
                                                    <h3 className="font-medium">URL</h3>
                                                    <a 
                                                        href={report.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-blue-500 hover:underline"
                                                    >
                                                        {report.url}
                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Submitted by</p>
                                                    <p className="font-medium">{report.createdBy.substring(0, 10)}...</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Date submitted</p>
                                                    <p className="font-medium">{new Date(report.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                {report.updatedAt && (
                                                    <div>
                                                        <p className="text-muted-foreground">Last updated</p>
                                                        <p className="font-medium">{new Date(report.updatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                                {report.confirmedAt && (
                                                    <div>
                                                        <p className="text-muted-foreground">Confirmed on</p>
                                                        <p className="font-medium">{new Date(report.confirmedAt).toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 