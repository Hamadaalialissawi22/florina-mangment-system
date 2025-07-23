import React from 'react';
import { Coffee } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'جاري التحميل...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative">
          <Coffee className={`${sizeClasses[size]} text-blue-600 animate-pulse mx-auto mb-4`} />
          <div className="absolute inset-0 animate-spin">
            <div className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full`}></div>
          </div>
        </div>
        {message && (
          <p className="text-gray-600 text-sm mt-2">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;