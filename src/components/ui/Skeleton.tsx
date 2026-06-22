interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 20, className = "" }: SkeletonProps) {
  return (
    <div
      className={`shimmer-skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-navy-800">
      <Skeleton className="h-24 rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/60 bg-navy-800 p-5">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 rounded-xl border border-slate-700/60 bg-navy-800 p-4 space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatSkeletonMessages() {
  return (
    <div className="space-y-4">
      {[80, 60, 90].map((w, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className="shimmer-skeleton h-10 rounded-2xl" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}
