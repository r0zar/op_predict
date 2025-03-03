'use server';

import { currentUser } from "@clerk/nextjs/server";
import { bugReportStore, BugReport } from "@op-predict/lib";

export interface BugReportFormData {
    title: string;
    description: string;
    severity: string;
    url?: string;
}

// Valid bug report statuses
export type BugReportStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

// Mock function for processing payments in this example
// In a real application, this would integrate with a payment provider
async function processRewardPayment(userId: string, amount: number, reportId: string): Promise<boolean> {
    // This is a mock implementation - replace with actual payment processing
    console.log(`Processing payment of $${amount} to user ${userId} for report ${reportId}`);

    // Simulate successful payment
    // In a real application, you would handle failure cases
    return true;
}

// Create a new bug report
export async function createBugReport(data: BugReportFormData) {
    try {
        const user = await currentUser();

        if (!user) {
            return {
                success: false,
                error: 'You must be logged in to create a bug report.'
            };
        }

        const newReport = await bugReportStore.createBugReport({
            ...data,
            createdBy: user.id,
            status: 'open' as const
        });

        // Process the initial $10 reward
        const initialRewardPaid = await processRewardPayment(user.id, 10, newReport.id);

        if (initialRewardPaid) {
            // Update the report to reflect the paid initial reward
            await bugReportStore.updateBugReport(newReport.id, {
                initialRewardPaid: true
            });

            // Update newReport for the response
            const updatedReport = await bugReportStore.getBugReport(newReport.id);
            if (!updatedReport) {
                throw new Error('Failed to get updated report');
            }

            return {
                success: true,
                data: updatedReport,
                rewardPaid: initialRewardPaid
            };
        }

        return {
            success: true,
            data: newReport,
            rewardPaid: false
        };
    } catch (error) {
        console.error('Error creating bug report:', error);
        return {
            success: false,
            error: 'Failed to create bug report. Please try again.'
        };
    }
}

// Get all bug reports
export async function getBugReports() {
    try {
        const user = await currentUser();

        if (!user) {
            return {
                success: false,
                error: 'You must be logged in to view bug reports.'
            };
        }

        const reports = await bugReportStore.getBugReports();

        return {
            success: true,
            data: reports
        };
    } catch (error) {
        console.error('Error fetching bug reports:', error);
        return {
            success: false,
            error: 'Failed to fetch bug reports. Please try again.'
        };
    }
}

// Update bug report status
export async function updateBugReportStatus(reportId: string, status: BugReportStatus) {
    try {
        const user = await currentUser();

        if (!user) {
            return {
                success: false,
                error: 'You must be logged in to update a bug report.'
            };
        }

        // Check if valid status
        if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
            return {
                success: false,
                error: 'Invalid status value.'
            };
        }

        // Get the existing report to check current status
        const existingReport = await bugReportStore.getBugReport(reportId);
        if (!existingReport) {
            return {
                success: false,
                error: 'Bug report not found.'
            };
        }

        // Check if the user is an admin
        const isAdmin = user.publicMetadata.role === 'admin';

        // Prepare update data
        const updateData: Partial<BugReport> = {
            status,
            updatedBy: user.id,
            updatedAt: new Date().toISOString()
        };

        // If status is being set to 'resolved' by an admin and confirmation reward hasn't been paid yet
        let confirmationRewardPaid = false;
        if (
            isAdmin &&
            status === 'resolved' &&
            !existingReport.confirmationRewardPaid &&
            existingReport.createdBy !== user.id // Don't pay if admin is confirming their own report
        ) {
            // Mark as confirmed
            updateData.confirmedBy = user.id;
            updateData.confirmedAt = new Date().toISOString();

            // Process the $90 confirmation reward
            confirmationRewardPaid = await processRewardPayment(existingReport.createdBy, 90, reportId);

            if (confirmationRewardPaid) {
                updateData.confirmationRewardPaid = true;
            }
        }

        const updatedReport = await bugReportStore.updateBugReport(reportId, updateData);

        return {
            success: true,
            data: updatedReport,
            confirmationRewardPaid
        };
    } catch (error) {
        console.error('Error updating bug report status:', error);
        return {
            success: false,
            error: 'Failed to update bug report status. Please try again.'
        };
    }
} 