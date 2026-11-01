import { isNativeApp, nativeSessionToken, saveNativeSession, clearNativeSession } from './nativeSession';
import { 
  User, Trip, CheckInRecord, Expense, ItineraryItem, 
  BackendUser, BackendTrip, BackendCheckIn, BackendExpense, 
  TripSummary, ExchangeRateResponse, HealthCheckResponse 
} from '../types';

// API Base URL from Vite environment or default fallback
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

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
  const latitude = lat === null || lat === undefined || lat === '' ? NaN : Number(lat);
  const longitude = lng === null || lng === undefined || lng === '' ? NaN : Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('유효한 위치 좌표가 필요합니다.');
  }
  return { latitude, longitude };
};

// --- 공통 HTTP 요청 처리 함수 ---
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  if (isNativeApp() && !/^https:\/\//i.test(API_BASE_URL)) throw new Error('앱 서버의 HTTPS 주소 설정이 필요합니다.');
  const nativeToken = await nativeSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(nativeToken ? { Authorization: `Bearer ${nativeToken}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { credentials: 'include', ...options, signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(60000)]) : AbortSignal.timeout(60000), headers });
    
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {}
      if (response.status === 401 && endpoint === '/auth/me') await clearNativeSession();
      throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204) return undefined as T;
    const result = await response.json();
    if (result?.success === false) throw new Error(result.message || '요청을 처리하지 못했습니다.');
    return result as T;
  } catch (error: any) {
    // 민감 정보 노출 방지: 콘솔에는 정제된 오류 메시지만 출력
    console.error(`[API Call Failed] Endpoint: ${endpoint}`, error?.message || 'Network error');
    throw error;
  }
}

// Fetch authenticated binary reports without putting session tokens in URLs.
export async function apiDownload(endpoint:string,filename:string):Promise<void>{
 if(isNativeApp()&&!/^https:\/\//i.test(API_BASE_URL))throw new Error('앱 서버의 HTTPS 주소 설정이 필요합니다.');
 const token=await nativeSessionToken();
 const response=await fetch(API_BASE_URL+endpoint,{credentials:'include',headers:token?{Authorization:`Bearer ${token}`}:{},signal:AbortSignal.timeout(30000)});
 if(!response.ok){const e=await response.json().catch(()=>({}));throw new Error(e.message||'파일 다운로드 실패');}
 const blob=await response.blob();
 if(isNativeApp()){
  const {Filesystem,Directory}=await import('@capacitor/filesystem');
  const {Share}=await import('@capacitor/share');
  const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('파일 읽기 실패'));reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(blob);});
  const path='reports/'+crypto.randomUUID()+'/'+filename.replace(/[^a-zA-Z0-9_.-]/g,'_');
  const saved=await Filesystem.writeFile({path,data,directory:Directory.Cache,recursive:true});
  await Share.share({title:'O1BO 일보',files:[saved.uri]});
  return;
 }
 // Use the authenticated attachment endpoint so embedded browsers can handle the download.
 // Session credentials stay in cookies, never in the URL. The request above checks errors first.
 const a=document.createElement('a');
 a.href=API_BASE_URL+endpoint;a.download=filename;document.body.appendChild(a);a.click();a.remove();
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
    verificationMethod: b.VERIFICATION_METHOD,
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

export async function fetchUsers(companyCode?: string): Promise<User[]> {
  const res = await apiFetch<{ success: boolean; data: BackendUser[] }>(`/users${companyCode ? '?companyCode=' + encodeURIComponent(companyCode) : ''}`);
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

  if (!res.data || !res.data.UID_VAL) throw new Error('서버에서 저장된 데이터를 반환하지 않았습니다.');
  return transformBackendUser(res.data);
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

  if (!res.data || !res.data.ID) throw new Error('서버에서 저장된 데이터를 반환하지 않았습니다.');
  return transformBackendTrip(res.data);
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
  companyCode?: string;
}): Promise<CheckInRecord[]> {
  const query = new URLSearchParams();
  if (params?.tripId) query.append('tripId', params.tripId);
  if (params?.companyCode) query.append('companyCode', params.companyCode);
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
  nfcChallenge?: string;
  locationAccuracy?: number;
  locationTimestamp?: number;
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
    nfcChallenge: checkInData.nfcChallenge,
    locationAccuracy: checkInData.locationAccuracy,
    locationTimestamp: checkInData.locationTimestamp,
  };

  const res = await apiFetch<{ success: boolean; message?: string; data: BackendCheckIn | any }>('/check-ins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.data || !res.data.ID) throw new Error('서버에서 저장된 데이터를 반환하지 않았습니다.');
  return transformBackendCheckIn(res.data);
}

// --- 4.5. 경비 정산 API ---

export async function fetchExpenses(params?: {
  tripId?: string;
  userId?: string;
  category?: string;
  companyCode?: string;
}): Promise<Expense[]> {
  const query = new URLSearchParams();
  if (params?.tripId) query.append('tripId', params.tripId);
  if (params?.companyCode) query.append('companyCode', params.companyCode);
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

  if (!res.data || !res.data.ID) throw new Error('서버에서 저장된 데이터를 반환하지 않았습니다.');
  return transformBackendExpense(res.data);
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (!id) return false;
  const res = await apiFetch<{ success: boolean; message?: string }>(`/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res === undefined || res.success === true;
}

// These endpoints require the corresponding AWS server implementation.
export async function updateTrip(trip: Trip): Promise<Trip> {
  const result = await apiFetch<{ success: boolean; data: BackendTrip }>(`/trips/${encodeURIComponent(trip.id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...trip, itineraryJson: JSON.stringify(trip.itinerary), isSharedWithTeam: trip.isSharedWithTeam ? 1 : 0 }),
  });
  if (!result?.success || !result.data?.ID) throw new Error('서버에서 저장된 출장 데이터를 반환하지 않았습니다.');
  return transformBackendTrip(result.data);
}

export async function deleteTrip(id: string): Promise<void> {
  await apiFetch(`/trips/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

const reportEmailRequests=new Map<string,string>();
export async function sendReportEmail(tripId: string, recipient: string, report: string): Promise<void> {
  const digestBytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({tripId,recipient,report})));
  const signature=Array.from(new Uint8Array(digestBytes),b=>b.toString(16).padStart(2,'0')).join('');
  if(!reportEmailRequests.has(signature))reportEmailRequests.set(signature,crypto.randomUUID());
  await apiFetch(`/trips/${encodeURIComponent(tripId)}/report/email`, {
    method: 'POST', body: JSON.stringify({ recipient, report,requestId:reportEmailRequests.get(signature) }),
  });
}

export async function fetchSessionUser(): Promise<User> {
  const result = await apiFetch<{ success: boolean; data: BackendUser }>('/auth/me');
  if (!result?.success || !result.data?.UID_VAL) throw new Error('서버 로그인 세션이 필요합니다.');
  return transformBackendUser(result.data);
}

export async function updateMembership(endpoint: '/teams' | '/teams/join' | '/companies/join', code?: string): Promise<User> {
  const result = await apiFetch<{ success: boolean; data: BackendUser }>(endpoint, { method: 'POST', body: JSON.stringify(code ? { code } : {}) });
  if (!result?.success || !result.data?.UID_VAL) throw new Error('서버에서 확인된 소속 정보를 반환하지 않았습니다.');
  return transformBackendUser(result.data);
}
export async function updateProfile(name: string): Promise<User> {
  const result = await apiFetch<{ success: boolean; data: BackendUser }>('/users/me', { method: 'PATCH', body: JSON.stringify({ name }) });
  if (!result?.success || !result.data?.UID_VAL) throw new Error('프로필 저장 결과를 확인하지 못했습니다.');
  return transformBackendUser(result.data);
}
export async function endSession(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
  await clearNativeSession();
}

export async function exchangeSessionCode(code: string): Promise<User> {
  const base = new URL(API_BASE_URL, window.location.href);
  if (base.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) {
    throw new Error('로그인 코드는 HTTPS 또는 SSH 터널의 localhost 주소에서만 사용할 수 있습니다.');
  }
  const result = await apiFetch<{ success: boolean; data: BackendUser }>('/auth/exchange', { method: 'POST', body: JSON.stringify({ code }) });
  if (!result?.success || !result.data?.UID_VAL) throw new Error('로그인 결과를 확인하지 못했습니다.');
  return transformBackendUser(result.data);
}

export async function createCompany(companyName: string, ownerName: string): Promise<User> {
  const result = await apiFetch<{ success: boolean; data: BackendUser }>('/companies', {
    method: 'POST', body: JSON.stringify({ companyName, ownerName }),
  });
  if (!result?.success || !result.data?.UID_VAL || !result.data.COMPANY_CODE || result.data.ROLE !== 'admin') {
    throw new Error('회사 생성 결과를 확인하지 못했습니다. 다시 로그인해 소속을 확인해 주세요.');
  }
  return transformBackendUser(result.data);
}

export async function passwordAuth(mode: 'login' | 'register', email: string, password: string, name?: string): Promise<User> {
  const base = new URL(API_BASE_URL, window.location.href);
  if (base.protocol !== 'https:' && (isNativeApp() || !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))) {
    throw new Error('HTTPS 연결에서 로그인해 주세요.');
  }
  const result = await apiFetch<{ data: BackendUser; sessionToken?: string; expiresAt: number }>(`/auth/${mode}`, {
    method: 'POST', body: JSON.stringify({ email, password, ...(mode === 'register' ? { name } : {}), sessionMode: isNativeApp() ? 'native' : 'web' }),
  });
  if (!result.data?.UID_VAL) throw new Error('로그인 결과를 확인하지 못했습니다.');
  if (isNativeApp()) {
    if (!result.sessionToken) throw new Error('앱 로그인 세션이 없습니다.');
    try { await saveNativeSession(result.sessionToken, result.expiresAt); }
    catch (error) {
      await apiFetch('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${result.sessionToken}` } }).catch(() => {});
      throw error;
    }
  }
  return transformBackendUser(result.data);
}
