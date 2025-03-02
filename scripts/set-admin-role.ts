/**
 * Script to set a user as an admin
 * 
 * This can be run with:
 * npx ts-node -r tsconfig-paths/register scripts/set-admin-role.ts user_2tkBcBEVGanm3LHkg6XK7j91DRj
 */

import { config } from 'dotenv';
// Load environment variables
config();

async function main() {
    try {
        const userId = process.argv[2];

        if (!userId) {
            console.error('Please provide a user ID as an argument');
            process.exit(1);
        }

        console.log(`Setting user ${userId} as admin...`);

        // Import the Clerk SDK (needs to be after env vars are loaded)
        const { Clerk } = require('@clerk/clerk-sdk-node');
        const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

        // Set the user's role to admin
        await clerk.users.updateUser(userId, {
            publicMetadata: { role: 'admin' }
        });

        console.log('✅ User is now an admin!');

    } catch (error) {
        console.error('Error setting admin role:', error);
        process.exit(1);
    }
}

main(); 