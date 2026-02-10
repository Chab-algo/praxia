import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono uppercase rounded border transition-colors',
  {
    variants: {
      variant: {
        active: 'bg-[rgb(var(--praxia-success)_/_0.1)] text-[rgb(var(--praxia-success))] border-[rgb(var(--praxia-success)_/_0.3)]',
        draft: 'bg-[rgb(var(--praxia-gray-400)_/_0.1)] text-[rgb(var(--praxia-gray-600))] border-[rgb(var(--praxia-gray-400)_/_0.3)]',
        error: 'bg-[rgb(var(--praxia-error)_/_0.1)] text-[rgb(var(--praxia-error))] border-[rgb(var(--praxia-error)_/_0.3)]',
        warning: 'bg-[rgb(var(--praxia-warning)_/_0.1)] text-[rgb(var(--praxia-warning))] border-[rgb(var(--praxia-warning)_/_0.3)]',
        default: 'bg-muted text-muted-foreground border-border',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
      },
      withDot: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      withDot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
}

function Badge({ className, variant, size, withDot, children, ...props }: BadgeProps) {
  const dotColor = {
    active: 'bg-[rgb(var(--praxia-success))]',
    draft: 'bg-[rgb(var(--praxia-gray-400))]',
    error: 'bg-[rgb(var(--praxia-error))]',
    warning: 'bg-[rgb(var(--praxia-warning))]',
    default: 'bg-muted-foreground',
  };

  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {withDot && variant && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[variant])} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
