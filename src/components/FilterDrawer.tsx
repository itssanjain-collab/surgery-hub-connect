import { useState } from 'react';
import { X, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SearchFilters, SurgeryType, SURGERY_TYPES, KARNATAKA_REGIONS } from '@/types';
import { cn } from '@/lib/utils';

interface FilterDrawerProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterDrawer({ filters, onFiltersChange, isOpen, onOpenChange }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      query: filters.query,
      sortBy: 'best_match'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const formatPrice = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <SheetTitle className="text-xl font-semibold">Filters</SheetTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Surgery Type */}
          <FilterSection title="Surgery Type" defaultOpen>
            <div className="space-y-3">
              {(Object.keys(SURGERY_TYPES) as SurgeryType[]).map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={localFilters.surgeryType === type}
                    onCheckedChange={(checked) => updateFilter('surgeryType', checked ? type : undefined)}
                  />
                  <span className="flex items-center gap-2 text-sm group-hover:text-primary transition-colors">
                    <span>{SURGERY_TYPES[type].icon}</span>
                    {SURGERY_TYPES[type].label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range" defaultOpen>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min: {formatPrice(localFilters.minPrice || 10000)}</span>
                <span className="text-muted-foreground">Max: {formatPrice(localFilters.maxPrice || 1000000)}</span>
              </div>
              <Slider
                value={[localFilters.minPrice || 10000, localFilters.maxPrice || 1000000]}
                onValueChange={([min, max]) => {
                  updateFilter('minPrice', min);
                  updateFilter('maxPrice', max);
                }}
                min={10000}
                max={1000000}
                step={10000}
                className="mt-2"
              />
            </div>
          </FilterSection>

          {/* Region */}
          <FilterSection title="Region / District">
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {KARNATAKA_REGIONS.map((region) => (
                <label key={region} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={localFilters.region === region}
                    onCheckedChange={(checked) => updateFilter('region', checked ? region : undefined)}
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">{region}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating */}
          <FilterSection title="Minimum Rating">
            <div className="flex gap-2">
              {[4.5, 4, 3.5, 3].map((rating) => (
                <Button
                  key={rating}
                  variant={localFilters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('minRating', localFilters.minRating === rating ? undefined : rating)}
                  className="flex-1"
                >
                  {rating}+
                </Button>
              ))}
            </div>
          </FilterSection>

          {/* Distance */}
          <FilterSection title="Maximum Distance">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{localFilters.maxDistance || 50} km</span>
              </div>
              <Slider
                value={[localFilters.maxDistance || 50]}
                onValueChange={([value]) => updateFilter('maxDistance', value)}
                min={5}
                max={100}
                step={5}
              />
            </div>
          </FilterSection>
        </div>

        {/* Apply Button */}
        <div className="sticky bottom-0 bg-card pt-4 pb-6 border-t border-border">
          <Button onClick={applyFilters} className="w-full" size="lg">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, defaultOpen = false, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full py-2 text-left">
          <span className="font-medium text-foreground">{title}</span>
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-normal",
              isOpen && "rotate-180"
            )} 
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 animate-accordion-down">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
