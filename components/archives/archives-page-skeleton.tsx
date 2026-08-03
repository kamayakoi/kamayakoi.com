import { Skeleton } from '@/components/ui/skeleton';

export default function ArchivesPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-0 max-w-7xl">
        <div className="relative pt-24 md:pt-32 pb-16 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-full max-w-3xl" />
          <Skeleton className="h-6 w-2/3 max-w-2xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-16">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
