import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Table = ({ children, className }: TableProps) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full border-collapse', className)}>{children}</table>
  </div>
);

export interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = ({ children, className }: TableSectionProps) => (
  <thead className={cn('border-b border-border', className)}>{children}</thead>
);

export const TableBody = ({ children, className }: TableSectionProps) => (
  <tbody className={className}>{children}</tbody>
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow = ({ children, className, ...props }: TableRowProps) => (
  <tr
    className={cn(
      'border-b border-border last:border-0 hover:bg-praxia-gray-50 transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export const TableHead = ({ children, className, ...props }: TableCellProps) => (
  <th
    className={cn(
      'text-left py-3 px-4 text-sm font-medium text-muted-foreground',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className, ...props }: TableCellProps) => (
  <td className={cn('py-4 px-4 text-sm', className)} {...props}>
    {children}
  </td>
);
