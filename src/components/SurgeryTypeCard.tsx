import { SurgeryType, SURGERY_TYPES } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SurgeryTypeCardProps {
  type: SurgeryType;
  count?: number;
  className?: string;
}

const typeColors: Record<SurgeryType, { bg: string; border: string; icon: string }> = {
  diagnostic: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  curative: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  reconstructive: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
  cosmetic: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600' },
  palliative: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' }
};

export function SurgeryTypeCard({ type, count, className }: SurgeryTypeCardProps) {
  const info = SURGERY_TYPES[type];
  const colors = typeColors[type];

  return (
    <Link
      to={`/search?surgeryType=${type}`}
      className={cn(
        "group relative p-6 rounded-2xl border transition-all duration-normal hover-lift",
        colors.bg,
        colors.border,
        "hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{info.icon}</span>
        <ArrowRight className={cn(
          "w-5 h-5 transition-transform duration-normal group-hover:translate-x-1",
          colors.icon
        )} />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {info.label}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {info.description}
      </p>

      {count !== undefined && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{count}</span> hospitals available
          </span>
        </div>
      )}
    </Link>
  );
}
