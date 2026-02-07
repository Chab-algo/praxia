export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-4 p-4 border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border p-6">
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-[250px] w-full" />
    </div>
  );
}
