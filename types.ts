export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  createdAt?: string;
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
  status: 'upcoming' | 'ongoing' | 'active' | 'completed' | 'cancelled';
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
  createdAt?: string;
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

// --- REST API Backend Types ---

export interface BackendUser {
  UID_VAL: string;
  EMAIL: string;
  NAME: string;
  ROLE: 'admin' | 'manager' | 'employee';
  COMPANY_CODE?: string;
  TEAM_CODE?: string;
  CREATED_AT?: string;
}

export interface BackendTrip {
  ID: string;
  USER_ID: string;
  TITLE: string;
  STATUS: 'upcoming' | 'ongoing' | 'active' | 'completed' | 'cancelled';
  START_DATE: string;
  END_DATE: string;
  DESTINATION: string;
  ITINERARY_JSON?: string | ItineraryItem[] | null;
  PURPOSE?: string | null;
  REPORT?: string | null;
  COMPANY_CODE?: string;
  TEAM_CODE?: string;
  IS_SHARED_WITH_TEAM?: number | boolean;
  CREATED_AT?: string;
}

export interface BackendCheckIn {
  ID: string;
  USER_ID: string;
  TRIP_ID: string;
  TS_MILLIS: number;
  LOCATION_NAME: string;
  LAT?: number | string | null;
  LNG?: number | string | null;
  TYPE_VAL: 'check-in' | 'check-out';
  VERIFIED?: number | boolean;
  ITINERARY_ITEM_ID?: string | null;
  COMPANY_CODE?: string;
  NFC_TAG_ID?: string | null;
  CREATED_AT?: string;
}

export interface BackendExpense {
  ID: string;
  USER_ID: string;
  TRIP_ID: string;
  EXPENSE_DATE: string;
  MERCHANT: string;
  AMOUNT: number;
  CATEGORY: string;
  IMAGE_URL?: string | null;
  COMPANY_CODE?: string;
  CREATED_AT?: string;
}

export interface TripSummary {
  totalExpenseJpy: number;
  exchangeRate: number;
  totalExpenseKrw: number;
  checkInCount: number;
  byCategory: Record<string, number>;
}

export interface TripSummaryApiResponse {
  success: boolean;
  trip?: BackendTrip;
  summary: TripSummary;
}

export interface ExchangeRateResponse {
  jpy: number;
  rate: number;
  krw: number;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
}