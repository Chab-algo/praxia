'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { setup3DTilt } from '@/lib/gsap-animations';

interface RecipeCardProps {
  title: string;
  description: string;
  category: string;
  estimatedTime?: string;
  slug: string;
}

export function RecipeCard({
  title,
  description,
  category,
  estimatedTime,
  slug,
}: RecipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const cleanup = setup3DTilt(cardRef.current);
    return cleanup;
  }, []);

  return (
    <Card
      ref={cardRef}
      accent="left"
      className="recipe-card snap-start flex-shrink-0 w-80 h-full flex flex-col group cursor-pointer"
      onClick={() => {
        window.location.href = `/dashboard/recipes/${slug}`;
      }}
    >
      {/* Category badge */}
      <div className="mb-4">
        <span className="text-xs font-mono uppercase text-praxia-accent bg-praxia-accent/10 px-2 py-1 rounded">
          {category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-h4 mb-3 group-hover:text-praxia-accent transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-body-sm text-muted-foreground mb-4 flex-grow">
        {description}
      </p>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        {estimatedTime && (
          <span className="text-xs font-mono text-muted-foreground">{estimatedTime}</span>
        )}
        <div className="flex items-center gap-1 text-sm font-medium text-praxia-accent group-hover:gap-2 transition-all">
          Deploy
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}
