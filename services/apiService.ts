import { 
  User, Trip, CheckInRecord, Expense, ItineraryItem, 
  BackendUser, BackendTrip, BackendCheckIn, BackendExpense, 
  TripSummary, ExchangeRateResponse, HealthCheckResponse 
} from '../types';

// API Base URL from Vite environment or default fallback
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api';

/**
 * 보안 유틸리티: XSS 방지를 위한 기본 입력값 인코딩/정제
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * 좌표 유효성 검증 (GPS 위도 -90~90, 경도 -180~180)
 */
export const validateCoordinates = (lat?: number | string | null, lng?: number | string | null): { latitude: number; longitude: number } => {
  const latitude = typeof lat === 'number' ? lat : parseFloat(String(lat || 35.6762));
  const longitude = typeof lng === 'number' ? lng : parseFloat(String(lng || 139.6503));

  const safeLat = isNaN(latitude) || latitude < -90 || latitude > 90 ? 35.6762 : latitude;
  const safeLng = isNaN(longitude) || longitude < -180 || longitude > 180 ? 139.6503 : longitude;

  return { latitude: safeLat, longitude: safeLng };
};

// --- 공통 HTTP 요청 처리 함수 ---
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return await response.json() as T;
  } catch (error: any) {
    // 민감 정보 노출 방지: 콘솔에는 정제된 오류 메시지만 출력
    console.error(`[API Call Failed] Endpoint: ${endpoint}`, error?.message || 'Network error');
    throw error;
  }
}

// --- DB 스키마 <-> 프론트엔드 모델 변환기 ---

export function transformBackendUser(b: BackendUser): User {
  return {
    uid: b.UID_VAL,
    email: b.EMAIL,
    name: b.NAME,
    role: b.ROLE || 'employee',
    companyCode: b.COMPANY_CODE,
    teamCode: b.TEAM_CODE,
    createdAt: b.CREATED_AT,
  };
}

export function transformBackendTrip(b: BackendTrip): Trip {
  let itineraryList: ItineraryItem[] = [];

  if (b.ITINERARY_JSON) {
    if (typeof b.ITINERARY_JSON === 'string') {
      try {
        const parsed = JSON.parse(b.ITINERARY_JSON);
        if (Array.isArray(parsed)) {
          itineraryList = parsed;
        }
      } catch (e) {
        console.warn(`[Trip Itinerary Parsing Error] ID: ${b.ID}`);
      }
    } else if (Array.isArray(b.ITINERARY_JSON)) {
      itineraryList = b.ITINERARY_JSON;
    }
  }

  let reportContent: string | undefined = undefined;
  if (b.REPORT) {
    if (typeof b.REPORT === 'string') {
      reportContent = b.REPORT;
    } else {
      try {
        reportContent = JSON.stringify(b.REPORT);
      } catch (_) {
        reportContent = String(b.REPORT);
      }
    }
  }

  const isShared = b.IS_SHARED_WITH_TEAM === 1 || b.IS_SHARED_WITH_TEAM === true;

  return {
    id: b.ID,
    userId: b.USER_ID,
    title: b.TITLE,
    status: (b.STATUS as any) || 'upcoming',
    startDate: b.START_DATE,
    endDate: b.END_DATE,
    destination: b.DESTINATION,
    itinerary: itineraryList,
    purpose: b.PURPOSE || undefined,
    report: reportContent,
    companyCode: b.COMPANY_CODE,
    teamCode: b.TEAM_CODE,
    isSharedWithTeam: isShared,
    createdAt: b.CREATED_AT,
  };
}

export function transformBackendCheckIn(b: BackendCheckIn): CheckInRecord {
  const coords = validateCoordinates(b.LAT, b.LNG);
  const isVerified = b.VERIFIED === 1 || b.VERIFIED === true;

  return {
    id: b.ID,
    userId: b.USER_ID,
    tripId: b.TRIP_ID,
    timestamp: typeof b.TS_MILLIS === 'number' ? b.TS_MILLIS : Date.now(),
    locationName: b.LOCATION_NAME,
    coords,
    type: b.TYPE_VAL === 'check-out' ? 'check-out' : 'check-in',
    verified: isVerified,
    itineraryItemId: b.ITINERARY_ITEM_ID || undefined,
    companyCode: b.COMPANY_CODE,
    nfcTagId: b.NFC_TAG_ID || undefined,
    createdAt: b.CREATED_AT,
  };
}

export function transformBackendExpense(b: BackendExpense): Expense {
  return {
    id: b.ID,
    userId: b.USER_ID,
    tripId: b.TRIP_ID,
    date: b.EXPENSE_DATE,
    merchant: b.MERCHANT,
    amount: typeof b.AMOUNT === 'number' ? b.AMOUNT : parseFloat(String(b.AMOUNT || 0)),
    category: b.CATEGORY || 'MEAL',
    imageUrl: b.IMAGE_URL || undefined,
    companyCode: b.COMPANY_CODE,
    createdAt: b.CREATED_AT,
  };
}

// --- 4.1. 시스템 & 환율 API ---

export async function fetchHealth(): Promise<HealthCheckResponse> {
  return apiFetch<HealthCheckResponse>('/health');
}

export async function fetchExchangeRate(jpy: number = 0): Promise<ExchangeRateResponse> {
  const cleanJpy = Math.max(0, isNaN(jpy) ? 0 : jpy);
  return apiFetch<ExchangeRateResponse>(`/exchange-rate?jpy=${cleanJpy}`);
}

// --- 4.2. 사용자 관리 API ---

export async function fetchUsers(): Promise<User[]> {
  const res = await apiFetch<{ success: boolean; data: BackendUser[] }>('/users');
  if (res.success && Array.isArray(res.data)) {
    return res.data.map(transformBackendUser);
  }
  return [];
}

export async function fetchUserByUid(uid: string): Promise<User | null> {
  if (!uid) return null;
  const res = await apiFetch<{ success: boolean; data: BackendUser }>(`/users/${encodeURIComponent(uid)}`);
  if (res.success && res.data) {
    return transformBackendUser(res.data);
  }
  return null;
}

export async function upsertUser(user: {
  uid: string;
  email: string;
  name: string;
  role?: 'employee' | 'manager' | 'admin';
  companyCode?: string;
  teamCode?: string;
}): Promise<User> {
  const payload = {
    uid: user.uid,
    email: user.email,
    name: user.name,
    role: user.role || 'employee',
    companyCode: user.companyCode || 'COMP01',
    teamCode: user.teamCode || 'TEAM01',
  };

  const res = await apiFetch<{ success: boolean; message?: string; data: BackendUser | any }>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.data && res.data.UID_VAL) {
    return transformBackendUser(res.data);
  } else {
    return {
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role || 'employee',
      companyCode: user.companyCode || 'COMP01',
      teamCode: user.teamCode || 'TEAM01',
    };
  }
}

// --- 4.3. 출장 일정 API ---

export async function fetchTrips(params?: {
  userId?: string;
  status?: string;
  companyCode?: string;
}): Promise<Trip[]> {
  const query = new URLSearchParams();
  if (params?.userId) query.append('userId', params.userId);
  if (params?.status) query.append('status', params.status);
  if (params?.companyCode) query.append('companyCode', params.companyCode);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiFetch<{ success: boolean; data: BackendTrip[] }>(`/trips${queryString}`);

  if (res.success && Array.isArray(res.data)) {
    return res.data.map(transformBackendTrip);
  }
  return [];
}

export async function fetchTripById(id: string): Promise<Trip | null> {
  if (!id) return null;
  const res = await apiFetch<{ success: boolean; data: BackendTrip }>(`/trips/${encodeURIComponent(id)}`);
  if (res.success && res.data) {
    return transformBackendTrip(res.data);
  }
  return null;
}

export async function createTrip(tripData: {
  id?: string;
  userId: string;
  title: string;
  status?: string;
  startDate: string;
  endDate: string;
  destination: string;
  itineraryJson?: any;
  purpose?: string;
  report?: any;
  companyCode?: string;
  teamCode?: string;
  isSharedWithTeam?: boolean | number;
}): Promise<Trip> {
  const itineraryPayload = typeof tripData.itineraryJson === 'string'
    ? tripData.itineraryJson
    : JSON.stringify(tripData.itineraryJson || []);

  const reportPayload = tripData.report
    ? (typeof tripData.report === 'string' ? tripData.report : JSON.stringify(tripData.report))
    : null;

  const payload = {
    id: tripData.id || `TRIP_${Date.now()}`,
    userId: tripData.userId,
    title: tripData.title,
    status: tripData.status || 'upcoming',
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    destination: tripData.destination,
    itineraryJson: itineraryPayload,
    purpose: tripData.purpose || null,
    report: reportPayload,
    companyCode: tripData.companyCode || 'COMP01',
    teamCode: tripData.teamCode || 'TEAM01',
    isSharedWithTeam: tripData.isSharedWithTeam ? 1 : 0,
  };

  const res = await apiFetch<{ success: boolean; message?: string; data: BackendTrip | any }>('/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.data && res.data.ID) {
    return transformBackendTrip(res.data);
  } else {
    return {
      id: payload.id,
      userId: payload.userId,
      title: payload.title,
      status: payload.status as any,
      startDate: payload.startDate,
      endDate: payload.endDate,
      destination: payload.destination,
      itinerary: Array.isArray(tripData.itineraryJson) ? tripData.itineraryJson : [],
      purpose: tripData.purpose,
      report: tripData.report,
      companyCode: payload.companyCode,
      teamCode: payload.teamCode,
      isSharedWithTeam: tripData.isSharedWithTeam ? true : false,
    };
  }
}

export async function fetchTripSummary(id: string, rate: number = 9.15): Promise<{
  trip?: Trip;
  summary: TripSummary;
}> {
  const res = await apiFetch<{ success: boolean; trip?: BackendTrip; summary: TripSummary }>(
    `/trips/${encodeURIComponent(id)}/summary?rate=${rate}`
  );

  return {
    trip: res.trip ? transformBackendTrip(res.trip) : undefined,
    summary: res.summary || {
      totalExpenseJpy: 0,
      exchangeRate: rate,
      totalExpenseKrw: 0,
      checkInCount: 0,
      byCategory: {}
    }
  };
}

// --- 4.4. 위치 체크인 API ---

export async function fetchCheckIns(params?: {
  tripId?: string;
  userId?: string;
}): Promise<CheckInRecord[]> {
  const query = new URLSearchParams();
  if (params?.tripId) query.append('tripId', params.tripId);
  if (params?.userId) query.append('userId', params.userId);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiFetch<{ success: boolean; data: BackendCheckIn[] }>(`/check-ins${queryString}`);

  if (res.success && Array.isArray(res.data)) {
    return res.data.map(transformBackendCheckIn);
  }
  return [];
}

export async function createCheckIn(checkInData: {
  id?: string;
  userId: string;
  tripId: string;
  tsMillis?: number;
  locationName: string;
  lat?: number | string;
  lng?: number | string;
  typeVal?: 'check-in' | 'check-out';
  verified?: boolean | number;
  itineraryItemId?: string;
  companyCode?: string;
  nfcTagId?: string;
}): Promise<CheckInRecord> {
  const coords = validateCoordinates(checkInData.lat, checkInData.lng);

  const payload = {
    id: checkInData.id || `CHECK_${Date.now()}`,
    userId: checkInData.userId,
    tripId: checkInData.tripId,
    tsMillis: checkInData.tsMillis || Date.now(),
    locationName: checkInData.locationName,
    lat: coords.latitude,
    lng: coords.longitude,
    typeVal: checkInData.typeVal || 'check-in',
    verified: checkInData.verified === false || checkInData.verified === 0 ? 0 : 1,
    itineraryItemId: checkInData.itineraryItemId || null,
    companyCode: checkInData.companyCode || 'COMP01',
    nfcTagId: checkInData.nfcTagId || null,
  };

  const res = await apiFetch<{ success: boolean; message?: string; data: BackendCheckIn | any }>('/check-ins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.data && res.data.ID) {
    return transformBackendCheckIn(res.data);
  } else {
    return {
      id: payload.id,
      userId: payload.userId,
      tripId: payload.tripId,
      timestamp: payload.tsMillis,
      locationName: payload.locationName,
      coords,
      type: payload.typeVal as any,
      verified: payload.verified === 1,
      itineraryItemId: checkInData.itineraryItemId,
      companyCode: payload.companyCode,
      nfcTagId: checkInData.nfcTagId,
    };
  }
}

// --- 4.5. 경비 정산 API ---

export async function fetchExpenses(params?: {
  tripId?: string;
  userId?: string;
  category?: string;
}): Promise<Expense[]> {
  const query = new URLSearchParams();
  if (params?.tripId) query.append('tripId', params.tripId);
  if (params?.userId) query.append('userId', params.userId);
  if (params?.category) query.append('category', params.category);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiFetch<{ success: boolean; data: BackendExpense[] }>(`/expenses${queryString}`);

  if (res.success && Array.isArray(res.data)) {
    return res.data.map(transformBackendExpense);
  }
  return [];
}

export async function createExpense(expenseData: {
  id?: string;
  userId: string;
  tripId: string;
  expenseDate?: string;
  merchant: string;
  amount: number;
  category?: string;
  imageUrl?: string;
  companyCode?: string;
}): Promise<Expense> {
  const safeAmount = Math.max(0, isNaN(expenseData.amount) ? 0 : expenseData.amount);
  const todayStr = new Date().toISOString().split('T')[0];

  const payload = {
    id: expenseData.id || `EXP_${Date.now()}`,
    userId: expenseData.userId,
    tripId: expenseData.tripId,
    expenseDate: expenseData.expenseDate || todayStr,
    merchant: expenseData.merchant,
    amount: safeAmount,
    category: expenseData.category || 'MEAL',
    imageUrl: expenseData.imageUrl || null,
    companyCode: expenseData.companyCode || 'COMP01',
  };

  const res = await apiFetch<{ success: boolean; message?: string; data: BackendExpense | any }>('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.data && res.data.ID) {
    return transformBackendExpense(res.data);
  } else {
    return {
      id: payload.id,
      userId: payload.userId,
      tripId: payload.tripId,
      date: payload.expenseDate,
      merchant: payload.merchant,
      amount: payload.amount,
      category: payload.category,
      imageUrl: expenseData.imageUrl,
      companyCode: payload.companyCode,
    };
  }
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (!id) return false;
  const res = await apiFetch<{ success: boolean; message?: string }>(`/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.success === true;
}
