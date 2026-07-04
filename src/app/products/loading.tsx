export default function ProductsLoading() {
  return (
    <main className="container mx-auto px-4 py-12 lg:py-20 animate-fade-in">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="w-full md:w-1/3">
          <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-900 rounded mt-3" />
        </div>
        
        {/* Filter/Sort Skeleton */}
        <div className="w-full md:w-auto flex gap-3">
          <div className="h-12 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-full" />
          <div className="h-12 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Skeleton (Desktop) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b border-neutral-100 dark:border-neutral-800 pb-8">
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-neutral-100 dark:bg-neutral-900 rounded" />
                      <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-900 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                {/* Image Placeholder */}
                <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 rounded-2xl relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
                </div>
                
                {/* Info Placeholder */}
                <div className="flex flex-col gap-2 px-1">
                  <div className="w-16 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="w-full h-5 bg-neutral-100 dark:bg-neutral-900 rounded" />
                  <div className="w-2/3 h-5 bg-neutral-100 dark:bg-neutral-900 rounded" />
                  <div className="w-24 h-4 bg-neutral-200 dark:bg-neutral-800 rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
