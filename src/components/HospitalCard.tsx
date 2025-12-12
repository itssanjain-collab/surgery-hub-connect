import { useState } from 'react';
import { Star, MapPin, Heart, Phone, Calendar, ChevronRight, BadgeCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Hospital, SURGERY_TYPES } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface HospitalCardProps {
  hospital: Hospital;
  onFavorite?: (id: string) => void;
  onCompare?: (id: string, selected: boolean) => void;
  isCompareSelected?: boolean;
  isFavorited?: boolean;
  className?: string;
  animationDelay?: number;
}

export function HospitalCard({
  hospital,
  onFavorite,
  onCompare,
  isCompareSelected = false,
  isFavorited = false,
  className,
  animationDelay = 0
}: HospitalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const minCost = Math.min(...hospital.surgeries.map(s => s.minCost));
  const maxCost = Math.max(...hospital.surgeries.map(s => s.maxCost));

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <article
      className={cn(
        "card-elevated group relative overflow-hidden animate-fade-up",
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Image */}
        <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 overflow-hidden rounded-xl">
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}
          <img
            src={hospital.imageUrl}
            alt={hospital.name}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-slow",
              isHovered && "scale-105",
              !imageLoaded && "opacity-0"
            )}
          />
          {/* Compare Checkbox */}
          {onCompare && (
            <div className="absolute top-2 left-2">
              <label className="flex items-center gap-2 px-2 py-1 rounded-md bg-card/90 backdrop-blur-sm cursor-pointer">
                <Checkbox
                  checked={isCompareSelected}
                  onCheckedChange={(checked) => onCompare(hospital.id, checked as boolean)}
                  className="border-primary/50 data-[state=checked]:bg-primary"
                />
                <span className="text-xs font-medium text-foreground">Compare</span>
              </label>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <Link 
                to={`/hospital/${hospital.id}`}
                className="group/link inline-flex items-center gap-2"
              >
                <h3 className="text-lg font-semibold text-foreground truncate group-hover/link:text-primary transition-colors">
                  {hospital.name}
                </h3>
                {hospital.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </Link>
              <p className="text-sm text-muted-foreground truncate">{hospital.tagline}</p>
            </div>
            
            {/* Favorite Button */}
            {onFavorite && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onFavorite(hospital.id)}
                className="flex-shrink-0"
              >
                <Heart 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground"
                  )} 
                />
              </Button>
            )}
          </div>

          {/* Rating & Location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-semibold">{hospital.rating}</span>
              <span className="text-muted-foreground">({hospital.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{hospital.city}</span>
              {hospital.distance && (
                <span className="text-primary font-medium">• {hospital.distance} km</span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {hospital.accreditations.slice(0, 3).map((acc) => (
              <span key={acc} className="trust-badge">
                {acc}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Clock className="w-3 h-3" />
              Est. {hospital.yearEstablished}
            </span>
          </div>

          {/* Surgery Types */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hospital.surgeryTypes.slice(0, 3).map((type) => (
              <span 
                key={type}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {SURGERY_TYPES[type].label.replace(' Surgery', '')}
              </span>
            ))}
            {hospital.surgeryTypes.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                +{hospital.surgeryTypes.length - 3} more
              </span>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary">{formatCurrency(minCost)}</span>
                <span className="text-sm text-muted-foreground">- {formatCurrency(maxCost)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Book</span>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link to={`/hospital/${hospital.id}`}>
                  View
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
