import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      {/* Main Content */}
      <main
        className={cn(
          "lg:ml-64 transition-all duration-300",
          "min-h-screen",
          className
        )}
      >
        {/* Content Container */}
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
