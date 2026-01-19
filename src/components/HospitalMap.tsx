import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '@/types';
import { Star, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom hospital marker icon
const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// User location marker
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation?: { lat: number; lng: number } | null;
  selectedHospitalId?: string;
  onHospitalSelect?: (hospitalId: string) => void;
  className?: string;
}

// Component to handle map center updates
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function HospitalMap({
  hospitals,
  userLocation,
  selectedHospitalId,
  onHospitalSelect,
  className = '',
}: HospitalMapProps) {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);

  // Default center: Bangalore, Karnataka
  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  // Use hospital coordinates if available, otherwise generate mock ones
  const getHospitalCoordinates = (hospital: Hospital, index: number): [number, number] => {
    if (hospital.coordinates?.lat && hospital.coordinates?.lng) {
      return [hospital.coordinates.lat, hospital.coordinates.lng];
    }
    // Fallback: spread hospitals around the center with some randomness
    const offset = 0.02 + (index * 0.01);
    const angle = (index * 137.5) * (Math.PI / 180); // Golden angle for distribution
    const lat = center[0] + offset * Math.cos(angle);
    const lng = center[1] + offset * Math.sin(angle);
    return [lat, lng];
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={userLocation ? 13 : 11}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterUpdater center={center} zoom={userLocation ? 13 : 11} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hospital markers */}
        {hospitals.map((hospital, index) => {
          const coords = getHospitalCoordinates(hospital, index);
          const isSelected = hospital.id === selectedHospitalId;

          return (
            <Marker
              key={hospital.id}
              position={coords}
              icon={hospitalIcon}
              eventHandlers={{
                click: () => onHospitalSelect?.(hospital.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-start gap-2 mb-2">
                    {hospital.imageUrl && (
                      <img 
                        src={hospital.imageUrl} 
                        alt={hospital.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">{hospital.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{hospital.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({hospital.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{hospital.address}</span>
                  </div>

                  {hospital.distance && (
                    <p className="text-xs text-primary font-medium mb-2">
                      {hospital.distance} km away
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 h-7 text-xs"
                      onClick={() => navigate(`/hospital/${hospital.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => window.open(`tel:${hospital.contactPhone}`, '_self')}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <p className="text-xs font-medium mb-2">Legend</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs text-muted-foreground">Your location</span>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png" 
              alt="marker"
              className="w-3 h-4"
            />
            <span className="text-xs text-muted-foreground">Hospital</span>
          </div>
        </div>
      </div>
    </div>
  );
}
