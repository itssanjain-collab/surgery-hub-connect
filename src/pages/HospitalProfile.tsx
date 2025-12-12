import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DoctorCard } from '@/components/DoctorCard';
import { mockHospitals, mockReviews } from '@/data/mockData';
import { SURGERY_TYPES } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, MapPin, Phone, Mail, Globe, Calendar, Heart, Share2, 
  BadgeCheck, Clock, Shield, ChevronLeft, ChevronRight, ThumbsUp, IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HospitalProfile() {
  const { id } = useParams();
  const hospital = mockHospitals.find(h => h.id === id) || mockHospitals[0];
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = [hospital.imageUrl, ...hospital.galleryImages];
  const reviews = mockReviews.filter(r => r.hospitalId === hospital.id);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 bg-muted overflow-hidden">
          <img
            src={allImages[activeImageIndex]}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === activeImageIndex ? "bg-card w-6" : "bg-card/50 hover:bg-card/80"
                  )}
                />
              ))}
            </div>
          )}

          {/* Back Button */}
          <Link
            to="/search"
            className="absolute top-4 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
            >
              <Heart className={cn("w-5 h-5", isFavorited && "fill-destructive text-destructive")} />
            </button>
            <button className="p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {hospital.name}
                </h1>
                {hospital.isVerified && (
                  <BadgeCheck className="w-8 h-8 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-4">{hospital.tagline}</p>

              {/* Rating & Location */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-warning/10">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-bold text-foreground">{hospital.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({hospital.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>{hospital.address}, {hospital.city}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {hospital.accreditations.map((acc) => (
                  <span key={acc} className="trust-badge">
                    <Shield className="w-3.5 h-3.5" />
                    {acc}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Since {hospital.yearEstablished}
                </span>
              </div>
            </div>

            {/* CTA Card */}
            <div className="lg:w-80 card-elevated p-6">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">Surgery costs starting from</span>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(Math.min(...hospital.surgeries.map(s => s.minCost)))}
                </div>
              </div>
              <div className="space-y-3">
                <Button className="w-full gap-2" size="lg">
                  <Calendar className="w-5 h-5" />
                  Book Consultation
                </Button>
                <Button variant="outline" className="w-full gap-2" size="lg">
                  <Phone className="w-5 h-5" />
                  Call Hospital
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Contact hospital for exact pricing
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent">
              {['overview', 'surgeries', 'doctors', 'reviews', 'gallery', 'contact'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 capitalize"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {hospital.name} is a premier healthcare institution established in {hospital.yearEstablished}. 
                    Located in {hospital.city}, Karnataka, we offer world-class surgical care with a team of experienced doctors and state-of-the-art facilities.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Surgery Types Available</h3>
                  <div className="flex flex-wrap gap-2">
                    {hospital.surgeryTypes.map((type) => (
                      <span 
                        key={type}
                        className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                      >
                        {SURGERY_TYPES[type].icon} {SURGERY_TYPES[type].label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Insurance Accepted</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.insuranceAccepted.map((ins) => (
                    <span 
                      key={ins}
                      className="px-3 py-1.5 rounded-lg border border-border text-sm"
                    >
                      {ins}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Surgeries Tab */}
            <TabsContent value="surgeries">
              <div className="space-y-4">
                {hospital.surgeries.map((surgery) => (
                  <div 
                    key={surgery.id}
                    className="card-elevated p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{SURGERY_TYPES[surgery.type].icon}</span>
                        <h4 className="text-lg font-semibold text-foreground">{surgery.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{surgery.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Duration: {surgery.averageDuration}
                        </span>
                        <span>Recovery: {surgery.recoveryTime}</span>
                      </div>
                      {surgery.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{surgery.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">Cost Range</span>
                      <div className="flex items-center gap-1 justify-end">
                        <IndianRupee className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(surgery.minCost)} - {formatCurrency(surgery.maxCost)}
                        </span>
                      </div>
                      <Button size="sm" className="mt-2">Request Quote</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Doctors Tab */}
            <TabsContent value="doctors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospital.doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="card-elevated p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{review.userName}</h4>
                        <p className="text-sm text-muted-foreground">Visited {review.visitDate}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/10">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
                    <p className="text-muted-foreground mb-4">{review.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">No reviews yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allImages.map((img, index) => (
                  <div key={index} className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-slow" />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Address</h4>
                      <p className="text-muted-foreground">{hospital.address}, {hospital.city}, {hospital.district}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                      <a href={`tel:${hospital.contactPhone}`} className="text-primary hover:underline">
                        {hospital.contactPhone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Email</h4>
                      <a href={`mailto:${hospital.contactEmail}`} className="text-primary hover:underline">
                        {hospital.contactEmail}
                      </a>
                    </div>
                  </div>
                  {hospital.website && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Website</h4>
                        <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {hospital.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Map View</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
