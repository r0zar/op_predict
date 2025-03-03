'use client';

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { BugReportStatus, updateBugReportStatus } from "@/app/actions/bug-report-actions";
import { BugReport } from "@op-predict/lib";
import { DollarSign, CheckCircle, Clock } from "lucide-react";

interface BugReportTableProps {
    reports: BugReport[];
    isAdmin: boolean;
}

export function BugReportTable({ reports, isAdmin }: BugReportTableProps) {
    const router = useRouter();

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
                return <Badge variant="outline" className="bg-blue-900 text-blue-400 border-blue-700">Open</Badge>;
            case "in-progress":
                return <Badge variant="outline" className="bg-yellow-900 text-yellow-400 border-yellow-700">In Progress</Badge>;
            case "resolved":
                return <Badge variant="outline" className="bg-green-900 text-green-400 border-green-700">Resolved</Badge>;
            case "closed":
                return <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    // Function to render severity badge with appropriate color
    function renderSeverityBadge(severity: string) {
        switch (severity) {
            case "low":
                return <Badge variant="secondary" className="bg-slate-700">Low</Badge>;
            case "medium":
                return <Badge variant="outline" className="bg-yellow-900 text-yellow-400 border-yellow-700">Medium</Badge>;
            case "high":
                return <Badge variant="outline" className="bg-orange-900 text-orange-400 border-orange-700">High</Badge>;
            case "critical":
                return <Badge variant="destructive" className="bg-red-900 text-red-400 border-red-700">Critical</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    }

    // Function to render reward status
    function renderRewardStatus(report: BugReport) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-slate-300">Initial $10:</span>
                    {report.initialRewardPaid ? (
                        <span className="flex items-center text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </span>
                    ) : (
                        <span className="flex items-center text-yellow-400">
                            <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-slate-300">Confirmation $90:</span>
                    {report.confirmationRewardPaid ? (
                        <span className="flex items-center text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </span>
                    ) : report.status === 'resolved' ? (
                        <span className="flex items-center text-yellow-400">
                            <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                    ) : (
                        <span className="flex items-center text-slate-500">
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
                <TableHeader className="bg-slate-900">
                    <TableRow>
                        <TableHead className="text-slate-300">Title</TableHead>
                        <TableHead className="text-slate-300">Date Submitted</TableHead>
                        <TableHead className="text-slate-300">Severity</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="whitespace-nowrap text-slate-300">
                            <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-blue-400" /> Rewards
                            </span>
                        </TableHead>
                        {isAdmin && <TableHead className="text-slate-300">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id} className="border-slate-800 hover:bg-slate-800/50">
                            <TableCell className="font-medium text-slate-300">{report.title}</TableCell>
                            <TableCell className="text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{renderSeverityBadge(report.severity)}</TableCell>
                            <TableCell>{renderStatusBadge(report.status)}</TableCell>
                            <TableCell>{renderRewardStatus(report)}</TableCell>
                            {isAdmin && (
                                <TableCell>
                                    <Select
                                        defaultValue={report.status}
                                        onValueChange={(value: BugReportStatus) => updateStatus(report.id, value)}
                                    >
                                        <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-300">
                                            <SelectValue placeholder="Update Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="open" className="text-slate-300">Open</SelectItem>
                                            <SelectItem value="in-progress" className="text-slate-300">In Progress</SelectItem>
                                            <SelectItem value="resolved" className="text-slate-300">Resolved</SelectItem>
                                            <SelectItem value="closed" className="text-slate-300">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 