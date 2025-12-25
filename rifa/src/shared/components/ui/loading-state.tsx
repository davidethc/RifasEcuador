import * as React from 'react';
import { Spinner } from './spinner';
import { Skeleton } from './skeleton';
import { cn } from '@/shared/lib/utils';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  skeletonCount?: number;
  className?: string;
}

export function LoadingState({
  message = 'Cargando...',
  variant = 'spinner',
  skeletonCount = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Spinner size="lg" className="mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
