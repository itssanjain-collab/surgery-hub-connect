// Surgery Hub Type Definitions

export type SurgeryType = 
  | 'diagnostic'
  | 'curative'
  | 'reconstructive'
  | 'cosmetic'
  | 'palliative';

export interface Hospital {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  yearEstablished: number;
  address: string;
  city: string;
  district: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  imageUrl: string;
  galleryImages: string[];
  accreditations: string[];
  surgeryTypes: SurgeryType[];
  surgeries: Surgery[];
  doctors: Doctor[];
  insuranceAccepted: string[];
  contactPhone: string;
  contactEmail: string;
  website?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Surgery {
  id: string;
  name: string;
  type: SurgeryType;
  description: string;
  minCost: number;
  maxCost: number;
  averageDuration: string;
  recoveryTime: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  availability: string[];
  bio?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'patient' | 'hospital_admin';
  favorites: string[];
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  hospitalId: string;
  label?: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  hospitalId: string;
  rating: number;
  title: string;
  content: string;
  surgeryType?: SurgeryType;
  visitDate: string;
  createdAt: string;
  helpful: number;
}

export interface Booking {
  id: string;
  userId: string;
  hospitalId: string;
  doctorId?: string;
  surgeryId?: string;
  type: 'consultation' | 'surgery' | 'visit';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: string;
  notes?: string;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  surgeryType?: SurgeryType;
  minPrice?: number;
  maxPrice?: number;
  region?: string;
  district?: string;
  minRating?: number;
  minExperience?: number;
  insuranceAccepted?: string;
  maxDistance?: number;
  sortBy: 'best_match' | 'lowest_cost' | 'highest_rated' | 'nearest';
}

export interface DashboardStats {
  totalViews: number;
  totalBookings: number;
  totalInquiries: number;
  averageRating: number;
  viewsChange: number;
  bookingsChange: number;
}

// Surgery type metadata
export const SURGERY_TYPES: Record<SurgeryType, { label: string; icon: string; description: string }> = {
  diagnostic: {
    label: 'Diagnostic Surgery',
    icon: '🔬',
    description: 'Procedures to diagnose medical conditions'
  },
  curative: {
    label: 'Curative Surgery',
    icon: '💊',
    description: 'Surgeries to treat and cure diseases'
  },
  reconstructive: {
    label: 'Reconstructive Surgery',
    icon: '🏥',
    description: 'Restore function and appearance after injury'
  },
  cosmetic: {
    label: 'Cosmetic Surgery',
    icon: '✨',
    description: 'Enhance aesthetic appearance'
  },
  palliative: {
    label: 'Palliative Surgery',
    icon: '🤲',
    description: 'Improve quality of life and comfort'
  }
};

// Karnataka regions and districts
export const KARNATAKA_REGIONS = [
  'Bengaluru Urban',
  'Bengaluru Rural', 
  'Mysuru',
  'Mangaluru',
  'Hubballi-Dharwad',
  'Belagavi',
  'Kalaburagi',
  'Tumakuru',
  'Ballari',
  'Shivamogga'
];
