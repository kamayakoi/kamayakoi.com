import { Skeleton } from '@/components/ui/skeleton';

export default function StoryPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-border" />
      <div className="container mx-auto px-4 py-0 max-w-7xl">
        <div className="mb-8 pt-24 md:pt-32">
          <div className="flex flex-col md:flex-row md:items-start mb-6 gap-6">
            <Skeleton className="h-10 w-24 self-center md:self-start" />
            <div className="flex-1 max-w-2xl md:max-w-4xl space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </div>
        </div>
        <article className="max-w-3xl sm:max-w-4xl mx-auto pb-10 space-y-6">
          <Skeleton className="aspect-[16/9] w-full rounded-sm" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </article>
      </div>
    </div>
  );
}
