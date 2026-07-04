export default function ProductDetailsLoading() {
  return (
    <main className="container mx-auto px-4 py-12 lg:py-20 flex flex-col items-center animate-fade-in">
      
      {/* Top Info - Skeleton */}
      <div className="w-full max-w-2xl flex flex-col items-center text-center mb-10 gap-4">
        <div className="w-24 h-3 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
        <div className="w-3/4 h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
        <div className="w-1/2 h-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg mb-2" />
        <div className="flex items-center justify-center gap-3">
          <div className="w-32 h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="w-24 h-6 bg-neutral-100 dark:bg-neutral-900 rounded-full" />
        </div>
      </div>

      {/* Main Layout - Image & Actions */}
      <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-[1400px] items-start justify-center">
        
        {/* Left: Image Gallery Skeleton */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8 items-center lg:items-start">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
          </div>
          
          {/* Description Skeleton */}
          <div className="w-full px-2 lg:px-4 mb-8 lg:mb-0 space-y-4">
            <div className="w-32 h-5 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
            <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-900 rounded" />
            <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-900 rounded" />
            <div className="w-5/6 h-4 bg-neutral-100 dark:bg-neutral-900 rounded" />
            <div className="w-4/5 h-4 bg-neutral-100 dark:bg-neutral-900 rounded" />
          </div>
        </div>

        {/* Right: Info Stack (Buying Options) Skeleton */}
        <div className="w-full lg:w-[40%] max-w-md flex flex-col bg-white dark:bg-neutral-950 rounded-3xl p-6 sm:p-8 border border-neutral-100 dark:border-neutral-900">
          
          {/* Sizes Skeleton */}
          <div className="mb-8">
            <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-[52px] rounded-full bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex flex-col gap-3 mb-10">
            <div className="w-full h-[52px] rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex gap-3">
              <div className="flex-1 h-[52px] rounded-full bg-neutral-100 dark:bg-neutral-900" />
              <div className="w-12 h-[52px] rounded-full bg-neutral-100 dark:bg-neutral-900" />
            </div>
          </div>

          {/* Trust Badges Skeleton */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-100 dark:border-neutral-800">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900" />
                <div className="w-16 h-2 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
