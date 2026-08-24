export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  createdAt: string;
  companyCode?: string;
  teamCode?: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ItineraryItem {
  id: string;
  title: string;
  locationName: string;
  address: string;
  coords: Coordinate;
  scheduledTime: string; // HH:MM
  date?: string; // YYYY-MM-DD
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  destination: string;
  itinerary: ItineraryItem[];
  purpose?: string;
  createdAt?: string;
  companyCode?: string;
  teamCode?: string;
  userName?: string;
  userEmail?: string;
  isSharedWithTeam?: boolean;
  report?: string;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  tripId: string;
  timestamp: number;
  locationName: string;
  coords: Coordinate;
  type: 'check-in' | 'check-out';
  verified: boolean;
  itineraryItemId?: string;
  companyCode?: string;
  nfcTagId?: string;
}

export interface Expense {
  id: string;
  userId: string;
  tripId: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  imageUrl?: string;
  createdAt?: string;
  companyCode?: string;
}

export enum ViewState {
  HOME = 'HOME',
  TRIP_DETAIL = 'TRIP_DETAIL', // Re-purposed as Schedule View
  SCANNER = 'SCANNER',
  REPORT = 'REPORT',
  CREATE_TRIP = 'CREATE_TRIP',
  SETTINGS = 'SETTINGS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}