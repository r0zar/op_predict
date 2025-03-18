import { AppSidebar } from "@/components/app-sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // Redirect if not signed in
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 container mx-auto px-4 overflow-scroll sm:overflow-auto">
        {children}
      </div>
    </div>
  );
}
