import { AppSidebar } from "@/components/app-sidebar";
import { currentUser } from "@clerk/nextjs/server";

export default async function MarketsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Get the current user, but don't redirect if not signed in
    const user = await currentUser();

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 container mx-auto px-4 overflow-scroll sm:overflow-auto">
                {children}
            </div>
        </div>
    );
}
