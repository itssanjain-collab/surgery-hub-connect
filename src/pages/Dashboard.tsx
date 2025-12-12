import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Plus, Edit2, Trash2, Upload, Save, Eye, BarChart3, 
  Calendar, MessageSquare, TrendingUp, TrendingDown, Users, IndianRupee, Image
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockHospitals, mockSurgeries, mockDoctors } from '@/data/mockData';
import { SURGERY_TYPES, SurgeryType, DashboardStats } from '@/types';
import { cn } from '@/lib/utils';

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

  const handleDeleteSurgery = (id: string) => {
    setSurgeries(surgeries.filter(s => s.id !== id));
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
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
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
                        <Button variant="ghost" size="icon">
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
                <Button className="gap-2">
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
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
