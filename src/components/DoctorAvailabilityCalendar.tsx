import { useState, useMemo } from 'react';
import { Doctor } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DoctorAvailabilityCalendarProps {
  doctors: Doctor[];
  onBookDoctor?: (doctor: Doctor, date: Date) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOT_COLORS: Record<string, string> = {
  morning: 'bg-amber-500/80',
  afternoon: 'bg-sky-500/80',
  evening: 'bg-violet-500/80',
};

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: '9AM - 12PM',
  afternoon: '12PM - 5PM',
  evening: '5PM - 8PM',
};

export function DoctorAvailabilityCalendar({ doctors, onBookDoctor }: DoctorAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const days: Date[] = [];

    // Add padding for days before the first day of the month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const paddingDate = new Date(currentYear, currentMonth, -i);
      days.push(paddingDate);
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    // Add padding for days after the last day of the month
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(currentYear, currentMonth + 1, i));
    }

    return days;
  }, [currentMonth, currentYear]);

  const getDoctorsAvailableOnDay = (date: Date) => {
    const dayName = FULL_DAYS[date.getDay()];
    return doctors.filter(doctor => {
      // Check if availability is an object (new format) or array (old format)
      if (typeof doctor.availability === 'object' && !Array.isArray(doctor.availability)) {
        return dayName in (doctor.availability as Record<string, string[]>);
      }
      return doctor.availability?.includes(dayName);
    });
  };

  const getTimeSlotsForDoctor = (doctor: Doctor, date: Date): string[] => {
    const dayName = FULL_DAYS[date.getDay()];
    if (typeof doctor.availability === 'object' && !Array.isArray(doctor.availability)) {
      return (doctor.availability as Record<string, string[]>)[dayName] || [];
    }
    // For old format, return all slots if available
    return doctor.availability?.includes(dayName) ? ['morning', 'afternoon', 'evening'] : [];
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const availableDoctorsForSelectedDate = selectedDate ? getDoctorsAvailableOnDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Doctor Availability Calendar</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-muted-foreground">Time slots:</span>
        {Object.entries(TIME_SLOT_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 rounded-full', TIME_SLOT_COLORS[key])} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {daysInMonth.map((date, index) => {
            const availableDoctors = getDoctorsAvailableOnDay(date);
            const hasAvailability = availableDoctors.length > 0;
            const past = isPastDate(date);

            return (
              <TooltipProvider key={index}>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => !past && hasAvailability && setSelectedDate(date)}
                      disabled={past || !hasAvailability}
                      className={cn(
                        'relative min-h-[80px] p-2 border-t border-r border-border transition-all text-left',
                        'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                        !isCurrentMonth(date) && 'bg-muted/30 text-muted-foreground',
                        isToday(date) && 'bg-primary/5',
                        isSelected(date) && 'bg-primary/10 ring-2 ring-primary ring-inset',
                        past && 'opacity-50 cursor-not-allowed',
                        !hasAvailability && !past && 'cursor-default',
                        index % 7 === 6 && 'border-r-0'
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isToday(date) && 'text-primary font-bold',
                          !isCurrentMonth(date) && 'text-muted-foreground/60'
                        )}
                      >
                        {date.getDate()}
                      </span>

                      {hasAvailability && !past && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex gap-0.5 flex-wrap">
                            {/* Show unique time slots from all doctors */}
                            {['morning', 'afternoon', 'evening'].map((slot) => {
                              const doctorsWithSlot = availableDoctors.filter(d => 
                                getTimeSlotsForDoctor(d, date).includes(slot)
                              );
                              if (doctorsWithSlot.length === 0) return null;
                              return (
                                <span
                                  key={slot}
                                  className={cn(
                                    'w-2 h-2 rounded-full',
                                    TIME_SLOT_COLORS[slot]
                                  )}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{availableDoctors.length}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {hasAvailability && !past && (
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-medium mb-1">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">
                        {availableDoctors.length} doctor{availableDoctors.length > 1 ? 's' : ''} available
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border border-border rounded-xl p-6 bg-card animate-in fade-in slide-in-from-top-2">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Available on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h4>

          {availableDoctorsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {availableDoctorsForSelectedDate.map((doctor) => {
                const slots = getTimeSlotsForDoctor(doctor, selectedDate);
                return (
                  <div
                    key={doctor.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.photoUrl}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {slots.map((slot) => (
                        <span
                          key={slot}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium text-white capitalize',
                            TIME_SLOT_COLORS[slot]
                          )}
                        >
                          {slot}
                        </span>
                      ))}
                      {onBookDoctor && (
                        <Button
                          size="sm"
                          onClick={() => onBookDoctor(doctor, selectedDate)}
                          className="ml-2"
                        >
                          Book
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No doctors available on this date.</p>
          )}
        </div>
      )}
    </div>
  );
}
