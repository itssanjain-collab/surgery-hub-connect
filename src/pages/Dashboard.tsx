import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Building2, Plus, Edit2, Trash2, Upload, Save, Eye, BarChart3, 
  Calendar, MessageSquare, TrendingUp, TrendingDown, Users, IndianRupee, Image, X, Camera, Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockHospitals, mockSurgeries, mockDoctors } from '@/data/mockData';
import { SURGERY_TYPES, SurgeryType, DashboardStats, Surgery, Doctor } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const hospital = mockHospitals[0];

const stats: DashboardStats = {
  totalViews: 12847,
  totalBookings: 342,
  totalInquiries: 589,
  averageRating: 4.8,
  viewsChange: 12.5,
  bookingsChange: -3.2
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [surgeries, setSurgeries] = useState(mockSurgeries);
  const [doctors, setDoctors] = useState(mockDoctors);
  const [isEditing, setIsEditing] = useState(false);

  // Surgery edit state
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Doctor edit state
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDoctorEditModalOpen, setIsDoctorEditModalOpen] = useState(false);

  // Add doctor modal state
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    bio: ''
  });
  const [newDoctorAvailability, setNewDoctorAvailability] = useState<Record<string, string[]>>({
    Mon: ['morning', 'afternoon'],
    Wed: ['morning', 'afternoon'],
    Fri: ['morning', 'afternoon']
  });
  const [editDoctorSchedule, setEditDoctorSchedule] = useState<Record<string, string[]>>({});

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TIME_SLOTS = [
    { id: 'morning', label: 'Morning', time: '9AM - 12PM' },
    { id: 'afternoon', label: 'Afternoon', time: '12PM - 5PM' },
    { id: 'evening', label: 'Evening', time: '5PM - 8PM' }
  ];

  // Photo upload state
  const [newDoctorPhoto, setNewDoctorPhoto] = useState<string | null>(null);
  const [editDoctorPhoto, setEditDoctorPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const [newSurgery, setNewSurgery] = useState({
    name: '',
    type: 'curative' as SurgeryType,
    minCost: '',
    maxCost: '',
    description: ''
  });

  const handleAddSurgery = () => {
    if (newSurgery.name && newSurgery.minCost && newSurgery.maxCost) {
      setSurgeries([...surgeries, {
        id: `s${surgeries.length + 1}`,
        name: newSurgery.name,
        type: newSurgery.type,
        description: newSurgery.description,
        minCost: parseInt(newSurgery.minCost),
        maxCost: parseInt(newSurgery.maxCost),
        averageDuration: '2-4 hours',
        recoveryTime: '2-4 weeks'
      }]);
      setNewSurgery({ name: '', type: 'curative', minCost: '', maxCost: '', description: '' });
    }
  };

  const handleEditSurgery = (surgery: Surgery) => {
    setEditingSurgery({ ...surgery });
    setIsEditModalOpen(true);
  };

  const handleSaveEditedSurgery = () => {
    if (editingSurgery) {
      setSurgeries(surgeries.map(s => s.id === editingSurgery.id ? editingSurgery : s));
      setIsEditModalOpen(false);
      setEditingSurgery(null);
    }
  };

  const handleDeleteSurgery = (id: string) => {
    setSurgeries(surgeries.filter(s => s.id !== id));
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const handleAddDoctor = () => {
    if (newDoctor.name && newDoctor.specialization && newDoctor.experience && newDoctor.consultationFee) {
      // Convert schedule to simple availability array for display
      const availabilityDays = Object.keys(newDoctorAvailability).filter(day => newDoctorAvailability[day].length > 0);
      
      setDoctors([...doctors, {
        id: `d${doctors.length + 1}`,
        name: newDoctor.name,
        photoUrl: newDoctorPhoto || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
        specialization: newDoctor.specialization,
        qualification: newDoctor.qualification || 'MBBS',
        experience: parseInt(newDoctor.experience),
        consultationFee: parseInt(newDoctor.consultationFee),
        rating: 4.5,
        reviewCount: 0,
        availability: availabilityDays,
        bio: newDoctor.bio
      }]);
      setNewDoctor({ name: '', specialization: '', qualification: '', experience: '', consultationFee: '', bio: '' });
      setNewDoctorPhoto(null);
      setNewDoctorAvailability({
        Mon: ['morning', 'afternoon'],
        Wed: ['morning', 'afternoon'],
        Fri: ['morning', 'afternoon']
      });
      setIsAddDoctorModalOpen(false);
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
    // Initialize schedule from existing availability
    const schedule: Record<string, string[]> = {};
    (doctor.availability || []).forEach(day => {
      schedule[day] = ['morning', 'afternoon']; // Default to morning & afternoon for existing days
    });
    setEditDoctorSchedule(schedule);
    setIsDoctorEditModalOpen(true);
  };

  const handleSaveEditedDoctor = () => {
    if (editingDoctor) {
      // Convert schedule to simple availability array
      const availabilityDays = Object.keys(editDoctorSchedule).filter(day => editDoctorSchedule[day].length > 0);
      setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...editingDoctor, availability: availabilityDays } : d));
      setIsDoctorEditModalOpen(false);
      setEditingDoctor(null);
      setEditDoctorSchedule({});
    }
  };

  const toggleDay = (day: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditDoctorSchedule(prev => {
        if (prev[day]) {
          const { [day]: _, ...rest } = prev;
          return rest;
        } else {
          return { ...prev, [day]: ['morning', 'afternoon'] };
        }
      });
    } else {
      setNewDoctorAvailability(prev => {
        if (prev[day]) {
          const { [day]: _, ...rest } = prev;
          return rest;
        } else {
          return { ...prev, [day]: ['morning', 'afternoon'] };
        }
      });
    }
  };

  const toggleTimeSlot = (day: string, slot: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditDoctorSchedule(prev => {
        const daySlots = prev[day] || [];
        if (daySlots.includes(slot)) {
          const newSlots = daySlots.filter(s => s !== slot);
          if (newSlots.length === 0) {
            const { [day]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [day]: newSlots };
        } else {
          return { ...prev, [day]: [...daySlots, slot] };
        }
      });
    } else {
      setNewDoctorAvailability(prev => {
        const daySlots = prev[day] || [];
        if (daySlots.includes(slot)) {
          const newSlots = daySlots.filter(s => s !== slot);
          if (newSlots.length === 0) {
            const { [day]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [day]: newSlots };
        } else {
          return { ...prev, [day]: [...daySlots, slot] };
        }
      });
    }
  };

  const handlePhotoUpload = async (file: File, isEdit: boolean = false) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `doctors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('doctor-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('doctor-photos')
        .getPublicUrl(filePath);

      if (isEdit) {
        setEditDoctorPhoto(publicUrl);
        if (editingDoctor) {
          setEditingDoctor({ ...editingDoctor, photoUrl: publicUrl });
        }
      } else {
        setNewDoctorPhoto(publicUrl);
      }

      toast.success('Photo uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{hospital.name}</h1>
              <p className="text-muted-foreground">Hospital Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview Profile
            </Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Views" 
            value={formatNumber(stats.totalViews)} 
            change={stats.viewsChange}
            icon={Users}
          />
          <StatCard 
            title="Bookings" 
            value={stats.totalBookings.toString()} 
            change={stats.bookingsChange}
            icon={Calendar}
          />
          <StatCard 
            title="Inquiries" 
            value={stats.totalInquiries.toString()} 
            change={8.3}
            icon={MessageSquare}
          />
          <StatCard 
            title="Rating" 
            value={stats.averageRating.toString()} 
            change={0.2}
            icon={BarChart3}
            suffix="/5"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent overflow-x-auto">
            {['overview', 'surgeries', 'doctors', 'gallery', 'inquiries', 'analytics'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 capitalize whitespace-nowrap"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Hospital Information</h3>
                <div className="flex gap-2">
                  {isEditing && (
                    <Button size="sm" onClick={() => setIsEditing(false)} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Hospital Details
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hospital Name</label>
                  <Input defaultValue={hospital.name} disabled={!isEditing} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                  <Input defaultValue={hospital.tagline} disabled={!isEditing} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <Input defaultValue={hospital.address} disabled={!isEditing} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <Input defaultValue={hospital.contactPhone} disabled={!isEditing} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <Input defaultValue={hospital.contactEmail} disabled={!isEditing} className="mt-1" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Surgeries Tab */}
          <TabsContent value="surgeries" className="space-y-6">
            {/* Add New Surgery */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Surgery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Surgery Name</label>
                  <Input 
                    placeholder="e.g., Hip Replacement"
                    value={newSurgery.name}
                    onChange={(e) => setNewSurgery({...newSurgery, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Surgery Type</label>
                  <select 
                    value={newSurgery.type}
                    onChange={(e) => setNewSurgery({...newSurgery, type: e.target.value as SurgeryType})}
                    className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background"
                  >
                    {(Object.keys(SURGERY_TYPES) as SurgeryType[]).map((type) => (
                      <option key={type} value={type}>{SURGERY_TYPES[type].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Min Cost (₹)</label>
                  <Input 
                    type="number"
                    placeholder="50000"
                    value={newSurgery.minCost}
                    onChange={(e) => setNewSurgery({...newSurgery, minCost: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Cost (₹)</label>
                  <Input 
                    type="number"
                    placeholder="150000"
                    value={newSurgery.maxCost}
                    onChange={(e) => setNewSurgery({...newSurgery, maxCost: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <Textarea 
                  placeholder="Brief description of the surgery..."
                  value={newSurgery.description}
                  onChange={(e) => setNewSurgery({...newSurgery, description: e.target.value})}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <Button onClick={handleAddSurgery} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Add Surgery
              </Button>
            </div>

            {/* Surgery List */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">Your Surgeries ({surgeries.length})</h3>
              <div className="space-y-3">
                {surgeries.map((surgery) => (
                  <div 
                    key={surgery.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{SURGERY_TYPES[surgery.type].icon}</span>
                      <div>
                        <h4 className="font-medium text-foreground">{surgery.name}</h4>
                        <p className="text-sm text-muted-foreground">{SURGERY_TYPES[surgery.type].label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Cost Range</span>
                        <p className="font-semibold text-primary">
                          ₹{(surgery.minCost / 1000).toFixed(0)}K - ₹{(surgery.maxCost / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSurgery(surgery)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteSurgery(surgery.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Doctors ({doctors.length})</h3>
                <Button className="gap-2" onClick={() => setIsAddDoctorModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Doctor
                </Button>
              </div>
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div 
                    key={doctor.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={doctor.photoUrl} 
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-foreground">{doctor.name}</h4>
                        <p className="text-sm text-primary">{doctor.specialization}</p>
                        <p className="text-xs text-muted-foreground">{doctor.experience} years experience</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Consultation Fee</span>
                        <p className="font-semibold text-foreground">₹{doctor.consultationFee}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditDoctor(doctor)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Hospital Gallery</h3>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photos
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[hospital.imageUrl, ...hospital.galleryImages].map((img, i) => (
                  <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="icon-sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon-sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <button className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                  <Image className="w-8 h-8" />
                  <span className="text-sm font-medium">Add Photo</span>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Inquiries</h3>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No inquiries yet. They will appear here when patients contact you.</p>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
              <div className="aspect-[2/1] bg-muted rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground">Analytics charts coming soon</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Surgery Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Surgery</DialogTitle>
            </DialogHeader>
            {editingSurgery && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Surgery Name</Label>
                  <Input
                    id="edit-name"
                    value={editingSurgery.name}
                    onChange={(e) => setEditingSurgery({ ...editingSurgery, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Surgery Type</Label>
                  <select
                    id="edit-type"
                    value={editingSurgery.type}
                    onChange={(e) => setEditingSurgery({ ...editingSurgery, type: e.target.value as SurgeryType })}
                    className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background"
                  >
                    {(Object.keys(SURGERY_TYPES) as SurgeryType[]).map((type) => (
                      <option key={type} value={type}>{SURGERY_TYPES[type].label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-minCost">Min Cost (₹)</Label>
                    <Input
                      id="edit-minCost"
                      type="number"
                      value={editingSurgery.minCost}
                      onChange={(e) => setEditingSurgery({ ...editingSurgery, minCost: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxCost">Max Cost (₹)</Label>
                    <Input
                      id="edit-maxCost"
                      type="number"
                      value={editingSurgery.maxCost}
                      onChange={(e) => setEditingSurgery({ ...editingSurgery, maxCost: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingSurgery.description}
                    onChange={(e) => setEditingSurgery({ ...editingSurgery, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEditedSurgery} className="flex-1 gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Doctor Edit Modal */}
        <Dialog open={isDoctorEditModalOpen} onOpenChange={setIsDoctorEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Doctor</DialogTitle>
            </DialogHeader>
            {editingDoctor && (
              <div className="space-y-4 py-4">
                {/* Photo Upload */}
                <div>
                  <Label>Doctor Photo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border">
                      <img 
                        src={editingDoctor.photoUrl} 
                        alt={editingDoctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        ref={editPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file, true);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editPhotoInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="gap-2"
                      >
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            Change Photo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-doctor-name">Doctor Name</Label>
                  <Input
                    id="edit-doctor-name"
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-doctor-specialization">Specialization</Label>
                  <Input
                    id="edit-doctor-specialization"
                    value={editingDoctor.specialization}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-doctor-qualification">Qualification</Label>
                  <Input
                    id="edit-doctor-qualification"
                    value={editingDoctor.qualification}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-doctor-experience">Experience (years)</Label>
                    <Input
                      id="edit-doctor-experience"
                      type="number"
                      value={editingDoctor.experience}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-doctor-fee">Consultation Fee (₹)</Label>
                    <Input
                      id="edit-doctor-fee"
                      type="number"
                      value={editingDoctor.consultationFee}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, consultationFee: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-doctor-bio">Bio</Label>
                  <Textarea
                    id="edit-doctor-bio"
                    value={editingDoctor.bio || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                {/* Availability Schedule with Time Slots */}
                <div>
                  <Label>Availability Schedule</Label>
                  <p className="text-xs text-muted-foreground mb-3">Select days and time slots when the doctor is available</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = !!editDoctorSchedule[day];
                      const daySlots = editDoctorSchedule[day] || [];
                      return (
                        <div key={day} className="rounded-lg border border-border p-3 bg-background">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              type="button"
                              onClick={() => toggleDay(day, true)}
                              className={cn(
                                "flex items-center gap-2 font-medium text-sm transition-colors",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                              )}>
                                {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                              </div>
                              {day}
                            </button>
                          </div>
                          {isSelected && (
                            <div className="flex flex-wrap gap-2 ml-6">
                              {TIME_SLOTS.map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => toggleTimeSlot(day, slot.id, true)}
                                  className={cn(
                                    "px-2 py-1 rounded text-xs font-medium transition-colors",
                                    daySlots.includes(slot.id)
                                      ? "bg-primary/20 text-primary border border-primary/30"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  )}
                                >
                                  {slot.label}
                                  <span className="text-[10px] opacity-70 ml-1">({slot.time})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsDoctorEditModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEditedDoctor} className="flex-1 gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Doctor Modal */}
        <Dialog open={isAddDoctorModalOpen} onOpenChange={setIsAddDoctorModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Photo Upload */}
              <div>
                <Label>Doctor Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border">
                    {newDoctorPhoto ? (
                      <img 
                        src={newDoctorPhoto} 
                        alt="Doctor preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={addPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file, false);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPhotoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="gap-2"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="add-doctor-name">Doctor Name *</Label>
                <Input
                  id="add-doctor-name"
                  placeholder="e.g., Dr. Rajesh Kumar"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="add-doctor-specialization">Specialization *</Label>
                <Input
                  id="add-doctor-specialization"
                  placeholder="e.g., Orthopedic Surgeon"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="add-doctor-qualification">Qualification</Label>
                <Input
                  id="add-doctor-qualification"
                  placeholder="e.g., MBBS, MS Ortho"
                  value={newDoctor.qualification}
                  onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-doctor-experience">Experience (years) *</Label>
                  <Input
                    id="add-doctor-experience"
                    type="number"
                    placeholder="10"
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="add-doctor-fee">Consultation Fee (₹) *</Label>
                  <Input
                    id="add-doctor-fee"
                    type="number"
                    placeholder="500"
                    value={newDoctor.consultationFee}
                    onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="add-doctor-bio">Bio</Label>
                <Textarea
                  id="add-doctor-bio"
                  placeholder="Brief description about the doctor..."
                  value={newDoctor.bio}
                  onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              {/* Availability Schedule with Time Slots */}
              <div>
                <Label>Availability Schedule *</Label>
                <p className="text-xs text-muted-foreground mb-3">Select days and time slots when the doctor is available</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = !!newDoctorAvailability[day];
                    const daySlots = newDoctorAvailability[day] || [];
                    return (
                      <div key={day} className="rounded-lg border border-border p-3 bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <button
                            type="button"
                            onClick={() => toggleDay(day, false)}
                            className={cn(
                              "flex items-center gap-2 font-medium text-sm transition-colors",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                              isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                            )}>
                              {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                            </div>
                            {day}
                          </button>
                        </div>
                        {isSelected && (
                          <div className="flex flex-wrap gap-2 ml-6">
                            {TIME_SLOTS.map((slot) => (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => toggleTimeSlot(day, slot.id, false)}
                                className={cn(
                                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                                  daySlots.includes(slot.id)
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {slot.label}
                                <span className="text-[10px] opacity-70 ml-1">({slot.time})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsAddDoctorModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddDoctor} className="flex-1 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Doctor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
}

function StatCard({ title, value, change, icon: Icon, suffix }: StatCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="card-elevated p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}{suffix}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
}
