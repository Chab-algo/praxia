import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-11 w-full rounded-md border border-border bg-background px-3 py-2',
          'text-sm transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',

          // Focus styles
          'focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2',

          // Error styles
          error && 'border-praxia-error focus:border-l-praxia-error',

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
