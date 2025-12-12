import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { HospitalCard } from '@/components/HospitalCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { mockHospitals } from '@/data/mockData';
import { SearchFilters, SURGERY_TYPES, SurgeryType } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, LayoutGrid, List, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'lowest_cost', label: 'Lowest Cost' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'nearest', label: 'Nearest' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSurgeryType = searchParams.get('surgeryType') as SurgeryType | undefined;

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    surgeryType: initialSurgeryType,
    sortBy: 'best_match'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate filtering
  const filteredHospitals = useMemo(() => {
    let results = [...mockHospitals];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(h => 
        h.name.toLowerCase().includes(query) ||
        h.surgeries.some(s => s.name.toLowerCase().includes(query)) ||
        h.doctors.some(d => d.name.toLowerCase().includes(query))
      );
    }

    if (filters.surgeryType) {
      results = results.filter(h => h.surgeryTypes.includes(filters.surgeryType!));
    }

    if (filters.minRating) {
      results = results.filter(h => h.rating >= filters.minRating!);
    }

    if (filters.region) {
      results = results.filter(h => h.region === filters.region);
    }

    // Sort
    switch (filters.sortBy) {
      case 'lowest_cost':
        results.sort((a, b) => 
          Math.min(...a.surgeries.map(s => s.minCost)) - Math.min(...b.surgeries.map(s => s.minCost))
        );
        break;
      case 'highest_rated':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'nearest':
        results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
    }

    return results;
  }, [filters]);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
    setSearchParams({ q: filters.query });
  };

  const handleCompare = (id: string, selected: boolean) => {
    if (selected && compareList.length < 4) {
      setCompareList([...compareList, id]);
    } else {
      setCompareList(compareList.filter(i => i !== id));
    }
  };

  const handleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const activeFiltersCount = [
    filters.surgeryType,
    filters.minPrice,
    filters.maxPrice,
    filters.region,
    filters.minRating,
    filters.maxDistance
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Sticky Search Bar */}
        <div className="filter-bar-sticky py-4">
          <div className="container">
            <SearchBar
              value={filters.query}
              onChange={(value) => setFilters(prev => ({ ...prev, query: value }))}
              onSearch={handleSearch}
              onFilterClick={() => setIsFilterOpen(true)}
              onLocationClick={() => {}}
              variant="compact"
            />
          </div>
        </div>

        <div className="container py-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {filters.surgeryType 
                  ? SURGERY_TYPES[filters.surgeryType].label
                  : filters.query 
                    ? `Results for "${filters.query}"`
                    : 'All Hospitals'
                }
              </h1>
              <p className="text-muted-foreground">
                {filteredHospitals.length} hospitals found in Karnataka
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* View Mode */}
              <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'grid' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.surgeryType && (
                <FilterTag 
                  label={SURGERY_TYPES[filters.surgeryType].label}
                  onRemove={() => setFilters(prev => ({ ...prev, surgeryType: undefined }))}
                />
              )}
              {filters.region && (
                <FilterTag 
                  label={filters.region}
                  onRemove={() => setFilters(prev => ({ ...prev, region: undefined }))}
                />
              )}
              {filters.minRating && (
                <FilterTag 
                  label={`${filters.minRating}+ Rating`}
                  onRemove={() => setFilters(prev => ({ ...prev, minRating: undefined }))}
                />
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({ query: filters.query, sortBy: 'best_match' })}
                className="text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Compare Bar */}
          {compareList.length > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-2xl shadow-search p-4 flex items-center gap-4 animate-slide-up">
              <span className="text-sm font-medium">
                {compareList.length} hospitals selected
              </span>
              <Button size="sm" disabled={compareList.length < 2}>
                Compare Now
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCompareList([])}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonLoader variant="hospital-card" count={3} />
            </div>
          ) : (
            <div className={cn(
              "gap-6",
              viewMode === 'grid' 
                ? "grid grid-cols-1 lg:grid-cols-2" 
                : "flex flex-col"
            )}>
              {filteredHospitals.map((hospital, index) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onCompare={handleCompare}
                  onFavorite={handleFavorite}
                  isCompareSelected={compareList.includes(hospital.id)}
                  isFavorited={favorites.includes(hospital.id)}
                  animationDelay={index * 50}
                />
              ))}
            </div>
          )}

          {filteredHospitals.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No hospitals found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={() => setFilters({ query: '', sortBy: 'best_match' })}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <FilterDrawer
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}
