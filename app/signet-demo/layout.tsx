import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signet Extension Demo | OP_PREDICT",
  description: "Test and explore the Signet extension integration",
};

export default function SignetDemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {children}
    </div>
  );
}