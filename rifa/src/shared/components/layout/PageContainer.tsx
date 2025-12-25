import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container para páginas con centrado vertical y spacing responsive
 * Reemplaza el patrón repetido: min-h-[calc(100vh-200px)] flex items-center justify-center...
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn(
      'min-h-[calc(100vh-200px)]',
      'flex items-start justify-center',
      'py-16 px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
}
