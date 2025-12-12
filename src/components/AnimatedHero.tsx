import { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const stats = [
  { value: 500, suffix: '+', label: 'Hospitals' },
  { value: 1200, suffix: '+', label: 'Surgeons' },
  { value: 50000, suffix: '+', label: 'Surgeries' },
  { value: 98, suffix: '%', label: 'Success Rate' }
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function AnimatedHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-card rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-card rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-card rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Stethoscope 
          className="absolute top-24 left-[10%] w-8 h-8 text-card/20 animate-float" 
          style={{ animationDelay: '1s' }}
        />
        <Building2 
          className="absolute top-32 right-[15%] w-10 h-10 text-card/15 animate-float" 
          style={{ animationDelay: '2.5s' }}
        />
        <ShieldCheck 
          className="absolute bottom-32 left-[20%] w-12 h-12 text-card/10 animate-float" 
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      <div className="container relative z-10 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <ShieldCheck className="w-4 h-4 text-card" />
            <span className="text-sm font-medium text-card">Karnataka's Trusted Surgery Platform</span>
          </div>

          {/* Heading */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-card mb-6 leading-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Find the Right Surgery,{' '}
            <span className="relative">
              Right Hospital
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path 
                  d="M2 8C50 2 150 2 198 8" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="text-card/40"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-lg md:text-xl text-card/80 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Compare hospitals, surgeons, and costs across Karnataka. Book consultations with verified healthcare providers.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSearch}
            className={`search-box p-3 md:p-4 max-w-3xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search hospitals, surgeries, or doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 md:h-14 text-base border-0 bg-muted/50 focus:bg-muted/80 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  className="h-12 md:h-14 px-4 gap-2 flex-1 md:flex-none"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="hidden sm:inline">Near Me</span>
                </Button>
                <Button type="submit" size="lg" className="h-12 md:h-14 px-6 md:px-8 flex-1 md:flex-none">
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Links */}
          <div 
            className={`flex flex-wrap justify-center gap-2 mt-6 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="text-card/60 text-sm">Popular:</span>
            {['Knee Replacement', 'Cardiac Surgery', 'Eye Surgery', 'Spine Surgery'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                className="text-sm text-card/80 hover:text-card underline underline-offset-4 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div 
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {stats.map((stat, i) => (
              <div 
                key={stat.label} 
                className="text-center"
                style={{ transitionDelay: `${600 + i * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-card mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-card/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path 
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
