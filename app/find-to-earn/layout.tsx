import { AppSidebar } from "@/components/app-sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find-to-Earn | OP_PREDICT",
  description: "Predict the outcome of Skullcoin Find-to-Earn events",
};

export default function FindToEarnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 container mx-auto px-4 overflow-scroll sm:overflow-auto">
        {children}
      </div>
    </div>
  );
}