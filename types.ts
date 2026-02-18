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
}

export interface Trip {
  id: string;
  title: string;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  destination: string;
  itinerary: ItineraryItem[];
  purpose?: string;
}

export interface CheckInRecord {
  id: string;
  tripId: string;
  timestamp: number;
  locationName: string;
  coords: Coordinate;
  type: 'check-in' | 'check-out';
  verified: boolean;
  itineraryItemId?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  imageUrl?: string;
}

export enum ViewState {
  HOME = 'HOME',
  TRIP_DETAIL = 'TRIP_DETAIL', // Re-purposed as Schedule View
  SCANNER = 'SCANNER',
  REPORT = 'REPORT',
  CREATE_TRIP = 'CREATE_TRIP'
}