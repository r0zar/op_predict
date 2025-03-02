import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        // Get the current user
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if the requester is an admin
        if (!isAdmin(user.id)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Parse the request body
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Update user role in Clerk
        await (await clerkClient()).users.updateUser(userId, {
            publicMetadata: {
                role: 'admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to set user as admin:', error);
        return NextResponse.json({ error: 'Failed to set user as admin' }, { status: 500 });
    }
} 