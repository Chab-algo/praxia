"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-accent"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
