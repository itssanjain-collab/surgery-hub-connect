import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'hospital-card' | 'doctor-card' | 'text' | 'avatar' | 'button';
  className?: string;
  count?: number;
}

export function SkeletonLoader({ variant = 'card', className, count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'hospital-card':
        return (
          <div className={cn("card-elevated p-4 space-y-4", className)}>
            <div className="flex gap-4">
              <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-8 flex-1 rounded-lg" />
              <div className="skeleton h-8 flex-1 rounded-lg" />
            </div>
          </div>
        );
      
      case 'doctor-card':
        return (
          <div className={cn("card-elevated p-4 flex items-center gap-4", className)}>
            <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/3 rounded" />
            </div>
          </div>
        );
      
      case 'avatar':
        return <div className={cn("skeleton w-12 h-12 rounded-full", className)} />;
      
      case 'button':
        return <div className={cn("skeleton h-10 w-24 rounded-lg", className)} />;
      
      case 'text':
        return <div className={cn("skeleton h-4 w-full rounded", className)} />;
      
      default:
        return <div className={cn("skeleton h-32 w-full rounded-xl", className)} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}
