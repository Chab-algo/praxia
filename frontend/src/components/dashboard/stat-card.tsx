'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ label, value, icon: Icon, href, trend }: StatCardProps) {
  const cardContent = (
    <>
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm text-muted-foreground">{label}</span>
          {Icon && (
            <div className="w-8 h-8 rounded-md bg-praxia-gray-50 flex items-center justify-center group-hover:bg-praxia-accent/10 transition-colors">
              <Icon className="w-4 h-4 text-praxia-accent" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-4xl font-bold font-mono">{value}</div>

          {trend && (
            <div
              className={`text-xs font-medium ${
                trend.positive ? 'text-praxia-success' : 'text-praxia-error'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
      </>
    );

  if (href) {
    return (
      <a href={href} className="block">
        <Card hoverable padding="md" className="stat-card group">
          {cardContent}
        </Card>
      </a>
    );
  }

  return (
    <Card padding="md" className="stat-card">
      {cardContent}
    </Card>
  );
}
