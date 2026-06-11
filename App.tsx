import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { Trip, ViewState, Coordinate, CheckInRecord, Expense, ItineraryItem, User } from './types';
import { getCurrentPosition, calculateDistance } from './services/locationService';
import { analyzeReceiptImage, generateTripReport, generateTripFromChat, adjustTripItinerary } from './services/geminiService';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { 
  IconMapPin, 
  IconBriefcase, 
  IconCamera, 
  IconFileText, 
  IconChevronRight, 
  IconCheckCircle, 
  IconClock, 
  IconHome, 
  IconReceipt, 
  IconXCircle, 
  IconGlobe, 
  IconEdit, 
  IconCalendar,
  IconZap,
  IconLogOut,
  IconPlus,
  IconTrash,
  IconMap,
  IconNavigation,
  IconSave,
  IconX,
  IconImage,
  IconSend,
  IconBot,
  IconMic,
  IconMoon,
  IconSun,
  IconStop,
  Icon1BLogo
} from './components/Icons';

// --- Translations ---
type Lang = 'ja' | 'ko';

const TRANSLATIONS = {
  ja: {
    status_label: "現在のステータス",
    status_active: "出張中 (Active)",
    status_inactive: "出張予定なし",
    btn_checkin: "手動チェックイン",
    btn_expense: "経費入力",
    history_title: "最近の活動履歴",
    history_subtitle: "History",
    no_history: "まだ活動記録がありません",
    btn_create_report: "日報作成 (AI)",
    trip_schedule_title: "訪問スケジュール",
    trip_schedule_hint: "現地に到着すると自動でチェックインされます",
    btn_checkin_here: "手動チェックイン",
    locating: "測位中...",
    scan_title: "レシートをスキャン",
    scan_desc: "カメラでレシートを撮影するか、画像を選択してください。AIが自動で内容を読み取ります。",
    btn_camera: "カメラを起動",
    btn_upload: "アルバムから選択",
    analyzing: "解析中... (Analyzing)",
    report_preview: "出張日報プレビュー",
    report_ai_badge: "AI Generated",
    report_loading: "レポート作成中...",
    report_sending: "送信中...",
    report_failed: "レポートを生成できませんでした。",
    btn_regenerate: "再生成",
    btn_submit: "メールで提出 (Submit)",
    btn_edit: "編集",
    btn_done: "完了",
    nav_home: "ホーム",
    nav_schedule: "日程",
    nav_report: "日報",
    nav_settings: "設定",
    error_loc_perm: "位置情報を取得できません。権限を確認してください。",
    error_loc_fetch: "現在地を取得できませんでした。",
    msg_checkin_ok: "✅ {name}にチェックインしました",
    msg_checkin_warn: "⚠️ {name}から離れていますが、記録しました。",
    msg_receipt_fail: "レシート解析に失敗しました。もう一度お試しください。",
    msg_img_fail: "画像の読み込みに失敗しました。",
    debug_gps: "GPS:",
    status_checked_in: "チェックイン済み:",
    auto_checkin_active: "自動チェックイン有効",
    auto_checkin_desc: "目的地付近(50m以内)で自動記録",
    toast_auto_checkin: "📍 自動チェックイン完了: {name}",
    btn_checkout: "チェックアウト",
    status_checked_out: "チェックアウト:",
    msg_checkout_ok: "👋 {name}からチェックアウトしました",
    // New Trip Translations
    title_create_trip: "新規出張計画",
    label_trip_title: "出張名",
    label_destination: "行き先",
    label_start_date: "開始日",
    label_end_date: "終了日",
    label_trip_purpose: "出張の目的",
    btn_save_trip: "日程作成完了",
    section_upcoming: "今後の出張予定",
    msg_trip_created: "新しい出張計画を作成しました",
    btn_new_trip: "新規作成",
    msg_fill_all: "すべての項目を入力してください",
    confirm_delete_trip: "この出張計画を削除してもよろしいですか？",
    msg_trip_deleted: "出張計画を削除しました",
    confirm_delete_itinerary: "この日程を削除してもよろしいですか？",
    msg_itinerary_deleted: "日程を削除しました",
    msg_no_trip_selected: "出張が選択されていません",
    msg_create_first_trip: "新しい出張計画を作成してください",
    // Map & Edit
    tab_list: "リスト",
    tab_map: "マップ",
    btn_navigate: "経路案内",
    btn_cancel: "キャンセル",
    btn_save: "保存",
    label_location_name: "場所名",
    label_address: "住所",
    label_time: "時間",
    // Email
    label_email: "送信先メールアドレス",
    placeholder_email: "manager@company.com",
    msg_email_sent: "日報を送信しました: {email}",
    error_email_required: "メールアドレスを入力してください",
    // Company Code
    company_code_title: "会社コード",
    company_code_desc: "管理者が発行した会社コードを入力してください。",
    btn_join_company: "参加する",
    msg_company_joined: "会社に参加しました",
    admin_company_code: "あなたの会社コード (招待用):",
    // Expense Chart
    chart_title: "経費内訳",
    chart_total: "合計",
    // AI Bot
    ai_bot_title: "AIアシスタント",
    ai_bot_placeholder: "「明日から東京に出張します...」",
    ai_bot_listening: "音声入力中...",
    ai_bot_processing: "AIがスケジュールを作成しています...",
    ai_bot_success: "スケジュールを作成しました！",
    ai_bot_error: "スケジュールの作成に失敗しました。",
    wake_word_enable: "音声ウェイクアップ",
    wake_word_listening: "「하이 제로보」待機中",
    theme_title: "テーマ設定",
    theme_light: "ライトモード",
    theme_dark: "ダークモード"
  },
  ko: {
    status_label: "현재 상태",
    status_active: "출장 중 (Active)",
    status_inactive: "출장 일정 없음",
    btn_checkin: "수동 체크인",
    btn_expense: "경비 입력",
    history_title: "최근 활동 내역",
    history_subtitle: "History",
    no_history: "아직 활동 기록이 없습니다",
    btn_create_report: "일보 작성 (AI)",
    trip_schedule_title: "방문 일정",
    trip_schedule_hint: "현지에 도착하면 자동으로 체크인됩니다",
    btn_checkin_here: "수동 체크인",
    locating: "위치 확인 중...",
    scan_title: "영수증 스캔",
    scan_desc: "카메라로 영수증을 찍거나 이미지를 선택하세요. AI가 자동으로 내용을 읽어옵니다.",
    btn_camera: "카메라 실행",
    btn_upload: "앨범에서 선택",
    analyzing: "분석 중... (Analyzing)",
    report_preview: "출장 일보 미리보기",
    report_ai_badge: "AI 생성됨",
    report_loading: "리포트 작성 중...",
    report_sending: "전송 중...",
    report_failed: "리포트를 생성할 수 없습니다.",
    btn_regenerate: "재생성",
    btn_submit: "메일로 제출 (Submit)",
    btn_edit: "수정",
    btn_done: "완료",
    nav_home: "홈",
    nav_schedule: "일정",
    nav_report: "일보",
    nav_settings: "설정",
    error_loc_perm: "위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.",
    error_loc_fetch: "현재 위치를 가져올 수 없습니다.",
    msg_checkin_ok: "✅ {name}에 체크인했습니다",
    msg_checkin_warn: "⚠️ {name}에서 떨어져 있지만 기록했습니다.",
    msg_receipt_fail: "영수증 분석에 실패했습니다. 다시 시도해주세요.",
    msg_img_fail: "이미지를 불러오는데 실패했습니다.",
    debug_gps: "GPS:",
    status_checked_in: "체크인 완료:",
    auto_checkin_active: "자동 체크인 활성",
    auto_checkin_desc: "목적지 부근(50m 이내) 자동 기록",
    toast_auto_checkin: "📍 자동 체크인 완료: {name}",
    btn_checkout: "체크아웃",
    status_checked_out: "체크아웃:",
    msg_checkout_ok: "👋 {name}에서 체크아웃했습니다",
    // New Trip Translations
    title_create_trip: "새 출장 계획",
    label_trip_title: "출장명",
    label_destination: "목적지",
    label_start_date: "시작일",
    label_end_date: "종료일",
    label_trip_purpose: "출장 목적",
    btn_save_trip: "일정 작성완료",
    section_upcoming: "예정된 출장",
    msg_trip_created: "새 출장 계획이 생성되었습니다",
    btn_new_trip: "새로 만들기",
    msg_fill_all: "모든 항목을 입력해주세요",
    confirm_delete_trip: "이 출장 계획을 삭제하시겠습니까?",
    msg_trip_deleted: "출장 계획이 삭제되었습니다",
    confirm_delete_itinerary: "이 일정을 삭제하시겠습니까?",
    msg_itinerary_deleted: "일정이 삭제되었습니다",
    msg_no_trip_selected: "선택된 출장이 없습니다",
    msg_create_first_trip: "새로운 출장 계획을 만들어보세요",
    // Map & Edit
    tab_list: "목록",
    tab_map: "지도",
    btn_navigate: "길찾기",
    btn_cancel: "취소",
    btn_save: "저장",
    label_location_name: "장소명",
    label_address: "주소",
    label_time: "시간",
    // Email
    label_email: "수신 이메일 주소",
    placeholder_email: "manager@company.com",
    msg_email_sent: "일보를 전송했습니다: {email}",
    error_email_required: "이메일 주소를 입력해주세요",
    // Company Code
    company_code_title: "회사 코드",
    company_code_desc: "관리자가 발급한 회사 코드를 입력해주세요.",
    btn_join_company: "참여하기",
    msg_company_joined: "회사에 참여했습니다",
    admin_company_code: "나의 회사 코드 (초대용):",
    // Expense Chart
    chart_title: "경비 내역",
    chart_total: "합계",
    // AI Bot
    ai_bot_title: "AI 어시스턴트",
    ai_bot_placeholder: "「내일 부산으로 출장갑니다...」",
    ai_bot_listening: "음성 입력 중...",
    ai_bot_processing: "AI가 일정을 작성하고 있습니다...",
    ai_bot_success: "일정이 작성되었습니다!",
    ai_bot_error: "일정 작성에 실패했습니다.",
    wake_word_enable: "음성 호출",
    wake_word_listening: "「하이 제로보」 대기 중",
    theme_title: "테마 설정",
    theme_light: "라이트 모드",
    theme_dark: "다크 모드"
  }
};

// Internal Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-4 right-4 z-[9999] p-4 rounded-xl shadow-lg flex items-center space-x-3 transition-all transform translate-y-0
      ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}
    `}>
      {type === 'success' ? <IconCheckCircle className="w-6 h-6" /> : <IconXCircle className="w-6 h-6" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

// --- Trip Map Component ---
const TripMap = ({ items, t, theme }: { items: ItineraryItem[], t: any, theme?: 'light' | 'dark' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([35.6812, 139.7671], 13);
    }

    const map = mapInstance.current;

    if (tileLayerInstance.current) {
      map.removeLayer(tileLayerInstance.current);
    }

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerInstance.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add markers
    const bounds = L.latLngBounds([]);
    
    items.forEach((item) => {
      const { latitude, longitude } = item.coords;
      const markerLatLng = L.latLng(latitude, longitude);
      bounds.extend(markerLatLng);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#4F46E5;width:16px;height:16px;border-radius:50%;border:3px solid ${theme === 'dark' ? '#1f2937' : 'white'};box-shadow:0 3px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family:'Noto Sans JP',sans-serif; background-color: ${theme === 'dark' ? '#1f2937' : 'white'}; color: ${theme === 'dark' ? '#f3f4f6' : '#1e1b4b'}; padding: 4px; border-radius: 4px;">
          <strong style="font-size:14px;">${item.locationName}</strong><br/>
          <span style="color:${theme === 'dark' ? '#9ca3af' : '#6b7280'};font-size:12px;">${item.scheduledTime}</span><br/>
          <div style="margin-top:8px;">
            <button class="nav-btn" style="background-color:#4F46E5;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:12px;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:4px;">
              <span>${t.btn_navigate}</span>
            </button>
          </div>
        </div>
      `;
      
      const navBtn = popupContent.querySelector('.nav-btn');
      if (navBtn) {
          navBtn.addEventListener('click', () => {
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
          });
      }

      L.marker(markerLatLng, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
            className: theme === 'dark' ? 'dark-popup' : ''
        });
    });

    if (items.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Map cleanup handled by ref check
    };
  }, [items, t, theme]);

  return <div ref={mapRef} className="w-full h-full rounded-xl z-0" />;
};


const App: React.FC = () => {
  // Auth State
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLocalGuest, setIsLocalGuest] = useState<boolean>(false);

  // Local Guest data helpers
  const saveLocalTrips = (trips: Trip[]) => {
    if (localStorage.getItem('is_local_guest') === 'true' && authUser) {
      localStorage.setItem(`local_trips_${authUser.uid}`, JSON.stringify(trips));
    }
  };
  const saveLocalCheckIns = (records: CheckInRecord[]) => {
    if (localStorage.getItem('is_local_guest') === 'true' && authUser) {
      localStorage.setItem(`local_checkins_${authUser.uid}`, JSON.stringify(records));
    }
  };
  const saveLocalExpenses = (expList: Expense[]) => {
    if (localStorage.getItem('is_local_guest') === 'true' && authUser) {
      localStorage.setItem(`local_expenses_${authUser.uid}`, JSON.stringify(expList));
    }
  };

  // State
  const [language, setLanguage] = useState<Lang>('ja');
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [adminCheckIns, setAdminCheckIns] = useState<CheckInRecord[]>([]);
  const [adminTrips, setAdminTrips] = useState<Trip[]>([]);
  const [adminExpenses, setAdminExpenses] = useState<Expense[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [reportPrompt, setReportPrompt] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasAutoCleaned, setHasAutoCleaned] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Detail View State
  const [showMap, setShowMap] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<Partial<ItineraryItem>>({});

  // Date Filtering State for Trip Detail Visit Schedule
  const [showDateFilterMenu, setShowDateFilterMenu] = useState(false);
  const [durationFilter, setDurationFilter] = useState<'all' | '1day' | '1week' | '1month' | 'custom'>('all');
  const [customFilterStart, setCustomFilterStart] = useState<string>('');
  const [customFilterEnd, setCustomFilterEnd] = useState<string>('');
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(4); // 0-based index

  const addDaysToDateString = (dateStr: string, days: number): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch (e) {
      console.error(e);
      return dateStr;
    }
  };

  const normalizeDateStr = (dateStr: string): string => {
    if (!dateStr) return '';
    return dateStr.replace(/\./g, '-').substring(0, 10);
  };

  // New Trip Form State
  const [newTripData, setNewTripData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });
  const [tripCreationSource, setTripCreationSource] = useState<ViewState>(ViewState.HOME);

  // AI Chat State
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [companyCodeInput, setCompanyCodeInput] = useState('');

  const handleJoinCompany = async () => {
    if (!authUser || !userData || !companyCodeInput.trim()) return;
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', authUser.uid);
      const updatedUser = { ...userData, companyCode: companyCodeInput.trim().toUpperCase() };
      await setDoc(userDocRef, updatedUser);
      setUserData(updatedUser);
      setNotification({ message: t.msg_company_joined, type: 'success' });
      setCompanyCodeInput('');
    } catch (error) {
      console.error("Error joining company:", error);
      setNotification({ message: 'Failed to join company', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Set calendar month/year based on active trip dates when loaded or changed
  useEffect(() => {
    if (activeTrip) {
      // Find the earliest itinerary item date
      const itineraryDates = activeTrip.itinerary
        ?.map(item => item.date)
        .filter(Boolean)
        .sort();
        
      const earliestDate = itineraryDates && itineraryDates.length > 0 
        ? itineraryDates[0] 
        : activeTrip.startDate;

      if (earliestDate) {
        const parts = earliestDate.replace(/\./g, '-').split('-');
        if (parts.length >= 2) {
          setCalendarYear(parseInt(parts[0], 10));
          setCalendarMonth(parseInt(parts[1], 10) - 1);
          return;
        }
      }
    }
    
    const today = new Date();
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
  }, [activeTrip?.id]);

  // Auth Effect
  useEffect(() => {
    // Check if we were in local guest mode first
    const savedIsGuest = localStorage.getItem('is_local_guest');
    if (savedIsGuest === 'true') {
      const savedProfile = localStorage.getItem('guest_user_profile');
      let fakeUserData: User = {
        uid: 'guest_test',
        email: 'guest@o1bo-test.com',
        name: '게스트 (테스트용)',
        role: 'admin',
        createdAt: new Date().toISOString(),
        companyCode: 'TEST01'
      };
      if (savedProfile) {
        try {
          fakeUserData = JSON.parse(savedProfile);
        } catch (_) {}
      }
      const fakeFirebaseUser = {
        uid: fakeUserData.uid,
        email: fakeUserData.email,
        displayName: fakeUserData.name,
        isAnonymous: true,
        emailVerified: true
      } as any;

      setIsLocalGuest(true);
      setAuthUser(fakeFirebaseUser);
      setUserData(fakeUserData);
      
      const localTrips = localStorage.getItem(`local_trips_${fakeUserData.uid}`) || '[]';
      const localCheckIns = localStorage.getItem(`local_checkins_${fakeUserData.uid}`) || '[]';
      const localExpenses = localStorage.getItem(`local_expenses_${fakeUserData.uid}`) || '[]';
      const parsedTrips = JSON.parse(localTrips) as Trip[];
      
      setAllTrips(parsedTrips);
      setActiveTrip(parsedTrips.find(t => t.status === 'active') || parsedTrips[0] || null);
      setUpcomingTrips(parsedTrips.filter(t => t.status === 'upcoming'));
      setCheckIns(JSON.parse(localCheckIns));
      setExpenses(JSON.parse(localExpenses));
      
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setAuthUser(user);
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          let data: User | null = null;
          
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              data = userDoc.data() as User;
              localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(data));
              
              if (data.role !== 'admin') {
                try {
                  // Attempt to upgrade to admin (Firestore rules will reject if not authorized)
                  const updatedUser = { ...data, role: 'admin' as const, companyCode: data.companyCode || Math.random().toString(36).substring(2, 8).toUpperCase() };
                  await setDoc(userDocRef, updatedUser);
                  data = updatedUser;
                  localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(data));
                  setUserData(updatedUser);
                } catch (e) {
                  // Not authorized to be admin, keep existing role
                  setUserData(data);
                }
              } else {
                // If admin but missing company code, generate one
                if (!data.companyCode) {
                  const updatedUser = { ...data, companyCode: Math.random().toString(36).substring(2, 8).toUpperCase() };
                  await setDoc(userDocRef, updatedUser);
                  data = updatedUser;
                  localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(data));
                  setUserData(updatedUser);
                } else {
                  setUserData(data);
                }
              }
            } else {
              // Create new user
              const baseUser = {
                uid: user.uid,
                email: user.email || 'no-email@example.com',
                name: user.displayName || 'User',
                createdAt: new Date().toISOString()
              };
              
              try {
                // Try to create as admin first
                const adminUser: User = { ...baseUser, role: 'admin' as const, companyCode: Math.random().toString(36).substring(2, 8).toUpperCase() };
                await setDoc(userDocRef, adminUser);
                data = adminUser;
                localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(data));
                setUserData(adminUser);
              } catch (e) {
                // If backend rejects admin role, create as employee
                const employeeUser: User = { ...baseUser, role: 'employee' as const };
                try {
                  await setDoc(userDocRef, employeeUser);
                  data = employeeUser;
                  localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(data));
                  setUserData(employeeUser);
                } catch (e2) {
                  console.error("Failed to create user", e2);
                  data = employeeUser;
                  setUserData(employeeUser);
                }
              }
            }
          } catch (dbError) {
            console.warn("Firestore fetch failed, checking localStorage fallback:", dbError);
            const cached = localStorage.getItem(`user_profile_${user.uid}`);
            if (cached) {
              try {
                data = JSON.parse(cached);
              } catch (_) {}
            }
            if (!data) {
              data = {
                uid: user.uid,
                email: user.email || 'no-email@example.com',
                name: user.displayName || 'User',
                role: 'employee',
                createdAt: new Date().toISOString()
              };
            }
            setUserData(data);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching Effect
  useEffect(() => {
    if (!isAuthReady || !authUser || !userData || isLocalGuest) return;

    let unsubUsers = () => {};
    if (userData.role === 'admin' && userData.companyCode) {
      const usersQuery = query(collection(db, 'users'), where('companyCode', '==', userData.companyCode));
      unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersMap: Record<string, User> = {};
        snapshot.docs.forEach(doc => {
          usersMap[doc.id] = doc.data() as User;
        });
        setCompanyUsers(usersMap);
      }, (error) => {
        console.error("Error fetching company users:", error);
      });
    }

    // Fetch Trips (Strictly Personal)
    const tripsQuery = query(collection(db, 'trips'), where('userId', '==', authUser.uid));
    const unsubTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => doc.data() as Trip).sort((a, b) => a.startDate.localeCompare(b.startDate));
      setAllTrips(tripsData);
      
      setActiveTrip((prevActive) => {
        if (prevActive) {
            // Keep the selected trip but update its data
            return tripsData.find(t => t.id === prevActive.id) || prevActive;
        }
        const active = tripsData.find(t => t.status === 'active');
        if (active) return active;
        return tripsData[0] || null;
      });
      
      setUpcomingTrips(tripsData.filter(t => t.status === 'upcoming'));
    });

    // Fetch CheckIns (Strictly Personal for primary operations)
    const checkInsQuery = query(collection(db, 'checkIns'), where('userId', '==', authUser.uid));
    const unsubCheckIns = onSnapshot(checkInsQuery, (snapshot) => {
      setCheckIns(snapshot.docs.map(doc => doc.data() as CheckInRecord).sort((a, b) => b.timestamp - a.timestamp));
    });

    // Fetch Expenses (Strictly Personal)
    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', authUser.uid));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => doc.data() as Expense).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    });

    // Fetch Admin Data Custom Listeners
    let unsubAdminCheckIns = () => {};
    let unsubAdminTrips = () => {};
    let unsubAdminExpenses = () => {};
    if (userData.role === 'admin' && userData.companyCode) {
      const adminCheckInsQuery = query(collection(db, 'checkIns'), where('companyCode', '==', userData.companyCode));
      unsubAdminCheckIns = onSnapshot(adminCheckInsQuery, (snapshot) => {
        setAdminCheckIns(snapshot.docs.map(doc => doc.data() as CheckInRecord).sort((a, b) => b.timestamp - a.timestamp));
      });

      const adminTripsQuery = query(collection(db, 'trips'), where('companyCode', '==', userData.companyCode));
      unsubAdminTrips = onSnapshot(adminTripsQuery, (snapshot) => {
        setAdminTrips(snapshot.docs.map(doc => doc.data() as Trip).sort((a, b) => a.startDate.localeCompare(b.startDate)));
      });

      const adminExpensesQuery = query(collection(db, 'expenses'), where('companyCode', '==', userData.companyCode));
      unsubAdminExpenses = onSnapshot(adminExpensesQuery, (snapshot) => {
        setAdminExpenses(snapshot.docs.map(doc => doc.data() as Expense).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      });
    }

    return () => {
      unsubUsers();
      unsubTrips();
      unsubCheckIns();
      unsubExpenses();
      unsubAdminCheckIns();
      unsubAdminTrips();
      unsubAdminExpenses();
    };
  }, [isAuthReady, authUser, userData]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setNotification(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error', error);
      
      const errorMessage = error?.message || '';
      const errorCode = error?.code || '';

      if (errorCode === 'auth/popup-blocked') {
        setNotification({ message: '팝업이 차단되었습니다. 브라우저 팝업을 허용하거나 우측 상단의 "새 탭에서 열기"를 클릭해 로그인해주세요.', type: 'error' });
      } else if (errorCode === 'auth/cancelled-popup-request' || errorCode === 'auth/popup-closed-by-user') {
        setNotification({ message: '로그인 팝업이 닫혔거나 이미 진행 중인 요청이 취소되었습니다. 팝업이 허용되었는지 확인하거나 우측 상단의 "새 탭에서 열기" 버튼을 클릭하여 새 창에서 시도해 주세요.', type: 'error' });
      } else if (errorMessage.includes('Pending promise was never set') || errorMessage.includes('INTERNAL ASSERTION FAILED')) {
        setNotification({ message: '현재 미리보기(iframe) 환경에서 로그인이 제한됩니다. 우측 상단의 "새 탭에서 열기" 버튼을 눌러 로그인해주세요.', type: 'error' });
      } else {
        setNotification({ message: `로그인 실패: ${errorMessage || '알 수 없는 오류'} (지속 시 "새 탭에서 열기" 버튼을 사용하여 접속해 보세요)`, type: 'error' });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setNotification(null);
    try {
      const guestUid = 'guest_' + Math.random().toString(36).substring(2, 9);
      const fakeFirebaseUser = {
        uid: guestUid,
        email: 'guest@o1bo-test.com',
        displayName: '테스트 게스트',
        isAnonymous: true,
        emailVerified: true
      } as any;
      
      const fakeUserData: User = {
        uid: guestUid,
        email: 'guest@o1bo-test.com',
        name: '게스트 (테스트용)',
        role: 'admin',
        createdAt: new Date().toISOString(),
        companyCode: 'TEST01'
      };

      setIsLocalGuest(true);
      localStorage.setItem('is_local_guest', 'true');
      localStorage.setItem('guest_user_profile', JSON.stringify(fakeUserData));
      
      setAuthUser(fakeFirebaseUser);
      setUserData(fakeUserData);
      
      // Load local guest data if it exists
      const localTrips = localStorage.getItem(`local_trips_${guestUid}`) || '[]';
      const localCheckIns = localStorage.getItem(`local_checkins_${guestUid}`) || '[]';
      const localExpenses = localStorage.getItem(`local_expenses_${guestUid}`) || '[]';
      
      const parsedTrips = JSON.parse(localTrips) as Trip[];
      setAllTrips(parsedTrips);
      setActiveTrip(parsedTrips.find(t => t.status === 'active') || parsedTrips[0] || null);
      setUpcomingTrips(parsedTrips.filter(t => t.status === 'upcoming'));
      setCheckIns(JSON.parse(localCheckIns));
      setExpenses(JSON.parse(localExpenses));

      setNotification({ message: '테스트 계정(로컬 모드)으로 로그인했습니다. 새로운 일정을 등록해 보세요!', type: 'success' });
    } catch (error) {
      console.warn("Guest login failed", error);
      setNotification({ message: '테스트 계정 로그인 실패', type: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLocalGuest(false);
      localStorage.removeItem('is_local_guest');
      localStorage.removeItem('guest_user_profile');
      setAuthUser(null);
      setUserData(null);
      await signOut(auth);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const cleanDecemberRecords = async (showNotification = true) => {
    setLoading(true);
    let deletedCount = 0;
    try {
      // 1. Clean trips in December 2026
      const tripsSnap = await getDocs(collection(db, 'trips'));
      const tripsToDelete: string[] = [];
      tripsSnap.forEach(docSnap => {
        const data = docSnap.data();
        const start = data.startDate || '';
        const end = data.endDate || '';
        if (start.includes('2026-12') || end.includes('2026-12')) {
          tripsToDelete.push(docSnap.id);
        }
      });

      for (const id of tripsToDelete) {
        // Cascading delete for child collections of these trips:
        // Delete all associated check-ins
        const checkInsQuery = query(collection(db, 'checkIns'), where('tripId', '==', id));
        const checkInsSnap = await getDocs(checkInsQuery);
        for (const docSnap of checkInsSnap.docs) {
          await deleteDoc(doc(db, 'checkIns', docSnap.id));
          deletedCount++;
        }

        // Delete all associated expenses
        const expensesQuery = query(collection(db, 'expenses'), where('tripId', '==', id));
        const expensesSnap = await getDocs(expensesQuery);
        for (const docSnap of expensesSnap.docs) {
          await deleteDoc(doc(db, 'expenses', docSnap.id));
          deletedCount++;
        }

        await deleteDoc(doc(db, 'trips', id));
        deletedCount++;
      }

      // 2. Clean individual check-ins in December 2026 (unlinked to the above trips)
      const ciSnap = await getDocs(collection(db, 'checkIns'));
      const ciToDelete: string[] = [];
      ciSnap.forEach(docSnap => {
        const c = docSnap.data();
        const ts = c.timestamp;
        if (ts) {
          const date = new Date(ts);
          if (date.getFullYear() === 2026 && date.getMonth() === 11) {
            ciToDelete.push(docSnap.id);
          }
        }
      });

      for (const id of ciToDelete) {
        await deleteDoc(doc(db, 'checkIns', id));
        deletedCount++;
      }

      // 3. Clean individual expenses in December 2026
      const expSnap = await getDocs(collection(db, 'expenses'));
      const expToDelete: string[] = [];
      expSnap.forEach(docSnap => {
        const e = docSnap.data();
        const d = e.date || '';
        if (d.includes('2026-12')) {
          expToDelete.push(docSnap.id);
        }
      });

      for (const id of expToDelete) {
        await deleteDoc(doc(db, 'expenses', id));
        deletedCount++;
      }

      if (deletedCount > 0 && showNotification) {
        setNotification({
          message: `2026년 12월 데이터와 관련된 ${deletedCount}개의 오래된 레코드를 성공적으로 정리하였습니다!`,
          type: 'success'
        });
      } else if (showNotification) {
        setNotification({
          message: '정리할 2026년 12월의 남은 데이터 레코드가 이미 비워져 있어 안전하게 준비되었습니다.',
          type: 'success'
        });
      }
      
      // Clear active trip if it was one of the deleted ones
      if (activeTrip && (activeTrip.startDate.includes('2026-12') || activeTrip.endDate.includes('2026-12') || tripsToDelete.includes(activeTrip.id))) {
        setActiveTrip(null);
        setView(ViewState.HOME);
      }
    } catch (err: any) {
      console.error("Clean error:", err);
      if (showNotification) {
        setNotification({
          message: `데이터 정리 중 오류가 발생했습니다: ${err.message || err}`,
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && authUser && authUser.email === 'rlaskslsl093@gmail.com' && !hasAutoCleaned) {
      setHasAutoCleaned(true);
      // Run automatic background quiet cleanup
      cleanDecemberRecords(true);
    }
  }, [isAuthReady, authUser, hasAutoCleaned]);
  
  // Helpers
  const t = TRANSLATIONS[language];
  const toggleLanguage = () => setLanguage(prev => prev === 'ja' ? 'ko' : 'ja');

  // Grouping trips by month
  const groupTripsByMonth = (trips: Trip[]) => {
    const groups: { [key: string]: Trip[] } = {};
    trips.forEach(trip => {
      if (!trip.startDate) return;
      const date = new Date(trip.startDate);
      if (isNaN(date.getTime())) return;
      
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(trip);
    });
    
    return Object.keys(groups).sort().map(key => ({
      monthKey: key,
      trips: groups[key].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }));
  };

  const formatMonthHeader = (key: string) => {
    const [year, month] = key.split('-');
    return language === 'ja' ? `${year}年 ${parseInt(month, 10)}月` : `${year}년 ${parseInt(month, 10)}월`;
  };

  // File Input Ref for Camera
  const fileInputRef = useRef<HTMLInputElement>(null);
  // File Input Ref for Gallery
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load saved report when activeTrip changes
  useEffect(() => {
    if (activeTrip) {
      setGeneratedReport(activeTrip.report || '');
    } else {
      setGeneratedReport('');
    }
  }, [activeTrip?.id]);

  // Initialize Location & Auto Check-in Loop
  useEffect(() => {
    updateLocation();
    
    // Poll location every 10 seconds for faster auto-checkin response
    const interval = setInterval(() => {
      updateLocation();
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  // Effect for Auto Check-in Logic
  useEffect(() => {
    if (!currentLocation || !activeTrip) return;
    
    // Check distances for all itinerary items
    activeTrip.itinerary.forEach(item => {
      // 1. Check if already checked in
      const isAlreadyCheckedIn = checkIns.some(ci => ci.itineraryItemId === item.id && ci.type === 'check-in');
      if (isAlreadyCheckedIn) return;

      // 2. Check distance
      const distance = calculateDistance(currentLocation, item.coords);
      const AUTO_CHECKIN_THRESHOLD = 50; // meters

      // 3. Trigger Check-in if close
      if (distance <= AUTO_CHECKIN_THRESHOLD) {
        performCheckIn(item, true); // true = automated
      }
    });

  }, [currentLocation, checkIns, activeTrip]); // Run when location changes or checkins update

  const updateLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      setCurrentLocation(coords);
      setErrorMsg(null);
    } catch (err) {
      console.warn("Location error", err);
      setErrorMsg(t.error_loc_perm);
    }
  };

  // --- Handlers ---

  const performCheckIn = async (item: any, isAuto: boolean) => {
    if (!currentLocation || !activeTrip) return;

    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      userId: authUser?.uid || 'anonymous',
      tripId: activeTrip.id,
      timestamp: Date.now(),
      locationName: item.locationName,
      coords: currentLocation,
      type: 'check-in',
      verified: true,
      itineraryItemId: item.id,
      ...(userData?.companyCode ? { companyCode: userData.companyCode } : {})
    };

    // Update locally first
    setCheckIns(prev => {
      const updated = [...prev.filter(ci => ci.id !== newRecord.id), newRecord];
      saveLocalCheckIns(updated);
      return updated;
    });

    if (authUser && !isLocalGuest) {
      try {
        await setDoc(doc(db, 'checkIns', newRecord.id), newRecord);
      } catch (error) {
        console.error("Error saving check-in to Firestore", error);
      }
    }

    if (isAuto) {
       setNotification({
         message: t.toast_auto_checkin.replace('{name}', item.locationName),
         type: 'success'
       });
    } else {
       // Manual check-in feedback
       alert(t.msg_checkin_ok.replace('{name}', item.locationName));
    }
  };

  const handleManualCheckIn = async (itemId: string) => {
    setLoading(true);
    await updateLocation(); // Force update
    
    if (!currentLocation) {
      setLoading(false);
      alert(t.error_loc_fetch);
      return;
    }

    if (!activeTrip) {
        setLoading(false);
        return;
    }

    const item = activeTrip.itinerary.find(i => i.id === itemId);
    if (!item) {
        setLoading(false);
        return;
    }

    // Manual check-in always allowed, but we can warn if far away
    performCheckIn(item, false);
    setLoading(false);
  };

  const handleCheckOut = async (itemId: string) => {
    setLoading(true);
    await updateLocation();
    
    if (!currentLocation) {
      setLoading(false);
      alert(t.error_loc_fetch);
      return;
    }

    if (!activeTrip) {
        setLoading(false);
        return;
    }

    const item = activeTrip.itinerary.find(i => i.id === itemId);
    if (!item) {
        setLoading(false);
        return;
    }

    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      userId: authUser?.uid || 'anonymous',
      tripId: activeTrip.id,
      timestamp: Date.now(),
      locationName: item.locationName,
      coords: currentLocation,
      type: 'check-out',
      verified: true,
      itineraryItemId: itemId,
      ...(userData?.companyCode ? { companyCode: userData.companyCode } : {})
    };

    // Update locally first
    setCheckIns(prev => {
      const updated = [...prev.filter(ci => ci.id !== newRecord.id), newRecord];
      saveLocalCheckIns(updated);
      return updated;
    });

    if (authUser && !isLocalGuest) {
      try {
        await setDoc(doc(db, 'checkIns', newRecord.id), newRecord);
      } catch (error) {
        console.error("Error saving check-out to Firestore", error);
      }
    }

    alert(t.msg_checkout_ok.replace('{name}', item.locationName));
    setLoading(false);
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeTrip) {
        alert(language === 'ja' ? '解析する出張が選択されていません。' : '분석할 출장이 선택되지 않았습니다.');
        return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const result = await analyzeReceiptImage(base64String);
          
          const newExpense: Expense = {
            id: Date.now().toString(),
            userId: authUser?.uid || 'anonymous',
            tripId: activeTrip.id,
            date: result.date || new Date().toISOString().split('T')[0],
            merchant: result.merchant || 'Unknown',
            amount: result.amount || 0,
            category: result.category || 'Other',
            imageUrl: URL.createObjectURL(file), // temporary preview
            createdAt: new Date().toISOString(),
            ...(userData?.companyCode ? { companyCode: userData.companyCode } : {})
          };
          
          // Update locally first
          setExpenses(prev => {
            const updated = [...prev.filter(e => e.id !== newExpense.id), newExpense];
            saveLocalExpenses(updated);
            return updated;
          });

          if (authUser && !isLocalGuest) {
            try {
              await setDoc(doc(db, 'expenses', newExpense.id), newExpense);
            } catch (dbError) {
              console.error("Error saving expense to Firestore", dbError);
            }
          }

          setView(ViewState.TRIP_DETAIL); // Go back to list
        } catch (apiError) {
          console.error(apiError);
          alert(t.msg_receipt_fail);
        } finally {
            setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setLoading(false);
      alert(t.msg_img_fail);
    }
  };

  const handleSendReport = async () => {
    if (!recipientEmail) {
        alert(t.error_email_required);
        return;
    }
    
    setLoading(true);
    setIsSending(true);
    setTimeout(() => {
        setLoading(false);
        setIsSending(false);
        setNotification({
            message: t.msg_email_sent.replace('{email}', recipientEmail),
            type: 'success'
        });
        setView(ViewState.HOME);
        setRecipientEmail('');
    }, 1200);
  };

  const handleExportToWord = async () => {
    if (!generatedReport) {
      alert(language === 'ja' ? '出力するレポートがありません。' : '내보낼 리포트 내용이 없습니다.');
      return;
    }

    setLoading(true);

    // Auto-save the report locally and to Firestore before exporting
    if (activeTrip) {
      const updatedTrip = { ...activeTrip, report: generatedReport };
      setActiveTrip(updatedTrip);
      setUpcomingTrips(prev => prev.map(t => t.id === activeTrip.id ? updatedTrip : t));
      const newAllTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
      setAllTrips(newAllTrips);
      saveLocalTrips(newAllTrips);

      if (authUser && !isLocalGuest) {
        try {
          await updateDoc(doc(db, 'trips', activeTrip.id), { report: generatedReport });
        } catch (e) {
          console.error("Error saving report in export:", e);
        }
      }
    }

    const titleText = activeTrip ? activeTrip.title : (language === 'ja' ? '出張報告書' : '출장보고서');
    const reportHtmlContent = renderMarkdown(generatedReport);

    const docHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>\${titleText}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: A4;
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: .5in;
            mso-footer-margin: .5in;
          }
          body {
            font-family: 'Segoe UI', 'Malgun Gothic', 'Meiryo', 'Apple SD Gothic Neo', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            font-size: 11pt;
          }
          h1, h2, h3, h4 {
            color: #1a365d;
            font-weight: bold;
            margin-top: 18pt;
            margin-bottom: 8pt;
            font-family: 'Segoe UI', 'Malgun Gothic', 'Meiryo', sans-serif;
          }
          h1 { font-size: 20pt; border-bottom: 2px solid #2b6cb0; padding-bottom: 5pt; }
          h2 { font-size: 16pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4pt; }
          h3 { font-size: 13pt; border-bottom: 1px dashed #e2e8f0; padding-bottom: 3pt; color: #2b6cb0; }
          p { margin-top: 0; margin-bottom: 8pt; text-align: justify; }
          ul, ol { margin-top: 0; margin-bottom: 10pt; padding-left: 20pt; }
          li { margin-bottom: 4pt; color: #4a5568; }
          strong { font-weight: bold; color: #000000; }
          .footer { margin-top: 40pt; font-size: 9pt; color: #718096; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10pt; }
        </style>
      </head>
      <body>
        <div style="max-width: 650px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30pt;">
            <p style="font-size: 10pt; text-transform: uppercase; letter-spacing: 2px; color: #718096; margin-bottom: 5pt;">
              \${language === 'ja' ? 'スマート出張報告書' : '스마트 출장 보고 시스템'}
            </p>
            <h1 style="border: none; margin-top: 0; font-size: 24pt; color: #1a365d;">\${titleText}</h1>
            <p style="font-size: 10pt; color: #a0aec0; margin-top: 5pt;">
              \${new Date().toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <hr style="border: 0; height: 1px; background: #e2e8f0; margin-bottom: 20pt;" />

          <div>
            \${reportHtmlContent}
          </div>

          <div class="footer">
            <p>© \${new Date().getFullYear()} Smart Business Trip Manager (1B) - Confidential Report</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = titleText.replace(/[\s\x00-\x1f\\?*:"'<>|]/g, '_');
    link.download = `${cleanTitle}_report.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setLoading(false);
    setNotification({
      message: language === 'ja' 
        ? 'レポートが保存、Wordファイルとして出力されました！' 
        : '일보 파일이 성공적으로 저장 및 Word로 내보내기 되었습니다!',
      type: 'success'
    });
    
    // Go back to Home Dashboard immediately
    setView(ViewState.HOME);
  };

  const handleGenerateReport = async (promptOverride?: string) => {
    if (!activeTrip) {
      alert(language === 'ja' ? 'レポートを作成する出張が選択されていません。' : '보고서를 생성할 출장이 선택되지 않았습니다.');
      return;
    }

    // If we already have a report, and no custom override was provided, just load it
    if (activeTrip.report && !promptOverride) {
      setGeneratedReport(activeTrip.report);
      return;
    }

    setLoading(true);
    try {
      const tripCheckIns = checkIns.filter(ci => ci.tripId === activeTrip.id);
      const tripExpenses = expenses.filter(e => e.tripId === activeTrip.id);

      const report = await generateTripReport(
        tripCheckIns,
        tripExpenses,
        language,
        activeTrip.itinerary || [],
        typeof promptOverride === 'string' ? promptOverride : undefined
      );

      setGeneratedReport(report);
      
      // Update the report locally
      const updatedTrip = { ...activeTrip, report };
      setActiveTrip(updatedTrip);
      setUpcomingTrips(prev => prev.map(t => t.id === activeTrip.id ? updatedTrip : t));
      const newAllTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
      setAllTrips(newAllTrips);
      saveLocalTrips(newAllTrips);
      setReportPrompt('');

      if (authUser && !isLocalGuest) {
        try {
          await updateDoc(doc(db, 'trips', activeTrip.id), { report });
        } catch (dbError) {
          console.error("Failed to save report to Firestore:", dbError);
        }
      }
    } catch (e) {
      console.error("Error in handleGenerateReport:", e);
      setNotification({
        message: language === 'ja' ? 'レポート生成中にエラーが発生しました。' : '보고서 생성 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAiScheduleAction = async () => {
    if (!activeTrip) {
      alert(language === 'ja' ? '調整する出張が選択されていません。' : '조정할 출장이 선택되지 않았습니다.');
      return;
    }
    if (!reportPrompt.trim()) {
      alert(language === 'ja' ? '指示を入力してください。' : '요청사항을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const updatedItinerary = await adjustTripItinerary(
        activeTrip.itinerary || [],
        reportPrompt,
        activeTrip.startDate,
        activeTrip.endDate,
        language
      );

      const updatedTrip = { ...activeTrip, itinerary: updatedItinerary };
      
      // Update locally
      setActiveTrip(updatedTrip);
      setUpcomingTrips(prev => prev.map(t => t.id === activeTrip.id ? updatedTrip : t));
      const newAllTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
      setAllTrips(newAllTrips);
      saveLocalTrips(newAllTrips);
      setReportPrompt('');

      if (authUser && !isLocalGuest) {
        try {
          await updateDoc(doc(db, 'trips', activeTrip.id), { itinerary: updatedItinerary });
        } catch (dbError) {
          console.error("Failed to update Firestore itinerary:", dbError);
        }
      }
      
      setNotification({
        message: language === 'ja' ? 'スケジュールが自動調整されました。' : '일정이 자동으로 조정 및 추가되었습니다.',
        type: 'success'
      });
    } catch (e) {
      console.error("Error in handleAiScheduleAction:", e);
      setNotification({
        message: language === 'ja' ? 'スケジュール調整中にエラーが発生しました。' : '일정을 조정하는 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (): Promise<boolean> => {
    if (!activeTrip) return false;

    // Always update locally
    const updatedTrip = { ...activeTrip, report: generatedReport };
    setActiveTrip(updatedTrip);
    setUpcomingTrips(prev => prev.map(t => t.id === activeTrip.id ? updatedTrip : t));
    const newAllTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
    setAllTrips(newAllTrips);
    saveLocalTrips(newAllTrips);

    if (!authUser || isLocalGuest) return true;

    try {
      await updateDoc(doc(db, 'trips', activeTrip.id), { report: generatedReport });
      return true;
    } catch (e) {
      console.error("Error saving report:", e);
      return true; // Still return true as it's saved locally
    }
  };

  const handleSaveAndBack = async () => {
    if (activeTrip && generatedReport) {
      setLoading(true);
      const isSaved = await handleSaveReport();
      setLoading(false);
      if (isSaved) {
        setNotification({
          message: language === 'ja' ? 'レポートが保存されました。' : '일보가 성공적으로 저장되었습니다.',
          type: 'success'
        });
      }
    }
    setView(ViewState.HOME);
  };

  const navigateToCreateTrip = (sourceView: ViewState) => {
    setTripCreationSource(sourceView);
    setView(ViewState.CREATE_TRIP);
  };

  const handleSaveTrip = async () => {
    if (!newTripData.title || !newTripData.destination || !newTripData.startDate || !newTripData.endDate) {
      alert(t.msg_fill_all);
      return;
    }

    // Auto-create a default itinerary item
    const defaultItineraryItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      title: newTripData.title,
      locationName: newTripData.destination,
      address: newTripData.destination,
      coords: { latitude: 35.6812, longitude: 139.7671 }, // Default placeholder coordinates (Tokyo)
      scheduledTime: '09:00'
    };

    const newTrip: Trip = {
      id: `TRIP-${Date.now()}`,
      userId: authUser?.uid || 'anonymous',
      title: newTripData.title,
      destination: newTripData.destination,
      startDate: newTripData.startDate,
      endDate: newTripData.endDate,
      status: 'upcoming',
      purpose: newTripData.purpose,
      itinerary: [defaultItineraryItem],
      createdAt: new Date().toISOString(),
      ...(userData?.companyCode ? { companyCode: userData.companyCode } : {})
    };

    if (!authUser || isLocalGuest) {
      // Guest fallback to keep application usable
      const updatedTrips = [...allTrips, newTrip];
      setUpcomingTrips(updatedTrips.filter(t => t.status === 'upcoming'));
      setAllTrips(updatedTrips);
      setActiveTrip(newTrip);
      saveLocalTrips(updatedTrips);
      setNewTripData({ title: '', destination: '', startDate: '', endDate: '', purpose: '' });
      setView(tripCreationSource || ViewState.HOME);
      setNotification({ message: t.msg_trip_created, type: 'success' });
      return;
    }

    try {
      await setDoc(doc(db, 'trips', newTrip.id), newTrip);
      setNewTripData({ title: '', destination: '', startDate: '', endDate: '', purpose: '' });
      setActiveTrip(newTrip);
      setView(tripCreationSource || ViewState.HOME);
      setNotification({ message: t.msg_trip_created, type: 'success' });
    } catch (error) {
      console.error("Error saving trip", error);
      setNotification({ message: 'Failed to save trip', type: 'error' });
    }
  };

  const handleUpcomingTripClick = (trip: Trip) => {
    setActiveTrip(trip);
    setDurationFilter('all');
    setCustomFilterStart('');
    setCustomFilterEnd('');
    setView(ViewState.TRIP_DETAIL);
  };

  const handleDeleteTrip = (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setConfirmModal({
      message: t.confirm_delete_trip,
      onConfirm: async () => {
        try {
          setLoading(true);

          // Always update local states first so it updates instantly in the UI
          const newAllTrips = allTrips.filter(t => t.id !== tripId);
          setUpcomingTrips(newAllTrips.filter(t => t.status === 'upcoming'));
          setAllTrips(newAllTrips);

          const newCheckIns = checkIns.filter(ci => ci.tripId !== tripId);
          setCheckIns(newCheckIns);

          const newExpenses = expenses.filter(ex => ex.tripId !== tripId);
          setExpenses(newExpenses);

          if (isLocalGuest && authUser) {
            localStorage.setItem(`local_trips_${authUser.uid}`, JSON.stringify(newAllTrips));
            localStorage.setItem(`local_checkins_${authUser.uid}`, JSON.stringify(newCheckIns));
            localStorage.setItem(`local_expenses_${authUser.uid}`, JSON.stringify(newExpenses));
          }

          if (authUser && !isLocalGuest) {
            try {
              // Cascadingly delete all check-ins associated with this trip
              const checkInsQuery = query(collection(db, 'checkIns'), where('tripId', '==', tripId));
              const checkInsSnap = await getDocs(checkInsQuery);
              for (const docSnap of checkInsSnap.docs) {
                await deleteDoc(doc(db, 'checkIns', docSnap.id));
              }

              // Cascadingly delete all expenses associated with this trip
              const expensesQuery = query(collection(db, 'expenses'), where('tripId', '==', tripId));
              const expensesSnap = await getDocs(expensesQuery);
              for (const docSnap of expensesSnap.docs) {
                await deleteDoc(doc(db, 'expenses', docSnap.id));
              }

              // Delete the trip itself
              await deleteDoc(doc(db, 'trips', tripId));
            } catch (dbError) {
              console.error("Failed to delete trip on Firestore, deleted locally:", dbError);
            }
          }
          
          setNotification({ message: t.msg_trip_deleted, type: 'success' });
          
          // If the deleted trip was the active one, clear active state and reset view
          if (activeTrip?.id === tripId) {
              setActiveTrip(null);
              setView(ViewState.HOME);
          }
        } catch (error) {
          console.error("Error deleting trip", error);
          setNotification({ message: 'Failed to delete trip: ' + (error instanceof Error ? error.message : String(error)), type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // -- Edit Itinerary Handlers --
  const handleEditClick = (item: ItineraryItem) => {
    setEditingItemId(item.id);
    setEditItemData(item);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditItemData({});
  };

  const handleSaveEdit = async () => {
    if (!activeTrip || !editingItemId) return;

    const updatedItinerary = activeTrip.itinerary.map(item => {
      if (item.id === editingItemId) {
        return { ...item, ...editItemData };
      }
      return item;
    });

    const updatedTrip = { ...activeTrip, itinerary: updatedItinerary };
    
    // Always update locally first
    setActiveTrip(updatedTrip);
    setUpcomingTrips(prev => prev.map(t => t.id === activeTrip.id ? updatedTrip : t));
    const newAllTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
    setAllTrips(newAllTrips);
    saveLocalTrips(newAllTrips);
    setEditingItemId(null);
    setEditItemData({});

    if (authUser && !isLocalGuest) {
      try {
        await updateDoc(doc(db, 'trips', activeTrip.id), { itinerary: updatedItinerary });
      } catch (error) {
        console.error("Error updating itinerary in Firestore", error);
      }
    }
  };

  const handleDeleteItineraryItem = (itemId: string) => {
    if (!activeTrip) return;
    
    setConfirmModal({
      message: t.confirm_delete_itinerary,
      onConfirm: async () => {
        const updatedItinerary = activeTrip.itinerary.filter(item => item.id !== itemId);
        const updatedTrip = { ...activeTrip, itinerary: updatedItinerary };
        
        // Always update locally first for responsiveness and Guest mode compatibility
        setActiveTrip(updatedTrip);
        setUpcomingTrips(prev => prev.map(t => t.id === activeTrip.id ? updatedTrip : t));
        const newAllTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
        setAllTrips(newAllTrips);
        saveLocalTrips(newAllTrips);
        setNotification({ message: t.msg_itinerary_deleted, type: 'success' });

        if (authUser && !isLocalGuest) {
          try {
            setLoading(true);
            await updateDoc(doc(db, 'trips', activeTrip.id), { itinerary: updatedItinerary });
          } catch (error) {
            console.error("Error deleting itinerary item in Firestore", error);
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  // --- Rendering Helpers ---

  // Simple Markdown Parser (Headers, Bold, Lists)
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        // Sanitize & basic formatting
        let cleanLine = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        // Bold formatting
        cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');

        if (cleanLine.trim().startsWith('## ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3 class="text-lg font-bold text-indigo-700 mt-6 mb-3 border-b border-indigo-50 pb-2">${cleanLine.replace('## ', '')}</h3>`;
        } else if (cleanLine.trim().startsWith('- ')) {
            if (!inList) { html += '<ul class="list-disc pl-5 space-y-2 mb-4">'; inList = true; }
            html += `<li class="text-gray-700 leading-relaxed pl-1">${cleanLine.replace('- ', '')}</li>`;
        } else if (cleanLine.trim() === '') {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<div class="h-3"></div>';
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            // Only add p tag if it's not a header line
            if (!cleanLine.startsWith('#')) {
                html += `<p class="mb-2 text-gray-600 leading-relaxed">${cleanLine}</p>`;
            }
        }
    });
    if (inList) html += '</ul>';
    return html;
  };

  // Wake Word State
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const continuousRecRef = useRef<any>(null);
  
  const isWakeWordEnabledRef = useRef(isWakeWordEnabled);
  useEffect(() => { isWakeWordEnabledRef.current = isWakeWordEnabled; }, [isWakeWordEnabled]);
  
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);

  // --- AI Chat Logic ---
  const aiRequestIdRef = useRef<number | null>(null);

  const handleCancelAiProcessing = () => {
    aiRequestIdRef.current = null;
    setIsAiProcessing(false);
    setNotification({
      message: language === 'ja' ? 'AI生成が中止されました。' : 'AI 생성이 중단되었습니다.',
      type: 'success'
    });
  };

  const handleAiChatSubmit = async (overrideText?: string) => {
    const textToSubmit = typeof overrideText === 'string' ? overrideText : aiChatInput;
    if (!textToSubmit.trim()) return;
    
    const currentRequestId = Date.now();
    aiRequestIdRef.current = currentRequestId;
    setIsAiProcessing(true);
    setIsListening(false);
    try {
      const generatedTripData = await generateTripFromChat(textToSubmit, language);
      
      if (aiRequestIdRef.current !== currentRequestId) {
        console.log("User cancelled AI generation.");
        return;
      }
      
      const newTrip: Trip = {
        id: Date.now().toString(),
        userId: authUser?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        title: generatedTripData.title || 'New Trip',
        status: 'upcoming',
        startDate: generatedTripData.startDate || new Date().toISOString().split('T')[0],
        endDate: generatedTripData.endDate || new Date().toISOString().split('T')[0],
        destination: generatedTripData.destination || '',
        purpose: generatedTripData.purpose || '',
        itinerary: (generatedTripData.itinerary || []).map((item: any, index: number) => ({
          id: `item-${Date.now()}-${index}`,
          title: item.title || '',
          locationName: item.locationName || '',
          address: item.address || '',
          scheduledTime: item.scheduledTime || '',
          date: item.date || generatedTripData.startDate || new Date().toISOString().split('T')[0],
          coords: item.coords || { latitude: 0, longitude: 0 }
        })),
        ...(userData?.companyCode ? { companyCode: userData.companyCode } : {})
      };

      if (authUser?.uid && !isLocalGuest) {
        await setDoc(doc(db, 'trips', newTrip.id), newTrip);
      } else {
        const updatedTrips = [...allTrips, newTrip];
        setUpcomingTrips(updatedTrips.filter(t => t.status === 'upcoming'));
        setAllTrips(updatedTrips);
        saveLocalTrips(updatedTrips);
      }

      setNotification({ message: t.ai_bot_success, type: 'success' });
      setShowAIChat(false);
      setAiChatInput('');
      setView(ViewState.HOME);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setNotification({ message: t.ai_bot_error, type: 'error' });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiChatSubmitRef = useRef(handleAiChatSubmit);
  useEffect(() => { handleAiChatSubmitRef.current = handleAiChatSubmit; }, [handleAiChatSubmit]);

  // Wake Word Continuous Listener
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    continuousRecRef.current = recognition;

    let finalTranscript = '';
    let isAwake = false;

    recognition.onresult = (event: any) => {
      if (!isWakeWordEnabledRef.current) return;

      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (finalTranscript + interimTranscript).toLowerCase();
      const wakeWords = ['하이 제로보', '하이제로보', '하이 제로', '하이제로', '아이 제로보', 'hi zerobo'];
      
      let detectedWakeWord = wakeWords.find(w => currentText.includes(w));

      if (detectedWakeWord || isAwake) {
        if (!isAwake) {
          isAwake = true;
          setShowAIChat(true);
          setIsListening(true);
        }

        let command = currentText;
        if (detectedWakeWord) {
          const idx = command.lastIndexOf(detectedWakeWord);
          command = command.substring(idx + detectedWakeWord.length).trim();
        }

        setAiChatInput(command);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        if (command.trim().length > 0) {
          silenceTimerRef.current = setTimeout(() => {
            isAwake = false;
            finalTranscript = '';
            recognition.stop();
            handleAiChatSubmitRef.current(command);
          }, 2500); // Auto submit after 2.5s silence
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsWakeWordEnabled(false);
      }
    };

    recognition.onend = () => {
      if (isWakeWordEnabledRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    if (isWakeWordEnabled) {
      recognition.lang = languageRef.current === 'ja' ? 'ja-JP' : 'ko-KR';
      try {
        recognition.start();
      } catch (e) {}
    } else {
      recognition.stop();
      isAwake = false;
      finalTranscript = '';
    }

    return () => {
      recognition.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isWakeWordEnabled]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ja' ? 'ja-JP' : 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiChatInput(prev => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- Expense Chart Helper ---
  const renderExpenseChart = () => {
    if (expenses.length === 0) return null;

    // Aggregate expenses by category
    const categoryTotals: { [key: string]: number } = {};
    let totalAmount = 0;

    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
      totalAmount += exp.amount;
    });

    const data = Object.keys(categoryTotals).map((cat, index) => ({
      label: cat,
      value: categoryTotals[cat],
      color: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5], // Indigo, Emerald, Amber, Pink, Violet
      percentage: Math.round((categoryTotals[cat] / totalAmount) * 100)
    })).sort((a, b) => b.value - a.value);

    // Pie Chart SVG Logic
    let cumulativePercent = 0;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mt-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-between">
           <span>{t.chart_title}</span>
           <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">{t.chart_total}: ¥{totalAmount.toLocaleString()}</span>
        </h3>
        
        <div className="flex items-center justify-between">
           {/* Chart */}
           <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
                {data.map((slice, i) => {
                  if (slice.value === 0) return null;
                  const startPercent = cumulativePercent;
                  const slicePercent = slice.value / totalAmount;
                  const endPercent = cumulativePercent + slicePercent;
                  cumulativePercent = endPercent;

                  // Handle single slice 100% case
                  if (slicePercent >= 0.999) {
                    return <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />;
                  }

                  const x1 = Math.cos(2 * Math.PI * startPercent);
                  const y1 = Math.sin(2 * Math.PI * startPercent);
                  const x2 = Math.cos(2 * Math.PI * endPercent);
                  const y2 = Math.sin(2 * Math.PI * endPercent);

                  const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

                  const pathData = [
                    `M 0 0`,
                    `L ${x1} ${y1}`,
                    `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');

                  return <path key={i} d={pathData} fill={slice.color} />;
                })}
              </svg>
              {/* Donut hole */}
              <div className="absolute inset-0 m-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
                 <IconReceipt className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
           </div>

           {/* Legend */}
           <div className="flex-1 ml-6 space-y-2 overflow-y-auto max-h-40">
              {data.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]">{item.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                     <span className="font-bold text-gray-800 dark:text-gray-200">¥{item.value.toLocaleString()}</span>
                     <span className="text-gray-400 dark:text-gray-500 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon1BLogo className="w-32 h-32" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{t.status_label}</p>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                {activeTrip ? t.status_active : t.status_inactive}
                {activeTrip && <span className="animate-pulse w-2 h-2 rounded-full bg-green-400"></span>}
            </h1>
          </div>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <IconBriefcase className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="mt-6 relative z-10">
          {activeTrip ? (
            <>
              <p className="text-lg font-semibold">{activeTrip.title}</p>
              <div className="flex items-center text-blue-200 text-sm mt-1 space-x-2">
                <IconMapPin className="w-4 h-4" />
                <span>{activeTrip.destination}</span>
                <span className="mx-1">•</span>
                <IconClock className="w-4 h-4" />
                <span>{activeTrip.startDate} - {activeTrip.endDate}</span>
              </div>
              {activeTrip.purpose && (
                 <p className="text-blue-200 text-xs mt-2 italic bg-blue-800/30 p-2 rounded-lg inline-block">
                   "{activeTrip.purpose}"
                 </p>
              )}
            </>
          ) : (
            <div className="py-4">
              <p className="text-blue-100 text-sm mb-3">{t.msg_create_first_trip}</p>
              <button 
                onClick={() => navigateToCreateTrip(ViewState.HOME)}
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <IconPlus className="w-4 h-4" />
                <span>{t.btn_new_trip}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => {
              setDurationFilter('all');
              setCustomFilterStart('');
              setCustomFilterEnd('');
              setView(ViewState.TRIP_DETAIL);
          }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-2 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
        >
          <div className="p-3 rounded-full relative bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <IconCalendar className="w-6 h-6" />
            {activeTrip && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-200">{t.nav_schedule}</span>
        </button>

        <button 
          onClick={() => {
              setView(ViewState.SCANNER);
              if (activeTrip) {
                  setTimeout(() => fileInputRef.current?.click(), 100);
              }
          }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-2 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
        >
          <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <IconCamera className="w-6 h-6" />
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-200">{t.btn_expense}</span>
        </button>
      </div>

       {/* Upcoming Trips Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{t.section_upcoming}</h3>
            <button 
                onClick={() => navigateToCreateTrip(ViewState.HOME)}
                className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-bold flex items-center space-x-1 active:bg-indigo-100 dark:active:bg-indigo-900/50"
            >
                <IconPlus className="w-3 h-3" />
                <span>{t.btn_new_trip}</span>
            </button>
        </div>
        
        {upcomingTrips.length === 0 ? (
             <div 
                onClick={() => navigateToCreateTrip(ViewState.HOME)}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-500 hover:text-indigo-400 dark:hover:text-indigo-400 transition-all cursor-pointer"
             >
                <IconBriefcase className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm font-medium">{t.btn_new_trip}</span>
             </div>
        ) : (
            <div className="space-y-4">
                {groupTripsByMonth(upcomingTrips).map(group => (
                    <div key={group.monthKey}>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">
                            {formatMonthHeader(group.monthKey)}
                        </h4>
                        <div className="space-y-3">
                            {group.trips.map(trip => (
                                <div 
                                  key={trip.id} 
                                  onClick={() => handleUpcomingTripClick(trip)}
                                  className={`p-4 rounded-xl shadow-sm border flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer relative group
                                    ${activeTrip?.id === trip.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500/50 ring-2 ring-indigo-100 dark:ring-indigo-500/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
                                  `}
                                >
                                     <div className="flex items-center space-x-4 w-full">
                                        <div className={`p-3 rounded-lg shrink-0 ${activeTrip?.id === trip.id ? 'bg-indigo-200 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                            <IconCalendar className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{trip.title}</h4>
                                            {trip.purpose && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">{trip.purpose}</p>
                                            )}
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                                                <span className="flex items-center truncate"><IconMapPin className="w-3 h-3 mr-0.5" /> {trip.destination}</span>
                                                <span>•</span>
                                                <span className="shrink-0">{trip.startDate}</span>
                                            </div>
                                        </div>
                                        <button 
                                          type="button"
                                          onClick={(e) => handleDeleteTrip(e, trip.id)}
                                          className="p-3 -m-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors z-20"
                                          aria-label="Delete trip"
                                        >
                                          <IconTrash className="w-4 h-4 pointer-events-none" />
                                        </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-between">
            <span>{t.history_title}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">{t.history_subtitle}</span>
        </h3>
        
        {checkIns.length === 0 && expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            {t.no_history}
          </div>
        ) : (
          <div className="space-y-4">
            {checkIns.map(ci => (
              <div key={ci.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className={`mt-1 p-1.5 rounded-full ${ci.type === 'check-out' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : (ci.verified ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400')}`}>
                   {ci.type === 'check-out' ? <IconLogOut className="w-3 h-3" /> : (ci.verified ? <IconZap className="w-3 h-3" /> : <IconMapPin className="w-3 h-3" />)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ci.locationName} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({ci.type === 'check-out' ? t.btn_checkout : 'Check-in'})</span></p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ci.timestamp).toLocaleString(language === 'ja' ? 'ja-JP' : 'ko-KR')}</p>
                    {ci.verified && ci.type === 'check-in' && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 rounded">Auto</span>}
                  </div>
                </div>
                {ci.verified && <IconCheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 ml-auto" />}
              </div>
            ))}
            {expenses.map(ex => (
              <div key={ex.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="mt-1 p-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                   <IconReceipt className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ex.merchant}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">¥{ex.amount.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ex.category} • {ex.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Expense Chart */}
      {renderExpenseChart()}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.theme_title}</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              {theme === 'light' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{theme === 'light' ? t.theme_light : t.theme_dark}</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {userData?.role === 'employee' && !userData.companyCode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 shadow-sm mt-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
              <IconBriefcase className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">{t.company_code_title}</h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">{t.company_code_desc}</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={companyCodeInput}
                  onChange={(e) => setCompanyCodeInput(e.target.value)}
                  placeholder="e.g. ABCDEF"
                  className="flex-1 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={handleJoinCompany}
                  disabled={!companyCodeInput.trim() || loading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  {t.btn_join_company}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userData?.role === 'admin' && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Tools</h2>
          <button
            onClick={() => setView(ViewState.ADMIN_DASHBOARD)}
            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <IconFileText className="w-5 h-5" />
            Admin Dashboard
          </button>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">데이터베이스 유지 관리</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              파이어베이스에 생성 및 누적된 2026년 12월 출장 계획, 체크인 기록, 영수증 정산 데이터(M, N, O 전체)를 깨끗하게 비웁니다.
            </p>
            <button
              onClick={() => cleanDecemberRecords(true)}
              disabled={loading}
              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              {loading ? '데이터 정리 중...' : '2026년 12월 데이터 강제 정리'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 p-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h2>
        <button onClick={() => setView(ViewState.SETTINGS)} className="text-indigo-600 dark:text-indigo-400 font-bold">Back</button>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">{t.admin_company_code}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">Share this code with your employees.</p>
        </div>
        <div className="text-xl font-black tracking-widest text-indigo-700 dark:text-indigo-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
          {userData?.companyCode || 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Trips</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{adminTrips.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{adminExpenses.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">All Trips</h3>
        {adminTrips.map(trip => (
          <div key={trip.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{trip.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{trip.destination}</p>
                <p className="text-xs text-gray-400 mt-1">User: {companyUsers[trip.userId]?.name || trip.userId}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                {trip.status}
              </span>
            </div>
          </div>
        ))}
        {adminTrips.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No trips found.</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Check-ins & Check-outs</h3>
        {adminCheckIns.slice(0, 20).map(checkIn => (
          <div key={checkIn.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{checkIn.locationName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(checkIn.timestamp).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">User: {companyUsers[checkIn.userId]?.name || checkIn.userId}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${checkIn.type === 'check-in' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                {checkIn.type === 'check-in' ? 'Check-in' : 'Check-out'}
              </span>
            </div>
          </div>
        ))}
        {adminCheckIns.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity found.</p>
        )}
      </div>
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className={`min-h-screen font-sans flex items-center justify-center p-4 transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center space-y-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
              <Icon1BLogo className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">O1BO</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Business Trip Management</p>
          </div>
          
          <div className="space-y-5 text-left">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {isLoggingIn ? '로그인 처리 중...' : 'Google 계정으로 로그인'}
            </button>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl text-left text-xs border border-amber-100 dark:border-amber-900/40 space-y-1.5 shadow-sm leading-relaxed">
              <p className="font-bold flex items-center gap-1">
                <span>⚠️</span>
                <span>알림 (미리보기 환경 안내)</span>
              </p>
              <p>AI Studio 개발 환경(iframe 내)에서는 브라우저 보안 규정상 구글 로그인 창이 차단되거나 통신 지연으로 인해 팝업이 닫힐 수 있습니다.</p>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                로그인 중 오류가 발생할 경우, 화면 오른쪽 최상단에 있는 ↗️ [새 탭에서 열기] 버튼을 통해 접속하시면 로그인 및 모든 기능이 원활하게 작동합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Navbar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-colors duration-200">
            <h1 className="text-xl font-black tracking-tight text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
            <Icon1BLogo className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>O1BO</span>
            </h1>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={toggleLanguage}
                    className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {language === 'ja' ? '🇯🇵 日本語' : '🇰🇷 한국어'}
                </button>
            </div>
        </div>

        <main className="p-4 max-w-md mx-auto">
            {notification && (
                <Toast 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}

            {view === ViewState.HOME && renderHome()}

            {view === ViewState.CREATE_TRIP && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setView(tripCreationSource || ViewState.HOME)} 
                            className="text-sm text-gray-500 dark:text-gray-400 flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-transparent border-none p-0 inline-flex"
                        >
                            <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
                        </button>
                        <h2 className="text-lg font-bold dark:text-gray-100">{t.title_create_trip}</h2>
                        <div className="w-8"></div>
                    </div>
                    {/* Form for Create Trip */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_trip_title}</label>
                            <input 
                                type="text" 
                                value={newTripData.title}
                                onChange={(e) => setNewTripData({...newTripData, title: e.target.value})}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none"
                                placeholder="e.g. Tokyo Business Trip"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_destination}</label>
                            <input 
                                type="text" 
                                value={newTripData.destination}
                                onChange={(e) => setNewTripData({...newTripData, destination: e.target.value})}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none"
                                placeholder="e.g. Tokyo, Japan"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_start_date}</label>
                                <input 
                                    type="date" 
                                    value={newTripData.startDate}
                                    onChange={(e) => setNewTripData({...newTripData, startDate: e.target.value})}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_end_date}</label>
                                <input 
                                    type="date" 
                                    value={newTripData.endDate}
                                    onChange={(e) => setNewTripData({...newTripData, endDate: e.target.value})}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_trip_purpose}</label>
                            <textarea 
                                value={newTripData.purpose}
                                onChange={(e) => setNewTripData({...newTripData, purpose: e.target.value})}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none"
                                placeholder="..."
                            />
                        </div>
                        <button 
                            onClick={handleSaveTrip}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 transition-transform"
                        >
                            {t.btn_save_trip}
                        </button>
                    </div>
                </div>
            )}

            {view === ViewState.TRIP_DETAIL && (
                !activeTrip ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh] space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                            <IconCalendar className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {language === 'ja' ? '出張スケジュールの選択' : '출장 일정 선택'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                            {language === 'ja' 
                                ? '登録された出張計画がありません。まず、新しい出張計画を登録するか、出張を選択してください。' 
                                : '조회할 출장 계획이 없습니다. 먼저 새로운 출장 계획을 등록하거나 아래에서 출장을 선택하세요.'}
                        </p>
                        
                        {allTrips.length > 0 ? (
                            <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto p-1">
                                {allTrips.map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => {
                                            setActiveTrip(trip);
                                            setDurationFilter('all');
                                            setCustomFilterStart('');
                                            setCustomFilterEnd('');
                                        }}
                                        className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 hover:border-indigo-400 rounded-xl flex justify-between items-center text-xs font-bold transition-all text-gray-700 dark:text-gray-200"
                                    >
                                        <div className="truncate pr-2">
                                            <p className="font-bold text-sm truncate">{trip.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate mt-0.5">{trip.startDate} - {trip.endDate}</p>
                                        </div>
                                        <IconChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        
                        <button
                            onClick={() => navigateToCreateTrip(ViewState.TRIP_DETAIL)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            <span>{t.btn_new_trip}</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 flex flex-col h-[calc(100vh-140px)]">
                    <div className="flex items-center justify-between shrink-0">
                        <button onClick={() => setView(ViewState.HOME)} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
                        </button>
                        <h2 className="text-lg font-bold dark:text-gray-100">{activeTrip.title}</h2>
                        <button 
                          onClick={(e) => handleDeleteTrip(e, activeTrip.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                          title="Delete trip"
                        >
                            <IconTrash className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex shrink-0">
                      <button 
                        onClick={() => setShowMap(false)}
                        className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-md transition-all ${!showMap ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-700 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        <IconFileText className="w-3 h-3 mr-1" />
                        {t.tab_list}
                      </button>
                      <button 
                        onClick={() => setShowMap(true)}
                        className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-md transition-all ${showMap ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-700 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        <IconMap className="w-3 h-3 mr-1" />
                        {t.tab_map}
                      </button>
                    </div>

                    {showMap ? (
                      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative bg-gray-100 dark:bg-gray-800">
                        <TripMap items={activeTrip.itinerary} t={t} theme={theme} />
                      </div>
                    ) : (
                      <div className="bg-indigo-50 dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-gray-700 flex-1 overflow-y-auto">
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-indigo-100/50 dark:border-gray-700 relative">
                              <h3 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wide">{t.trip_schedule_title}</h3>
                              
                              {/* Date Range Selector Badge */}
                              <span 
                                  onClick={() => setShowDateFilterMenu(!showDateFilterMenu)}
                                  className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-150 dark:bg-indigo-900/40 font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/60 active:scale-95 transition-all flex items-center gap-1 hover:shadow-sm border border-indigo-200/20 dark:border-indigo-800/30"
                              >
                                  <IconCalendar className="w-3 h-3" />
                                  {durationFilter === 'all' ? (
                                      `${activeTrip.startDate} ~ ${activeTrip.endDate}`
                                  ) : durationFilter === '1day' ? (
                                      language === 'ja' ? `1日 (${activeTrip.startDate})` : `하루 (${activeTrip.startDate})`
                                  ) : durationFilter === '1week' ? (
                                      language === 'ja' ? `1週間 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 6)})` : `1주 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 6)})`
                                  ) : durationFilter === '1month' ? (
                                      language === 'ja' ? `1ヶ月 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 29)})` : `한달 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 29)})`
                                  ) : (
                                      `${customFilterStart || '?'} ~ ${customFilterEnd || '?'}`
                                  )}
                              </span>

                              {/* Duration & Custom Range Filter Dropdown */}
                              {showDateFilterMenu && (
                                  <div className="absolute top-10 right-0 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-72 md:w-80 text-gray-900 dark:text-gray-100 animate-fade-in">
                                      <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                              {language === 'ja' ? '期間フィルター' : '기간 필터'}
                                          </h4>
                                          <button 
                                              onClick={() => setShowDateFilterMenu(false)}
                                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                          >
                                              <IconX className="w-4 h-4" />
                                          </button>
                                      </div>

                                      {/* Duration segment list */}
                                      <div className="grid grid-cols-5 gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                          {[
                                              { id: 'all', ko: '전체', ja: 'すべて' },
                                              { id: '1day', ko: '하루', ja: '1日' },
                                              { id: '1week', ko: '1주', ja: '1週間' },
                                              { id: '1month', ko: '한달', ja: '1ヶ月' },
                                              { id: 'custom', ko: '지정', ja: '지정' }
                                          ].map((tab) => (
                                              <button
                                                  key={tab.id}
                                                  onClick={() => {
                                                      setDurationFilter(tab.id as any);
                                                      if (tab.id !== 'custom') {
                                                          setShowDateFilterMenu(false);
                                                      }
                                                  }}
                                                  className={`text-[10px] font-bold py-1.5 px-0.5 rounded-md text-center transition-all ${
                                                      durationFilter === tab.id
                                                          ? 'bg-indigo-600 text-white shadow-sm'
                                                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                                                  }`}
                                              >
                                                  {language === 'ja' ? tab.ja : tab.ko}
                                              </button>
                                          ))}
                                      </div>

                                      {/* Custom calendar rendering */}
                                      {durationFilter === 'custom' && (
                                          <div className="space-y-4">
                                              <div className="flex items-center justify-between px-1">
                                                  <button 
                                                      type="button"
                                                      onClick={() => {
                                                          if (calendarMonth === 0) {
                                                              setCalendarMonth(11);
                                                              setCalendarYear(calendarYear - 1);
                                                          } else {
                                                              setCalendarMonth(calendarMonth - 1);
                                                          }
                                                      }}
                                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
                                                  >
                                                      <IconChevronRight className="w-4 h-4 rotate-180" />
                                                  </button>
                                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                      {language === 'ja' ? `${calendarYear}年 ${calendarMonth + 1}月` : `${calendarYear}년 ${calendarMonth + 1}월`}
                                                  </span>
                                                  <button 
                                                      type="button"
                                                      onClick={() => {
                                                          if (calendarMonth === 11) {
                                                              setCalendarMonth(0);
                                                              setCalendarYear(calendarYear + 1);
                                                          } else {
                                                              setCalendarMonth(calendarMonth + 1);
                                                          }
                                                      }}
                                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
                                                  >
                                                      <IconChevronRight className="w-4 h-4" />
                                                  </button>
                                              </div>

                                              {/* Dynamic Weekday Headers */}
                                              <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold">
                                                  {language === 'ja' 
                                                      ? ['日', '月', '火', '水', '木', '金', '土'].map(d => <span key={d}>{d}</span>)
                                                      : ['일', '월', '화', '수', '목', '금', '토'].map(d => <span key={d}>{d}</span>)
                                                  }
                                              </div>

                                              {/* Days grid of the month */}
                                              <div className="grid grid-cols-7 gap-1">
                                                  {(() => {
                                                      const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                                                      const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
                                                      
                                                      const offsetCells = Array.from({ length: firstDayIndex }).map((_, i) => (
                                                          <div key={`offset-${i}`} className="w-7 h-7 flex items-center justify-center"></div>
                                                      ));

                                                      const dayCells = Array.from({ length: totalDays }).map((_, idx) => {
                                                          const dNum = idx + 1;
                                                          const dayStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
                                                          
                                                          const isSelectedStart = customFilterStart === dayStr;
                                                          const isSelectedEnd = customFilterEnd === dayStr;
                                                          const isInRange = customFilterStart && customFilterEnd && dayStr > customFilterStart && dayStr < customFilterEnd;
                                                          const isTripDate = dayStr >= normalizeDateStr(activeTrip.startDate) && dayStr <= normalizeDateStr(activeTrip.endDate);
                                                          
                                                          const hasActivities = activeTrip.itinerary.some(item => normalizeDateStr(item.date || activeTrip.startDate) === dayStr);

                                                          let cellClass = "w-7 h-7 rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-all ";
                                                          if (isSelectedStart || isSelectedEnd) {
                                                              cellClass += "bg-indigo-600 text-white shadow-sm font-bold scale-105 z-10 rounded-full";
                                                          } else if (isInRange) {
                                                              cellClass += "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 rounded-none";
                                                          } else if (isTripDate || hasActivities) {
                                                              cellClass += "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30";
                                                          } else {
                                                              cellClass += "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50";
                                                          }

                                                          return (
                                                              <button
                                                                  key={`day-${dNum}`}
                                                                  type="button"
                                                                  onClick={() => {
                                                                      if (!customFilterStart || (customFilterStart && customFilterEnd)) {
                                                                          setCustomFilterStart(dayStr);
                                                                          setCustomFilterEnd('');
                                                                      } else {
                                                                          if (dayStr >= customFilterStart) {
                                                                              setCustomFilterEnd(dayStr);
                                                                          } else {
                                                                              setCustomFilterStart(dayStr);
                                                                              setCustomFilterEnd('');
                                                                          }
                                                                      }
                                                                  }}
                                                                  className={cellClass}
                                                                  title={dayStr}
                                                              >
                                                                  <span>{dNum}</span>
                                                                  {hasActivities && (
                                                                      <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelectedStart || isSelectedEnd ? 'bg-white' : 'bg-indigo-500'}`} />
                                                                  )}
                                                              </button>
                                                          );
                                                      });

                                                      return [...offsetCells, ...dayCells];
                                                  })()}
                                              </div>

                                              {/* Action buttons inside the modal */}
                                              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                  <button
                                                      type="button"
                                                      onClick={() => {
                                                          setCustomFilterStart('');
                                                          setCustomFilterEnd('');
                                                          setDurationFilter('all');
                                                          setShowDateFilterMenu(false);
                                                      }}
                                                      className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors"
                                                  >
                                                      {language === 'ja' ? 'リセット' : '전체 해제'}
                                                  </button>
                                                  <button
                                                      type="button"
                                                      onClick={() => {
                                                          setShowDateFilterMenu(false);
                                                      }}
                                                      className="flex-1 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                  >
                                                      {language === 'ja' ? '適用' : '적용'}
                                                  </button>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                          
                          {/* List items rendering updated with our dynamic period filters */}
                          <div className="space-y-6">
                              {(() => {
                                  // Filter the itinerary items first
                                  const filtered = (() => {
                                      if (durationFilter === 'all') return activeTrip.itinerary;
                                      
                                      let start = '';
                                      let end = '';
                                      
                                      if (durationFilter === '1day') {
                                          start = normalizeDateStr(activeTrip.startDate);
                                          end = normalizeDateStr(activeTrip.startDate);
                                      } else if (durationFilter === '1week') {
                                          start = normalizeDateStr(activeTrip.startDate);
                                          end = addDaysToDateString(normalizeDateStr(activeTrip.startDate), 6);
                                      } else if (durationFilter === '1month') {
                                          start = normalizeDateStr(activeTrip.startDate);
                                          end = addDaysToDateString(normalizeDateStr(activeTrip.startDate), 29);
                                      } else if (durationFilter === 'custom') {
                                          if (!customFilterStart) return activeTrip.itinerary;
                                          start = customFilterStart;
                                          end = customFilterEnd || customFilterStart;
                                      }
                                      
                                      return activeTrip.itinerary.filter((item) => {
                                          const itemDate = normalizeDateStr(item.date || activeTrip.startDate);
                                          return itemDate >= start && itemDate <= end;
                                      });
                                  })();

                                  if (filtered.length === 0) {
                                      return (
                                          <div className="flex flex-col items-center justify-center py-10 text-center">
                                              <div className="p-3 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full mb-3">
                                                  <IconCalendar className="w-6 h-6 animate-pulse-slow" />
                                              </div>
                                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                  {language === 'ja' ? '選択期間内にスケジュールはありません' : '선택한 기간 내에 일정이 없습니다'}
                                              </p>
                                              <button
                                                  type="button"
                                                  onClick={() => {
                                                      setDurationFilter('all');
                                                      setCustomFilterStart('');
                                                      setCustomFilterEnd('');
                                                  }}
                                                  className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                                              >
                                                  {language === 'ja' ? '全日程を表示' : '전체 일정 보기'}
                                              </button>
                                          </div>
                                      );
                                  }

                                  // Helper to group by date
                                  const grouped: Record<string, ItineraryItem[]> = {};
                                  filtered.forEach((item) => {
                                      const d = normalizeDateStr(item.date || activeTrip.startDate);
                                      if (!grouped[d]) grouped[d] = [];
                                      grouped[d].push(item);
                                  });
                                  
                                  // Sort dates chronologically
                                  const sortedDates = Object.keys(grouped).sort();
                                  
                                  const formatDateHeading = (dateStr: string) => {
                                      try {
                                          const d = new Date(dateStr);
                                          if (isNaN(d.getTime())) return dateStr;
                                          const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
                                          return d.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR', options);
                                      } catch {
                                          return dateStr;
                                      }
                                  };

                                  return sortedDates.map((dateStr) => {
                                      const items = grouped[dateStr].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
                                      
                                      return (
                                          <div key={dateStr} className="space-y-3">
                                              {/* Date Separator Header */}
                                              <div className="flex items-center space-x-2 py-1">
                                                  <div className="h-px bg-indigo-200 dark:bg-indigo-500/20 flex-1"></div>
                                                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 px-3 py-1 bg-indigo-100/50 dark:bg-indigo-900/40 rounded-lg shadow-sm border border-indigo-100/30 dark:border-indigo-900/20">
                                                      {formatDateHeading(dateStr)}
                                                  </span>
                                                  <div className="h-px bg-indigo-200 dark:bg-indigo-500/20 flex-1"></div>
                                              </div>
                                              
                                              {/* Itinerary items for this date */}
                                              <div className="space-y-4 pl-1">
                                                  {items.map((item) => {
                                                      const isCheckedIn = checkIns.some(c => c.itineraryItemId === item.id && c.type === 'check-in');
                                                      const isCheckedOut = checkIns.some(c => c.itineraryItemId === item.id && c.type === 'check-out');
                                                      const isEditing = editingItemId === item.id;
                                                      
                                                      return (
                                                          <div key={item.id} className="relative pl-6 pb-2 border-l-2 border-indigo-200 dark:border-indigo-500/30 last:pb-0 last:border-l-0">
                                                              <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900 shadow-sm animate-pulse-slow"></div>
                                                              
                                                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 relative group transition-all duration-200 hover:shadow">
                                                                  {isEditing ? (
                                                                      <div className="space-y-2">
                                                                          <div className="grid grid-cols-2 gap-2">
                                                                              <div>
                                                                                  <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{language === 'ja' ? '日付' : '날짜'}</label>
                                                                                  <input 
                                                                                      type="date" 
                                                                                      value={normalizeDateStr(editItemData.date || activeTrip.startDate || '')}
                                                                                      onChange={(e) => setEditItemData({...editItemData, date: e.target.value})}
                                                                                      className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 outline-none font-sans"
                                                                                  />
                                                                              </div>
                                                                              <div>
                                                                                  <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.label_time}</label>
                                                                                  <input 
                                                                                      type="time" 
                                                                                      value={editItemData.scheduledTime || ''} 
                                                                                      onChange={(e) => setEditItemData({...editItemData, scheduledTime: e.target.value})}
                                                                                      className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 outline-none font-sans"
                                                                                  />
                                                                              </div>
                                                                          </div>
                                                                          <div>
                                                                              <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.label_location_name}</label>
                                                                              <input 
                                                                                  type="text" 
                                                                                  value={editItemData.locationName || ''}
                                                                                  onChange={(e) => setEditItemData({...editItemData, locationName: e.target.value})}
                                                                                  className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 outline-none"
                                                                              />
                                                                          </div>
                                                                          <div>
                                                                              <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.label_address}</label>
                                                                              <input 
                                                                                  type="text" 
                                                                                  value={editItemData.address || ''}
                                                                                  onChange={(e) => setEditItemData({...editItemData, address: e.target.value})}
                                                                                  className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 outline-none"
                                                                              />
                                                                          </div>
                                                                          <div className="flex space-x-2 pt-2">
                                                                              <button onClick={handleSaveEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors">
                                                                                  <IconSave className="w-3 h-3 mr-1" /> {t.btn_save}
                                                                              </button>
                                                                              <button onClick={handleCancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors">
                                                                                  <IconX className="w-3 h-3 mr-1" /> {t.btn_cancel}
                                                                              </button>
                                                                          </div>
                                                                      </div>
                                                                  ) : (
                                                                      <>
                                                                          <div className="absolute top-2 right-2 flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                              <button 
                                                                                  onClick={() => handleEditClick(item)}
                                                                                  className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                                                              >
                                                                                  <IconEdit className="w-3.5 h-3.5" />
                                                                              </button>
                                                                              <button 
                                                                                  onClick={() => handleDeleteItineraryItem(item.id)}
                                                                                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                                                              >
                                                                                  <IconTrash className="w-3.5 h-3.5" />
                                                                              </button>
                                                                          </div>

                                                                          <div className="flex justify-between items-start mb-2 pr-12">
                                                                              <div>
                                                                                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{item.scheduledTime}</span>
                                                                                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-1">{item.locationName}</h4>
                                                                                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.address}</p>
                                                                              </div>
                                                                              {isCheckedIn && !isCheckedOut && (
                                                                                  <span className="text-green-500"><IconCheckCircle className="w-5 h-5" /></span>
                                                                              )}
                                                                          </div>
                                                                          
                                                                          <div className="flex space-x-2 mt-3">
                                                                              {!isCheckedIn ? (
                                                                                  <button 
                                                                                      onClick={() => handleManualCheckIn(item.id)}
                                                                                      className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                                                                                  >
                                                                                      {t.btn_checkin}
                                                                                  </button>
                                                                              ) : !isCheckedOut ? (
                                                                                  <button 
                                                                                      onClick={() => handleCheckOut(item.id)}
                                                                                      className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 transition-all"
                                                                                  >
                                                                                      {t.btn_checkout}
                                                                                  </button>
                                                                              ) : (
                                                                                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-center text-xs font-bold py-2 rounded-lg">
                                                                                      Completed
                                                                                  </div>
                                                                              )}
                                                                          </div>
                                                                      </>
                                                                  )}
                                                              </div>
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          </div>
                                      );
                                  });
                              })()}
                          </div>
                      </div>
                    )}
                </div>
            )
        )}

            {view === ViewState.REPORT && (
                !activeTrip ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button onClick={() => setView(ViewState.HOME)} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
                            </button>
                            <h2 className="text-lg font-bold dark:text-gray-100">{t.report_preview}</h2>
                            <div className="w-8"></div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh] space-y-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                                <IconFileText className="w-10 h-10" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {language === 'ja' ? '日報作成用の出張選択' : '일보작성용 출장 선택'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                                {language === 'ja' 
                                    ? '報告書を作成する出張計画を選択してください。' 
                                    : '보고서를 생성할 출장 계획을 선택하여 계속하세요.'}
                            </p>
                            
                            {allTrips.length > 0 ? (
                                <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto p-1 text-left">
                                    {allTrips.map(trip => (
                                        <button
                                            key={trip.id}
                                            onClick={() => {
                                                setActiveTrip(trip);
                                                handleGenerateReport();
                                            }}
                                            className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 hover:border-indigo-400 rounded-xl flex justify-between items-center text-xs font-bold transition-all text-gray-700 dark:text-gray-200"
                                        >
                                            <div className="truncate pr-2">
                                                <p className="font-bold text-sm truncate">{trip.title}</p>
                                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{trip.startDate} - {trip.endDate}</p>
                                            </div>
                                            <IconChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                            
                            <button
                                onClick={() => navigateToCreateTrip(ViewState.REPORT)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
                            >
                                <IconPlus className="w-4 h-4" />
                                <span>{t.btn_new_trip}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button onClick={handleSaveAndBack} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
                            </button>
                            <h2 className="text-lg font-bold dark:text-gray-100">{t.report_preview}</h2>
                            <div className="w-8"></div>
                        </div>

                    {/* AI Prompt & Automation Section */}
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-4 space-y-3 shadow-sm transition-all duration-200">
                        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                            <IconBot className="w-5 h-5 text-indigo-500" />
                            <span>{language === 'ja' ? 'AI 日報・スケジュール自動化' : 'AI 일보 작성 및 출장 일정 자동화'}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {language === 'ja'
                              ? '指示を入力して、日報にカスタム内容를 반영하거나, 旅行スケジュールを自動的に調整/作成することができます。'
                              : '원하시는 요청사항이나 세부 내용을 입력하여 일보를 맞춤형으로 작성하거나, 출장 일정을 자동으로 조정/추가하실 수 있습니다.'}
                        </p>
                        
                        <div className="relative">
                            <textarea
                                value={reportPrompt}
                                onChange={(e) => setReportPrompt(e.target.value)}
                                placeholder={language === 'ja'
                                  ? '例: "今日の取引先ミーティングで追加契約案を議論した内容を強調して日報を作成し、明日の午後3時にB社訪問日程を追加して。"'
                                  : '예: "오늘 미팅에서 추가 계약 안건을 심도 있게 논의함 등의 내용을 반영해서 일보를 재생성해주고, 내일 오후 3시에는 B사 방문 일정을 새로 등록해줘."'}
                                className="w-full text-xs text-gray-800 dark:text-gray-100 p-3 pb-9 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 resize-none h-20 leading-relaxed"
                            />
                            <button
                                onClick={async () => {
                                    const windowRef = window as any;
                                    const SpeechRecognition = windowRef.SpeechRecognition || windowRef.webkitSpeechRecognition;
                                    if (!SpeechRecognition) {
                                        alert(language === 'ja' ? 'お使いのブラウザは音声認識をサポートしていません。' : '음성 인식을 지원하지 않는 브라우저입니다.');
                                        return;
                                    }
                                    const rec = new SpeechRecognition();
                                    rec.lang = language === 'ja' ? 'ja-JP' : 'ko-KR';
                                    rec.onstart = () => {
                                        setNotification({
                                            message: language === 'ja' ? '音声入力受付中...' : '음성 인식 대기 중...',
                                            type: 'success'
                                        });
                                    };
                                    rec.onresult = (e: any) => {
                                        const transcript = e.results[0][0].transcript;
                                        setReportPrompt(prev => prev ? prev + " " + transcript : transcript);
                                    };
                                    rec.onerror = () => {
                                        alert(language === 'ja' ? '音声認識エラーが発生しました。' : '음성 인식 오류가 발생했습니다.');
                                    };
                                    rec.start();
                                }}
                                className="absolute right-2.5 bottom-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-full bg-gray-50 dark:bg-gray-700/50 transition-colors"
                                title="Speech to text"
                            >
                                <IconMic className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleGenerateReport(reportPrompt)}
                                disabled={loading || !reportPrompt.trim()}
                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl text-xs shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <IconFileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{language === 'ja' ? '📝 AI 日報自動作成' : '📝 AI 일보 자동 작성'}</span>
                            </button>
                            <button
                                onClick={handleAiScheduleAction}
                                disabled={loading || !reportPrompt.trim()}
                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <IconCalendar className="w-3.5 h-3.5 text-indigo-200" />
                                <span>{language === 'ja' ? '🗓️ AI 日程自動調整' : '🗓️ AI 일정 자동 조정'}</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400">{isSending ? t.report_sending : t.report_loading}</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center">
                                    <IconZap className="w-3 h-3 mr-1 text-yellow-500" />
                                    {t.report_ai_badge}
                                </span>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => setIsEditingReport(!isEditingReport)}
                                        className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 transition-colors"
                                    >
                                        {isEditingReport ? <IconCheckCircle className="w-4 h-4 text-green-500" /> : <IconEdit className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={handleGenerateReport} 
                                        className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 transition-colors"
                                        title={t.btn_regenerate}
                                    >
                                        <IconZap className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {isEditingReport ? (
                                    <textarea 
                                        className="w-full h-96 text-sm text-gray-700 dark:text-gray-300 leading-relaxed p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 bg-white dark:bg-gray-700 outline-none"
                                        value={generatedReport}
                                        onChange={(e) => setGeneratedReport(e.target.value)}
                                    />
                                ) : (
                                    <div 
                                        className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedReport) }}
                                    />
                                )}
                            </div>
                            {/* Email and Submit Section */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_email}</label>
                                    <input 
                                        type="email"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none text-sm"
                                        placeholder={t.placeholder_email}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleExportToWord}
                                        className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
                                    >
                                         <IconFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                         {language === 'ja' ? 'Wordに出力' : 'Word로 내보내기'}
                                    </button>
                                    <button 
                                        onClick={handleSendReport}
                                        className="w-full bg-indigo-900 dark:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
                                    >
                                         <IconSend className="w-4 h-4" />
                                         {t.btn_submit}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
        )}

            {view === ViewState.SCANNER && (
                !activeTrip ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh] space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                            <IconCamera className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {language === 'ja' ? '経費登録用の出張選択' : '경비 등록용 출장 선택'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                            {language === 'ja' 
                                ? '領収書をスキャンして経費を登録する出張を選択してください。' 
                                : '영수증을 스캔하여 경비를 등록할 출장 계획을 선택해 주세요.'}
                        </p>
                        
                        {allTrips.length > 0 ? (
                            <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto p-1 text-left">
                                {allTrips.map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => {
                                            setActiveTrip(trip);
                                        }}
                                        className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 hover:border-indigo-400 rounded-xl flex justify-between items-center text-xs font-bold transition-all text-gray-700 dark:text-gray-200"
                                    >
                                        <div className="truncate pr-2">
                                            <p className="font-bold text-sm truncate">{trip.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate mt-0.5">{trip.startDate} - {trip.endDate}</p>
                                        </div>
                                        <IconChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        
                        <button
                            onClick={() => navigateToCreateTrip(ViewState.SCANNER)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            <span>{t.btn_new_trip}</span>
                        </button>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/20 rounded-full flex items-center justify-center animate-pulse">
                            <IconCamera className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.scan_title}</h3>
                        <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs">{t.scan_desc}</p>
                        
                        {/* Camera Button */}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg dark:shadow-indigo-900/20 w-64 flex items-center justify-center space-x-2 transition-all active:scale-95"
                        >
                            <IconCamera className="w-5 h-5" />
                            <span>{t.btn_camera}</span>
                        </button>
    
                        {/* Gallery Button */}
                        <button 
                            onClick={() => galleryInputRef.current?.click()}
                            className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-gray-700 px-6 py-3 rounded-full font-bold shadow-sm w-64 flex items-center justify-center space-x-2 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                        >
                            <IconImage className="w-5 h-5" />
                            <span>{t.btn_upload}</span>
                        </button>
                    </div>
                )
            )}

            {view === ViewState.SETTINGS && renderSettings()}
            {view === ViewState.ADMIN_DASHBOARD && renderAdminDashboard()}

        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center z-40 safe-area-bottom transition-colors duration-200">
            <button 
                onClick={() => setView(ViewState.HOME)}
                className={`flex flex-col items-center space-y-1 ${view === ViewState.HOME ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <IconHome className="w-6 h-6" />
                <span className="text-[10px] font-bold">{t.nav_home}</span>
            </button>
            
            <button 
                onClick={() => {
                    setDurationFilter('all');
                    setCustomFilterStart('');
                    setCustomFilterEnd('');
                    setView(ViewState.TRIP_DETAIL);
                }}
                className={`flex flex-col items-center space-y-1 ${view === ViewState.TRIP_DETAIL ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <IconCalendar className="w-6 h-6" />
                <span className="text-[10px] font-bold">{t.nav_schedule}</span>
            </button>

            <div className="relative -top-6">
                <button 
                onClick={() => {
                    setView(ViewState.SCANNER);
                    if (activeTrip) {
                        setTimeout(() => fileInputRef.current?.click(), 100);
                    }
                }}
                className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 transition-transform"
                >
                <IconCamera className="w-6 h-6" />
                </button>
            </div>

            <button 
                onClick={() => {
                    if (activeTrip) {
                        handleGenerateReport();
                    }
                    setView(ViewState.REPORT);
                }}
                className={`flex flex-col items-center space-y-1 ${view === ViewState.REPORT ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <IconFileText className="w-6 h-6" />
                <span className="text-[10px] font-bold">{t.nav_report}</span>
            </button>

            <button 
                onClick={() => setView(ViewState.SETTINGS)}
                className={`flex flex-col items-center space-y-1 ${view === ViewState.SETTINGS ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <div className={`w-6 h-6 rounded-full border-2 ${view === ViewState.SETTINGS ? 'border-indigo-600 dark:border-indigo-400' : 'border-gray-300 dark:border-gray-500'}`}></div>
                <span className="text-[10px] font-bold">{t.nav_settings}</span>
            </button>
        </div>
        
        {/* Hidden File Input for Camera */}
        <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef} 
            className="hidden"
            onChange={handleReceiptUpload} 
        />
        {/* Hidden File Input for Gallery */}
         <input 
            type="file" 
            accept="image/*" 
            ref={galleryInputRef} 
            className="hidden"
            onChange={handleReceiptUpload} 
        />

        {/* Wake Word Toggle */}
        <div className="fixed bottom-40 right-4 z-40 flex flex-col items-end gap-2">
          {isWakeWordEnabled && (
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
              {t.wake_word_listening}
            </div>
          )}
          <button
            onClick={() => setIsWakeWordEnabled(!isWakeWordEnabled)}
            className={`p-3 rounded-full shadow-lg transition-colors ${isWakeWordEnabled ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}
            title={t.wake_word_enable}
          >
            <IconMic className="w-5 h-5" />
          </button>
        </div>

        {/* AI Bot FAB */}
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-24 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-300 dark:shadow-indigo-900/20 active:scale-95 transition-transform z-40"
        >
          <IconBot className="w-6 h-6" />
        </button>

        {/* AI Chat Modal */}
        {showAIChat && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <IconBot className="w-6 h-6" />
                  <h3 className="font-bold">{t.ai_bot_title}</h3>
                </div>
                <button onClick={() => setShowAIChat(false)} className="text-indigo-200 hover:text-white transition-colors">
                  <IconX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {language === 'ja' 
                      ? "出張の予定を教えてください。AIが自動でスケジュールを作成します。" 
                      : "출장 일정을 알려주세요. AI가 자동으로 스케줄을 작성해 드립니다."}
                  </p>
                </div>
                {isAiProcessing && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    <span className="ml-3 text-indigo-600 dark:text-indigo-400 font-medium">{t.ai_bot_processing}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl relative">
                    <textarea
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder={isListening ? t.ai_bot_listening : t.ai_bot_placeholder}
                      className="w-full bg-transparent p-3 pr-10 outline-none resize-none h-20 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      disabled={isAiProcessing}
                    />
                    <button 
                      onClick={startListening}
                      disabled={isAiProcessing || isListening}
                      className={`absolute right-2 bottom-2 p-2 rounded-full ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                      <IconMic className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={isAiProcessing ? handleCancelAiProcessing : handleAiChatSubmit}
                    disabled={!aiChatInput.trim() && !isAiProcessing}
                    className={`${
                      isAiProcessing 
                        ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                        : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    } text-white p-3 rounded-xl active:scale-95 transition-all h-[80px] w-14 flex items-center justify-center shadow-md`}
                  >
                    {isAiProcessing ? (
                      <IconStop className="w-6 h-6 animate-pulse" />
                    ) : (
                      <IconSend className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirm Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-700 shadow-xl transform scale-100 transition-all">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 animate-pulse">
                  <IconTrash className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {language === 'ja' ? '確認' : '확인'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {confirmModal.message}
                  </p>
                </div>
                <div className="flex w-full gap-3 pt-2">
                  <button
                    onClick={() => {
                      setConfirmModal(null);
                      setLoading(false);
                    }}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    {t.btn_cancel}
                  </button>
                  <button
                    onClick={async () => {
                      const action = confirmModal.onConfirm;
                      setConfirmModal(null);
                      try {
                        await action();
                      } catch (err) {
                        console.error("Deletion error:", err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all text-center"
                  >
                    {language === 'ja' ? '削除' : '삭제'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default App;