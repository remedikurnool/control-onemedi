import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'table' | 'cards';
  rows?: number;
  columns?: number;
  message?: string;
  fullHeight?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  rows = 5,
  columns = 4,
  message = 'Loading...',
  fullHeight = false
}) => {
  const containerClass = fullHeight 
    ? 'flex items-center justify-center min-h-[400px]' 
    : 'flex items-center justify-center py-8';

  if (type === 'spinner') {
    return (
      <div className={containerClass}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        {/* Table Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-8" />
          ))}
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-10" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[180px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingState;