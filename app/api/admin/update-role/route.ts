import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/utils";

// This is a protected admin-only API route to set user roles
export async function POST(request: Request) {
    try {
        // Parse the request body
        const { userId, requesterUserId } = await request.json();

        // Validate the input
        if (!userId || !requesterUserId) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Verify that the requester is an admin
        if (!isAdmin(requesterUserId)) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Update the user's metadata using Clerk's API
        await (await clerkClient()).users.updateUser(userId, {
            publicMetadata: { role: "admin" },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update user role" },
            { status: 500 }
        );
    }
} 