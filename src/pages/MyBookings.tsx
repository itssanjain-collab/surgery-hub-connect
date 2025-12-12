import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isPast, startOfToday, addDays, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, User, Loader2, X, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockHospitals } from '@/data/mockData';

interface Booking {
  id: string;
  hospital_id: string;
  doctor_id: string | null;
  surgery_id: string | null;
  booking_type: string;
  scheduled_date: string;
  scheduled_time: string;
  patient_name: string;
  patient_email: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM'
];

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Reschedule state
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user!.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error loading bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHospitalName = (hospitalId: string) => {
    const hospital = mockHospitals.find(h => h.id === hospitalId);
    return hospital?.name || 'Unknown Hospital';
  };

  const getHospitalLocation = (hospitalId: string) => {
    const hospital = mockHospitals.find(h => h.id === hospitalId);
    return hospital ? `${hospital.city}, ${hospital.district}` : '';
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      // Send cancellation email notification
      const hospitalName = getHospitalName(selectedBooking.hospital_id);
      await supabase.functions.invoke('send-booking-update', {
        body: {
          patientName: selectedBooking.patient_name,
          patientEmail: selectedBooking.patient_email,
          hospitalName,
          bookingType: selectedBooking.booking_type,
          originalDate: selectedBooking.scheduled_date,
          originalTime: selectedBooking.scheduled_time,
          bookingId: selectedBooking.id,
          updateType: 'cancelled'
        }
      });

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled. A confirmation email has been sent.",
      });

      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b)
      );
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (error: any) {
      toast({
        title: "Error cancelling booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!selectedBooking || !newDate || !newTime) return;
    
    const originalDate = selectedBooking.scheduled_date;
    const originalTime = selectedBooking.scheduled_time;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          scheduled_date: format(newDate, 'yyyy-MM-dd'),
          scheduled_time: newTime,
          status: 'pending'
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      // Send reschedule email notification
      const hospitalName = getHospitalName(selectedBooking.hospital_id);
      await supabase.functions.invoke('send-booking-update', {
        body: {
          patientName: selectedBooking.patient_name,
          patientEmail: selectedBooking.patient_email,
          hospitalName,
          bookingType: selectedBooking.booking_type,
          originalDate,
          originalTime,
          newDate: format(newDate, 'yyyy-MM-dd'),
          newTime,
          bookingId: selectedBooking.id,
          updateType: 'rescheduled'
        }
      });

      toast({
        title: "Booking rescheduled",
        description: `Your booking has been rescheduled. A confirmation email has been sent.`,
      });

      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id 
          ? { ...b, scheduled_date: format(newDate, 'yyyy-MM-dd'), scheduled_time: newTime, status: 'pending' } 
          : b
        )
      );
      setRescheduleDialogOpen(false);
      setSelectedBooking(null);
      setNewDate(undefined);
      setNewTime('');
    } catch (error: any) {
      toast({
        title: "Error rescheduling booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const openRescheduleDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(parseISO(booking.scheduled_date));
    setNewTime(booking.scheduled_time);
    setRescheduleDialogOpen(true);
  };


  const getStatusBadge = (status: string, date: string) => {
    const isDatePast = isPast(parseISO(date));
    
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (status === 'confirmed') {
      return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
    }
    if (isDatePast && status !== 'cancelled') {
      return <Badge variant="secondary">Completed</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const upcomingBookings = bookings.filter(
    b => !isPast(parseISO(b.scheduled_date)) && b.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(
    b => isPast(parseISO(b.scheduled_date)) || b.status === 'cancelled'
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const BookingCard = ({ booking, showActions = true }: { booking: Booking; showActions?: boolean }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {getHospitalName(booking.hospital_id)}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {getHospitalLocation(booking.hospital_id)}
                </p>
              </div>
              {getStatusBadge(booking.status, booking.scheduled_date)}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(parseISO(booking.scheduled_date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{booking.scheduled_time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{booking.patient_name}</span>
              <Badge variant="secondary" className="ml-2 capitalize">
                {booking.booking_type}
              </Badge>
            </div>

            {booking.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {booking.notes}
              </p>
            )}
          </div>

          {showActions && booking.status !== 'cancelled' && !isPast(parseISO(booking.scheduled_date)) && (
            <div className="flex sm:flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openRescheduleDialog(booking)}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => openCancelDialog(booking)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            My Bookings
          </h1>
          <p className="text-muted-foreground">
            View and manage your hospital appointments
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't made any bookings yet. Start by finding a hospital.
            </p>
            <Button onClick={() => navigate('/search')}>
              Find Hospitals
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Upcoming Appointments ({upcomingBookings.length})
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Past & Cancelled ({pastBookings.length})
                </h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} showActions={false} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium text-foreground">{getHospitalName(selectedBooking.hospital_id)}</p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(selectedBooking.scheduled_date), 'MMMM d, yyyy')} at {selectedBooking.scheduled_time}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Select New Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 60), date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Select New Time</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={newTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTime(time)}
                    className="text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRescheduleBooking}
              disabled={actionLoading || !newDate || !newTime}
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
