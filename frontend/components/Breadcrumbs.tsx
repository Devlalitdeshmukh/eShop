import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on the home page
  if (location.pathname === '/' || location.pathname === '' || location.pathname === '/about') return null;

  return (
    <nav className="flex px-4 py-3 text-gray-700 bg-white border-b border-gray-100 print:hidden" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto w-full flex items-center space-x-2">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
        >
          <Home className="w-4 h-4 mr-1.5" />
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Prettier labels: capitalize and replace hyphens
          const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <div key={to} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
              {last ? (
                <span className="text-sm font-semibold text-brand-600 truncate max-w-[150px] md:max-w-none">
                  {label}
                </span>
              ) : (
                <Link 
                  to={to} 
                  className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;