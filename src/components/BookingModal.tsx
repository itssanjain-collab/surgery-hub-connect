import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Hospital, Doctor, Surgery } from '@/types';
import { format, addDays, isBefore, startOfToday, getDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital;
  doctor?: Doctor;
  surgery?: Surgery;
  bookingType: 'consultation' | 'surgery' | 'visit';
}

const TIME_SLOTS = {
  morning: [
    { time: '09:00 AM', label: 'Morning' },
    { time: '09:30 AM', label: 'Morning' },
    { time: '10:00 AM', label: 'Morning' },
    { time: '10:30 AM', label: 'Morning' },
    { time: '11:00 AM', label: 'Morning' },
    { time: '11:30 AM', label: 'Morning' },
  ],
  afternoon: [
    { time: '12:00 PM', label: 'Afternoon' },
    { time: '02:00 PM', label: 'Afternoon' },
    { time: '02:30 PM', label: 'Afternoon' },
    { time: '03:00 PM', label: 'Afternoon' },
    { time: '03:30 PM', label: 'Afternoon' },
    { time: '04:00 PM', label: 'Afternoon' },
    { time: '04:30 PM', label: 'Afternoon' },
  ],
  evening: [
    { time: '05:00 PM', label: 'Evening' },
    { time: '05:30 PM', label: 'Evening' },
    { time: '06:00 PM', label: 'Evening' },
    { time: '06:30 PM', label: 'Evening' },
    { time: '07:00 PM', label: 'Evening' },
    { time: '07:30 PM', label: 'Evening' },
  ]
};

const DAY_MAP: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat'
};

export function BookingModal({ isOpen, onClose, hospital, doctor, surgery, bookingType }: BookingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(doctor);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get available time slots based on selected date and doctor
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedDoctor) {
      // Return all slots if no doctor selected
      return [...TIME_SLOTS.morning, ...TIME_SLOTS.afternoon, ...TIME_SLOTS.evening];
    }

    const dayOfWeek = getDay(selectedDate);
    const dayName = DAY_MAP[dayOfWeek];
    
    // Check if doctor is available on this day
    if (!selectedDoctor.availability.includes(dayName)) {
      return [];
    }

    // For now, return all time slots for available days
    // In a real app, you'd check the doctor's specific time slot preferences
    return [...TIME_SLOTS.morning, ...TIME_SLOTS.afternoon, ...TIME_SLOTS.evening];
  }, [selectedDate, selectedDoctor]);

  // Check if a date is available for the selected doctor
  const isDateAvailable = (date: Date): boolean => {
    if (!selectedDoctor) return true;
    const dayOfWeek = getDay(date);
    const dayName = DAY_MAP[dayOfWeek];
    return selectedDoctor.availability.includes(dayName);
  };

  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedDate(undefined);
    setSelectedTime('');
  };

  const handleNext = () => {
    if (step === 1 && selectedDoctor) {
      setStep(2);
    } else if (step === 2 && selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedDate(undefined);
      setSelectedTime('');
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to book a consultation.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!selectedDate || !selectedTime || !patientName || !patientEmail) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          hospital_id: hospital.id,
          doctor_id: selectedDoctor?.id || null,
          surgery_id: surgery?.id || null,
          booking_type: bookingType,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          patient_name: patientName,
          patient_email: patientEmail,
          patient_phone: patientPhone || null,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          patientName,
          patientEmail,
          hospitalName: hospital.name,
          doctorName: selectedDoctor?.name,
          surgeryName: surgery?.name,
          bookingType,
          scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
          scheduledTime: selectedTime,
          bookingId: bookingData.id
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the booking if email fails
      }

      // Update booking confirmation status
      await supabase
        .from('bookings')
        .update({ confirmation_sent: !emailError })
        .eq('id', bookingData.id);

      setSuccess(true);
      
      toast({
        title: "Booking confirmed!",
        description: "A confirmation email has been sent to your email address.",
      });

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDoctor(doctor);
    setSelectedDate(undefined);
    setSelectedTime('');
    setPatientName('');
    setPatientPhone('');
    setNotes('');
    setSuccess(false);
    onClose();
  };

  const bookingTypeLabels = {
    consultation: 'Consultation',
    surgery: 'Surgery',
    visit: 'Hospital Visit'
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in or create an account to book a {bookingTypeLabels[bookingType].toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => navigate('/auth')} className="flex-1">
              Login / Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground mb-6">
              Your {bookingTypeLabels[bookingType].toLowerCase()} at {hospital.name} 
              {selectedDoctor && ` with ${selectedDoctor.name}`} has been booked for{' '}
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              A confirmation email has been sent to {patientEmail}.
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Book {bookingTypeLabels[bookingType]} at {hospital.name}
          </DialogTitle>
          <DialogDescription>
            {selectedDoctor && `With ${selectedDoctor.name}`}
            {surgery && ` for ${surgery.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            1
          </div>
          <div className={cn("w-8 h-1 rounded", step >= 2 ? "bg-primary" : "bg-muted")} />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            2
          </div>
          <div className={cn("w-8 h-1 rounded", step >= 3 ? "bg-primary" : "bg-muted")} />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            3
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Select a Doctor</Label>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {hospital.doctors.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectDoctor(doc)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4",
                    selectedDoctor?.id === doc.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-background"
                  )}
                >
                  <img 
                    src={doc.photoUrl} 
                    alt={doc.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{doc.name}</h4>
                    <p className="text-sm text-primary">{doc.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{doc.experience} yrs exp</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">₹{doc.consultationFee}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.availability.map((day) => (
                        <span 
                          key={day}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedDoctor?.id === doc.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!selectedDoctor}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            {selectedDoctor && (
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <img 
                  src={selectedDoctor.photoUrl} 
                  alt={selectedDoctor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{selectedDoctor.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
                </div>
                <button 
                  onClick={handleBack}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <Label className="mb-3 block">Select Date</Label>
              <p className="text-xs text-muted-foreground mb-2">
                {selectedDoctor && `${selectedDoctor.name} is available on: ${selectedDoctor.availability.join(', ')}`}
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    disabled={(date) => 
                      isBefore(date, startOfToday()) || 
                      isBefore(addDays(new Date(), 60), date) ||
                      !isDateAvailable(date)
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedDate && (
              <div>
                <Label className="mb-3 block">Select Time Slot</Label>
                {availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableTimeSlots.map(({ time }) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="text-xs"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Patient Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 mb-4">
              <div className="flex items-center gap-3 mb-2">
                {selectedDoctor && (
                  <img 
                    src={selectedDoctor.photoUrl} 
                    alt={selectedDoctor.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedDoctor?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="text-sm text-primary hover:underline"
              >
                Change date/time
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientName">Full Name *</Label>
              <Input
                id="patientName"
                placeholder="Enter your full name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientEmail">Email *</Label>
              <Input
                id="patientEmail"
                type="email"
                placeholder="you@example.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientPhone">Phone Number</Label>
              <Input
                id="patientPhone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific concerns or questions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !patientName || !patientEmail}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
