import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBugReports } from "@/app/actions/bug-report-actions";
import { BugReportForm } from "@/components/bug-report-form";
import { BugReportTable } from "@/components/bug-report-table";
import { DollarSign, AlertTriangle } from "lucide-react";
import { BugReport } from "@op-predict/lib";

export default async function BugReportPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Check if user is admin
    const isAdmin = user.publicMetadata.role === "admin";

    // Fetch bug reports
    const reportsResult = await getBugReports();

    if (!reportsResult.success) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Bug Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">Failed to load bug reports: {reportsResult.error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const allReports = reportsResult.data || [];

    // Filter reports for the current user (if not admin)
    const userReports = allReports.filter((report: BugReport) => report.createdBy === user.id);

    // Calculate earnings
    const totalInitialRewards = userReports.filter(report => report.initialRewardPaid).length * 10;
    const totalConfirmationRewards = userReports.filter(report => report.confirmationRewardPaid).length * 90;
    const totalEarnings = totalInitialRewards + totalConfirmationRewards;

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <Card className="bg-gradient-to-r from-slate-900 to-blue-900 border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl text-blue-400">
                            <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
                            Bug Report Rewards Program
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                            Help us improve the platform and earn rewards
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                                <h3 className="text-lg font-semibold mb-2 text-slate-200">How It Works</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                                    <li>Submit a detailed bug report</li>
                                    <li>Receive $10 immediately upon submission</li>
                                    <li>Earn an additional $90 when an admin confirms your bug</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                                <h3 className="text-lg font-semibold mb-2 text-slate-200">Your Earnings</h3>
                                <div className="space-y-2 text-slate-300">
                                    <div className="flex justify-between text-sm">
                                        <span>Initial rewards:</span>
                                        <span className="font-medium text-blue-400">${totalInitialRewards}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Confirmation rewards:</span>
                                        <span className="font-medium text-blue-400">${totalConfirmationRewards}</span>
                                    </div>
                                    <div className="flex justify-between text-base pt-2 border-t border-slate-700">
                                        <span className="font-bold">Total earned:</span>
                                        <span className="font-bold text-blue-400">${totalEarnings}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                                <h3 className="text-lg font-semibold mb-2 flex items-center text-slate-200">
                                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-400" />
                                    Tips for Good Reports
                                </h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                                    <li>Be specific and provide detailed steps to reproduce</li>
                                    <li>Include screenshots or URLs if applicable</li>
                                    <li>Reports with clear reproduction steps are more likely to be confirmed</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-slate-200">Bug Reports</h1>

            <Tabs defaultValue="submit" className="text-slate-200">
                <TabsList className="mb-4 bg-slate-800">
                    <TabsTrigger value="submit" className="data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400">Submit a Report</TabsTrigger>
                    <TabsTrigger value="user-reports" className="data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400">My Reports</TabsTrigger>
                    {isAdmin && <TabsTrigger value="all-reports" className="data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400">All Reports</TabsTrigger>}
                </TabsList>

                <TabsContent value="submit">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Submit a Bug Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BugReportForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="user-reports">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-slate-200">My Bug Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userReports.length > 0 ? (
                                <BugReportTable reports={userReports} isAdmin={isAdmin} />
                            ) : (
                                <p className="text-slate-400">You haven't submitted any bug reports yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="all-reports">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-slate-200">All Bug Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {allReports.length > 0 ? (
                                    <BugReportTable reports={allReports} isAdmin={isAdmin} />
                                ) : (
                                    <p className="text-slate-400">No bug reports have been submitted yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
} 