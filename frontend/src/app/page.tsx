import { redirect } from "next/navigation";

export default async function Home() {
  // Without Clerk configured, go straight to dashboard
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    redirect("/dashboard");
  }

  // With Clerk, check auth
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}
