import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { PageTransition } from "@/components/page-transition";
import { spaceGrotesk, jetbrainsMono } from "./fonts";

export const metadata: Metadata = {
  title: "PraxIA - Custom AI Agents in 48 Hours",
  description:
    "PraxIA transforms your business processes into production-ready AI agents. Choose a battle-tested recipe, customize it, deploy it — all within 48 hours.",
  keywords: ["AI agents", "automation", "enterprise AI", "custom AI", "PraxIA"],
  openGraph: {
    title: "PraxIA - Custom AI Agents in 48 Hours",
    description:
      "From business idea to production AI agent in 48h. 5 battle-tested recipes ready to deploy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const fontClasses = `${spaceGrotesk.variable} ${jetbrainsMono.variable}`;

  if (!clerkKey) {
    return (
      <html lang="en" className={fontClasses}>
        <body className="min-h-screen antialiased font-sans">
          <PageTransition>{children}</PageTransition>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en" className={fontClasses}>
        <body className="min-h-screen antialiased font-sans">
          <PageTransition>{children}</PageTransition>
        </body>
      </html>
    </ClerkProvider>
  );
}
