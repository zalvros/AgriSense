export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-foreground/10 ${className}`} />;
}

export function PriceSkeleton() {
  return (
    <tr className="border-b border-border/40">
      <td className="px-2 py-2"><Skeleton className="h-4 w-24" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-16" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-20" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-16" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-16" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-16" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-16" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-12" /></td>
      <td className="px-2 py-2"><Skeleton className="h-4 w-20" /></td>
    </tr>
  );
}

export function WeatherCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 p-6">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-12 w-24 mb-3" />
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="flex-1">
          <Skeleton className="h-6 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}
