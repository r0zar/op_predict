import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { UserCircle, WalletIcon } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StacksAddressForm } from './stacks-address-form';

export default async function SettingsPage() {
    const user = await currentUser();

    // Redirect if not signed in
    if (!user) {
        redirect("/");
    }

    // Format dates for display
    const formatDate = (timestamp: number | null) => {
        if (!timestamp) return "N/A";
        return format(new Date(timestamp), "PPP 'at' p");
    };

    // Get Stacks address from public metadata
    const stacksAddress = user.publicMetadata?.stacksAddress as string | undefined;

    return (
        <div className="container max-w-4xl py-10">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

            <div className="grid gap-6">
                {/* User Profile Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback>
                                <UserCircle className="h-10 w-10" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                            <CardDescription>{user.primaryEmailAddress?.emailAddress}</CardDescription>
                            <div className="flex gap-2 mt-2">
                                {user.externalAccounts.map((account) => (
                                    <Badge key={account.id} variant="outline">
                                        {account.provider.replace('oauth_', '')}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Stacks Address Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <WalletIcon className="h-5 w-5" />
                            <CardTitle>Stacks Address</CardTitle>
                        </div>
                        <CardDescription>Connect your Stacks wallet to use on-chain tokens for predictions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stacksAddress ? (
                            <div className="flex flex-col space-y-2">
                                <p className="text-sm font-medium">Current Address:</p>
                                <code className="bg-muted p-2 rounded text-xs sm:text-sm break-all">
                                    {stacksAddress}
                                </code>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No Stacks address connected yet</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <StacksAddressForm currentAddress={stacksAddress} />
                    </CardFooter>
                </Card>

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>Information about your account status and settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">User ID</TableCell>
                                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Account Status</TableCell>
                                    <TableCell>
                                        {user.banned ? (
                                            <Badge variant="destructive">Banned</Badge>
                                        ) : user.locked ? (
                                            <Badge variant="destructive">Locked</Badge>
                                        ) : (
                                            <Badge>Active</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Created</TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Last Sign In</TableCell>
                                    <TableCell>{formatDate(user.lastSignInAt)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Last Active</TableCell>
                                    <TableCell>{formatDate(user.lastActiveAt)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Two-Factor Authentication</TableCell>
                                    <TableCell>
                                        {user.twoFactorEnabled ? (
                                            <Badge>Enabled</Badge>
                                        ) : (
                                            <Badge variant="outline">Disabled</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Password Authentication</TableCell>
                                    <TableCell>
                                        {user.passwordEnabled ? (
                                            <Badge>Enabled</Badge>
                                        ) : (
                                            <Badge variant="outline">Disabled</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Create Organization</TableCell>
                                    <TableCell>
                                        {user.createOrganizationEnabled ? (
                                            <Badge>Enabled</Badge>
                                        ) : (
                                            <Badge variant="outline">Disabled</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Account Deletion</TableCell>
                                    <TableCell>
                                        {user.deleteSelfEnabled ? (
                                            <Badge>Enabled</Badge>
                                        ) : (
                                            <Badge variant="outline">Disabled</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Email Addresses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Email Addresses</CardTitle>
                        <CardDescription>Email addresses associated with your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Primary</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.emailAddresses.map((email) => (
                                    <TableRow key={email.id}>
                                        <TableCell>{email.emailAddress}</TableCell>
                                        <TableCell>
                                            {email.verification?.status === "verified" ? (
                                                <Badge>Verified</Badge>
                                            ) : (
                                                <Badge variant="outline">Unverified</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.primaryEmailAddressId === email.id ? (
                                                <Badge>Primary</Badge>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* External Accounts */}
                {user.externalAccounts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Accounts</CardTitle>
                            <CardDescription>External accounts linked to your profile</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Session Expires</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.externalAccounts.map((account) => (
                                        <TableRow key={account.id}>
                                            <TableCell className="capitalize">
                                                {account.provider.replace('oauth_', '')}
                                            </TableCell>
                                            <TableCell>{account.emailAddress}</TableCell>
                                            <TableCell>{account.verification?.expireAt ? formatDate(account.verification?.expireAt) : "N/A"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}