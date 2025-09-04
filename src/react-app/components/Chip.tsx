import { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export default function Chip({ 
  children, 
  variant = 'secondary', 
  size = 'md', 
  onClick, 
  className = '' 
}: ChipProps) {
  const baseClasses = 'pill inline-flex items-center font-medium transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-red-50 text-red-600 hover:bg-red-100 hover:opacity-90',
    secondary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:opacity-90',
    success: 'bg-green-50 text-green-600 hover:bg-green-100 hover:opacity-90',
    warning: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:opacity-90',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 hover:opacity-90'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const Component = onClick ? 'button' : 'span';
  
  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
