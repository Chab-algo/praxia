import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            className={cn(
              'peer h-5 w-5 appearance-none rounded border-2 border-border',
              'bg-background cursor-pointer transition-colors',
              'checked:bg-praxia-accent checked:border-praxia-accent',
              'focus:outline-none focus:ring-2 focus:ring-praxia-accent focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          <Check
            className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
            strokeWidth={3}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
