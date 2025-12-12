import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HospitalCard } from '@/components/HospitalCard';
import { mockHospitals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Search, Phone, Mail, Calendar, Trash2, FolderPlus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Favorites() {
  const [favorites, setFavorites] = useState(mockHospitals.slice(0, 3).map(h => h.id));
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const labels = ['Cardiac Care', 'For Parents', 'Near Home'];

  const favoriteHospitals = mockHospitals.filter(h => favorites.includes(h.id));
  const filteredFavorites = favoriteHospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fid => fid !== id));
    setCompareList(prev => prev.filter(cid => cid !== id));
  };

  const handleCompare = (id: string, selected: boolean) => {
    if (selected && compareList.length < 4) {
      setCompareList([...compareList, id]);
    } else {
      setCompareList(compareList.filter(i => i !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Heart className="w-8 h-8 text-destructive fill-destructive" />
                My Favorites
              </h1>
              <p className="text-muted-foreground mt-1">
                {favorites.length} saved hospitals
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <FolderPlus className="w-4 h-4" />
                New Label
              </Button>
              <Button 
                disabled={compareList.length < 2}
                className="gap-2"
              >
                Compare ({compareList.length})
              </Button>
            </div>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Labels */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Labels
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedLabel(null)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !selectedLabel ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      All Favorites
                    </button>
                    {labels.map((label) => (
                      <button
                        key={label}
                        onClick={() => setSelectedLabel(label)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedLabel === label ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card-elevated p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Phone className="w-4 h-4" />
                      Call First Hospital
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      Email Inquiry
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Calendar className="w-4 h-4" />
                      Book Visit
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Favorites List */}
              <div className="lg:col-span-3 space-y-4">
                {filteredFavorites.map((hospital, index) => (
                  <div key={hospital.id} className="relative group">
                    <HospitalCard
                      hospital={hospital}
                      onCompare={handleCompare}
                      isCompareSelected={compareList.includes(hospital.id)}
                      animationDelay={index * 50}
                    />
                    <button
                      onClick={() => handleRemoveFavorite(hospital.id)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {filteredFavorites.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No favorites match your search.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Save hospitals to your favorites for quick access. Compare costs, read reviews, and book consultations easily.
              </p>
              <Button asChild>
                <a href="/search">Browse Hospitals</a>
              </Button>
            </div>
          )}

          {/* Compare Bar */}
          {compareList.length > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-2xl shadow-search p-4 flex items-center gap-4 animate-slide-up">
              <div className="flex -space-x-2">
                {compareList.map((id) => {
                  const hospital = mockHospitals.find(h => h.id === id);
                  return (
                    <div key={id} className="w-10 h-10 rounded-full border-2 border-card overflow-hidden">
                      <img src={hospital?.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
              <span className="text-sm font-medium">
                {compareList.length} hospitals selected
              </span>
              <Button size="sm" disabled={compareList.length < 2}>
                Compare Now
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCompareList([])}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
