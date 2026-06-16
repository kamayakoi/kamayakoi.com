import { Skeleton } from '@/components/ui/skeleton';

export default function EventPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border" />
      <div className="container mx-auto px-4 pt-24 md:pt-32 pb-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Skeleton className="aspect-[3/4] w-full rounded-sm" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-14 w-full rounded-sm" />
              <Skeleton className="h-14 w-full rounded-sm" />
              <Skeleton className="h-14 w-full rounded-sm" />
            </div>
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-sm" />
      </div>
    </div>
  );
}
