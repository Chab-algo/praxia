import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "PraxIA - AI Agent Studio",
  description: "From business idea to production AI agent in 48h",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clerk requires a publishable key - skip provider if not configured
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkKey) {
    return (
      <html lang="fr">
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="fr">
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
