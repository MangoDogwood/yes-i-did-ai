// src/components/ui/button.tsx

import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'variant'> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  loading?: boolean;
}

const variants = {
  default: 'bg-blue-500 text-white hover:bg-blue-600',
  outline: 'border border-gray-300 hover:bg-gray-100 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700'
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  default: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'default', 
    size = 'default', 
    children, 
    disabled,
    loading,
    ...props 
  }, ref) => {
    const motionProps = {
      whileHover: disabled || loading ? undefined : { scale: 1.02 },
      whileTap: disabled || loading ? undefined : { scale: 0.98 },
      transition: { duration: 0.2 }
    };

    return (
      <motion.button
        ref={ref}
        {...motionProps}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          rounded-md transition-colors duration-200
          inline-flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `.trim()}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;