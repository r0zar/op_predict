'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { isAdmin } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_USER_IDS } from "@/lib/utils";

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [adminUsers, setAdminUsers] = useState<string[]>([]);

    // Set initial admin users from constants
    useEffect(() => {
        setAdminUsers(ADMIN_USER_IDS);
    }, []);

    // Check if user is admin
    if (isLoaded && user) {
        const userIsAdmin = isAdmin(user.id);

        if (!userIsAdmin) {
            // Redirect non-admin users
            redirect('/');
        }
    }

    if (!isLoaded) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (!user) {
        redirect('/');
    }

    const handleSetAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the API to update user role
            const response = await fetch('/api/admin/set-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set user as admin');
            }

            // Show success message

            // Add to local admin users list
            setAdminUsers(prev => [...prev, userId]);

            // Reset form
            setUserId('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6 text-slate-200">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Grant Admin Permissions</CardTitle>
                        <CardDescription className="text-slate-400">
                            Add admin privileges to a user by their ID
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSetAdmin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="userId" className="text-slate-300">User ID</Label>
                                <Input
                                    id="userId"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="user_2tkBcBEVGanm3LHkg6XK7j91DRj"
                                    className="bg-slate-700 border-slate-600 text-slate-200"
                                />
                                <p className="text-xs text-slate-400">
                                    The ID should be in the format: user_xxxxx
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? 'Processing...' : 'Grant Admin Access'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Admin User List</CardTitle>
                        <CardDescription className="text-slate-400">
                            List of current admin users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {adminUsers.map((adminId) => (
                                <div key={adminId} className="p-3 rounded bg-slate-700 border border-slate-600">
                                    <p className="font-medium text-slate-200">{adminId}</p>
                                    {adminId === "user_2tkBcBEVGanm3LHkg6XK7j91DRj" && (
                                        <p className="text-xs text-slate-400 mt-1">Added recently</p>
                                    )}
                                </div>
                            ))}
                            {adminUsers.length === 0 && (
                                <p className="text-slate-400">No admin users found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}