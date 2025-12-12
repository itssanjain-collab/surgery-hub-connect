import { AnimatedHero } from '@/components/AnimatedHero';
import { SurgeryTypeCard } from '@/components/SurgeryTypeCard';
import { HospitalCard } from '@/components/HospitalCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { mockHospitals } from '@/data/mockData';
import { SurgeryType, SURGERY_TYPES } from '@/types';
import { ArrowRight, ShieldCheck, Clock, IndianRupee, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  { icon: ShieldCheck, title: 'Verified Hospitals', description: 'All hospitals are verified for authenticity and quality.' },
  { icon: IndianRupee, title: 'Transparent Pricing', description: 'Compare surgery costs upfront. No hidden charges.' },
  { icon: Star, title: 'Patient Reviews', description: 'Real reviews from patients who have undergone surgeries.' },
  { icon: Clock, title: 'Quick Booking', description: 'Book consultations instantly with top surgeons.' }
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatedHero />
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Explore Surgery Types</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Find specialized care for your specific surgical needs.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {(Object.keys(SURGERY_TYPES) as SurgeryType[]).map((type, i) => (
                <SurgeryTypeCard key={type} type={type} count={Math.floor(Math.random() * 100) + 50} />
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Top Rated Hospitals</h2>
                <p className="text-lg text-muted-foreground">Discover the best healthcare in Karnataka</p>
              </div>
              <Button asChild variant="outline" className="gap-2"><Link to="/search">View All<ArrowRight className="w-4 h-4" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockHospitals.slice(0, 4).map((hospital, i) => (<HospitalCard key={hospital.id} hospital={hospital} animationDelay={i * 100} />))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Surgery Hub?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Simple, transparent, and trustworthy healthcare discovery.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((f, i) => (
                <div key={f.title} className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-card transition-all">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><f.icon className="w-7 h-7 text-primary" /></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 hero-gradient">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-card mb-6">Are You a Hospital Administrator?</h2>
              <p className="text-lg text-card/80 mb-8">Join Surgery Hub to list your hospital and reach more patients across Karnataka.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="hero"><Link to="/dashboard">Register Your Hospital</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
