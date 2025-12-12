import { Star, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import { cn } from '@/lib/utils';

interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
  variant?: 'default' | 'compact';
}

export function DoctorCard({ doctor, className, variant = 'default' }: DoctorCardProps) {
  const isCompact = variant === 'compact';

  return (
    <div 
      className={cn(
        "card-elevated p-4 flex gap-4 transition-all duration-normal",
        isCompact ? "items-center" : "flex-col sm:flex-row",
        className
      )}
    >
      {/* Photo */}
      <div className={cn(
        "flex-shrink-0 overflow-hidden rounded-full bg-muted",
        isCompact ? "w-14 h-14" : "w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0"
      )}>
        <img
          src={doctor.photoUrl}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className={cn("flex-1 min-w-0", isCompact ? "" : "text-center sm:text-left")}>
        <h4 className="font-semibold text-foreground truncate">{doctor.name}</h4>
        <p className="text-sm text-primary font-medium truncate">{doctor.specialization}</p>
        
        {!isCompact && (
          <p className="text-sm text-muted-foreground mt-1 truncate">{doctor.qualification}</p>
        )}

        <div className={cn(
          "flex items-center gap-3 mt-2",
          isCompact ? "" : "justify-center sm:justify-start"
        )}>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium">{doctor.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{doctor.experience} yrs</span>
          </div>
        </div>

        {!isCompact && (
          <>
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
              {doctor.availability.map((day) => (
                <span 
                  key={day}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground">Consultation</span>
                <p className="text-lg font-bold text-foreground">₹{doctor.consultationFee}</p>
              </div>
              <Button size="sm" className="gap-1.5">
                <Calendar className="w-4 h-4" />
                Book
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
