const SkeletonCard = () => (
  <div className="meme-card-skeleton">
    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-[20px] relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Skeleton action buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-9 h-9 bg-white/50 rounded-xl animate-pulse"></div>
        <div className="w-9 h-9 bg-white/50 rounded-xl animate-pulse"></div>
      </div>
      
      {/* Skeleton view indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 bg-white/50 rounded-2xl animate-pulse"></div>
      </div>
    </div>
    
    {/* Skeleton info section */}
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-800/50 to-transparent">
      <div className="space-y-3">
        {/* Date skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white/30 rounded animate-pulse"></div>
          <div className="h-3 bg-white/30 rounded w-20 animate-pulse"></div>
        </div>
        
        {/* Tags skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/30 rounded animate-pulse"></div>
            <div className="h-3 bg-white/30 rounded w-12 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-orange-400/50 rounded-lg w-16 animate-pulse"></div>
            <div className="h-6 bg-orange-400/50 rounded-lg w-12 animate-pulse"></div>
            <div className="h-6 bg-white/30 rounded-lg w-8 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
      {[...Array(14)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
