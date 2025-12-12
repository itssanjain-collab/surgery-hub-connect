import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onFilterClick?: () => void;
  onLocationClick?: () => void;
  showFilters?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onFilterClick,
  onLocationClick,
  showFilters = true,
  className,
  variant = 'default'
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const isCompact = variant === 'compact';

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "bg-card rounded-xl border border-border/50 transition-all duration-normal",
        isFocused && "border-primary/50 shadow-search",
        isCompact ? "p-2" : "p-3 md:p-4",
        className
      )}
    >
      <div className={cn("flex items-center gap-2", isCompact ? "gap-2" : "gap-3")}>
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors",
            isFocused && "text-primary",
            isCompact ? "w-4 h-4" : "w-5 h-5"
          )} />
          <Input
            type="text"
            placeholder="Search hospitals, surgeries, doctors..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "border-0 bg-muted/50 focus:bg-muted/80 transition-colors",
              isCompact ? "pl-9 h-10 text-sm" : "pl-12 h-12 md:h-14 text-base"
            )}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {onLocationClick && (
          <Button 
            type="button" 
            variant="outline" 
            size={isCompact ? "sm" : "lg"}
            onClick={onLocationClick}
            className={cn(
              "gap-2 flex-shrink-0",
              isCompact ? "h-10 px-3" : "h-12 md:h-14 px-4"
            )}
          >
            <MapPin className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
            <span className="hidden sm:inline">Near Me</span>
          </Button>
        )}

        {showFilters && onFilterClick && (
          <Button 
            type="button" 
            variant="outline"
            size={isCompact ? "sm" : "lg"}
            onClick={onFilterClick}
            className={cn(
              "gap-2 flex-shrink-0",
              isCompact ? "h-10 px-3" : "h-12 md:h-14 px-4"
            )}
          >
            <SlidersHorizontal className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        )}

        <Button 
          type="submit" 
          size={isCompact ? "sm" : "lg"}
          className={cn(
            "flex-shrink-0",
            isCompact ? "h-10 px-4" : "h-12 md:h-14 px-6 md:px-8"
          )}
        >
          Search
        </Button>
      </div>
    </form>
  );
}
