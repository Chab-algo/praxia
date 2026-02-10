import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2',
          'text-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-vertical',
          error && 'border-praxia-error focus:border-l-praxia-error',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
