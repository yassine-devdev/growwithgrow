import React from 'react';
import { ModuleType, ModuleSection } from '../types';
import { cn } from '@/lib/utils';

interface BreadcrumbNavigationProps {
  activeModule: ModuleType;
  activeModuleSection: ModuleSection;
  moduleTitle: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  activeModule,
  activeModuleSection,
  moduleTitle
}) => {
  const breadcrumbs = [
    { label: 'Home', path: '/', current: false },
    { label: moduleTitle, path: `/${activeModule}`, current: false },
    { label: activeModuleSection, path: `/${activeModule}/${activeModuleSection}`, current: true }
  ];

  return (
    <nav 
      className="hidden lg:flex items-center gap-2 text-sm text-gray-400 mb-4"
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <span
              className={cn(
                "transition-all duration-300 hover:text-white cursor-pointer",
                breadcrumb.current 
                  ? "text-cyber-cyan font-semibold" 
                  : "text-gray-400 hover:text-white"
              )}
              aria-current={breadcrumb.current ? 'page' : undefined}
            >
              {breadcrumb.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;
