import { kv } from '@vercel/kv';
import crypto from 'crypto';

// Define bug report types
export type BugReport = {
    id: string;
    title: string;
    description: string;
    severity: string;
    url?: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    createdBy: string;
    createdAt: string;
    updatedBy?: string;
    updatedAt?: string;
    // Reward tracking
    initialRewardPaid: boolean;
    confirmationRewardPaid: boolean;
    confirmedBy?: string;
    confirmedAt?: string;
};

// KV store keys
const BUG_REPORTS_KEY = 'bug_reports';
const BUG_REPORT_IDS_KEY = 'bug_report_ids';
const USER_BUG_REPORTS_KEY = (userId: string) => `user:${userId}:bug_reports`;

// Bug report store with Vercel KV
export const bugReportStore = {
    // Get all bug reports
    async getBugReports(): Promise<BugReport[]> {
        try {
            // Get all bug report IDs
            const reportIds: string[] = await kv.smembers(BUG_REPORT_IDS_KEY);

            if (!reportIds || reportIds.length === 0) {
                return [];
            }

            // Get all bug reports
            const reportPromises = reportIds.map((id: string) =>
                kv.hgetall(`${BUG_REPORTS_KEY}:${id}`)
            );

            const reports = await Promise.all(reportPromises);

            // Filter out any null values (in case a report was deleted)
            return reports.filter((report): report is BugReport => Boolean(report));
        } catch (error) {
            console.error('Error fetching bug reports:', error);
            return [];
        }
    },

    // Get a specific bug report by ID
    async getBugReport(id: string): Promise<BugReport | undefined> {
        try {
            const report = await kv.hgetall(`${BUG_REPORTS_KEY}:${id}`);
            return report as BugReport || undefined;
        } catch (error) {
            console.error(`Error fetching bug report ${id}:`, error);
            return undefined;
        }
    },

    // Create a new bug report
    async createBugReport(data: {
        title: string;
        description: string;
        severity: string;
        url?: string;
        createdBy: string;
    }): Promise<BugReport> {
        // Generate a unique ID
        const id = crypto.randomUUID();

        // Create new bug report
        const bugReport: BugReport = {
            id,
            title: data.title,
            description: data.description,
            severity: data.severity,
            url: data.url,
            status: 'open',
            createdBy: data.createdBy,
            createdAt: new Date().toISOString(),
            // Initialize reward fields
            initialRewardPaid: false,
            confirmationRewardPaid: false
        };

        try {
            // Save bug report
            await kv.hset(`${BUG_REPORTS_KEY}:${id}`, bugReport);

            // Add to global set of bug report IDs
            await kv.sadd(BUG_REPORT_IDS_KEY, id);

            // Add to user's set of bug reports
            await kv.sadd(USER_BUG_REPORTS_KEY(data.createdBy), id);

            return bugReport;
        } catch (error) {
            console.error('Error creating bug report:', error);
            throw new Error('Failed to create bug report');
        }
    },

    // Update an existing bug report
    async updateBugReport(
        id: string,
        reportData: Partial<BugReport>
    ): Promise<BugReport> {
        try {
            const existingReport = await this.getBugReport(id);

            if (!existingReport) {
                throw new Error(`Bug report with ID ${id} not found`);
            }

            // Merge existing data with updates
            const updatedReport: BugReport = {
                ...existingReport,
                ...reportData,
            };

            // Save updated bug report
            await kv.hset(`${BUG_REPORTS_KEY}:${id}`, updatedReport);

            return updatedReport;
        } catch (error) {
            console.error(`Error updating bug report ${id}:`, error);
            throw new Error('Failed to update bug report');
        }
    },

    // Delete a bug report
    async deleteBugReport(id: string): Promise<boolean> {
        try {
            const report = await this.getBugReport(id);

            if (!report) {
                return false;
            }

            // Delete bug report
            await kv.del(`${BUG_REPORTS_KEY}:${id}`);

            // Remove from global set of bug report IDs
            await kv.srem(BUG_REPORT_IDS_KEY, id);

            // Remove from user's set of bug reports
            await kv.srem(USER_BUG_REPORTS_KEY(report.createdBy), id);

            return true;
        } catch (error) {
            console.error(`Error deleting bug report ${id}:`, error);
            return false;
        }
    }
}; 