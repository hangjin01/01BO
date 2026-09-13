# 📱 O1BO (Zero-One Business Officer) - 스마트 출장 관리 및 근태 확인 시스템

> **Google Gemini AI** 기반의 지능형 출장 일정 자동 생성, **GPS & NFC 2중 인증** 기반 근태 확인, 영수증 OCR 경비 정산 및 **철저한 데이터 분리 보안 메커니즘**을 갖춘 차세대 스마트 하이브리드 출장 관리 어플리케이션입니다.

---

## 📸 실제 구동 화면 (Live Device & Emulator Screenshots)

안드로이드 에뮬레이터(Pixel 8) 및 모바일 기기에서 실제 작동하는 O1BO 어플리케이션 구동 스크린샷입니다.

| 메인 출장 대시보드 | AI 일정 생성 & 계획 | 스마트 체크인 & 일정 타임라인 | 경비 정산 & 일보 생성 |
| :---: | :---: | :---: | :---: |
| ![메인 대시보드](assets/screenshots/01_dashboard_mobile.png) | ![AI 일정 생성](assets/screenshots/02_ai_itinerary_chat.png) | ![체크인 타임라인](assets/screenshots/03_smart_checkin_nfc.png) | ![경비 정산](assets/screenshots/04_expense_ocr_report.png) |

---

## 🌟 주요 기능 (Key Features)

### 1. 🏢 일반 사용자 (사원) 주요 기능
* **스마트 출장 일정 관리:** 일본(도쿄, 오사카, 후쿠오카 등) 및 국내외 출장 목적지, 일정, 목적별 타임라인을 한눈에 관리합니다.
* **GPS 기반 스마트 체크인/체크아웃:** Haversine 공식을 이용해 목적지 중심 반경 50m 이내 고정밀 위치 검증 후 현장 체크인 및 체크아웃을 기록합니다.
* **AI 출장 일정 자동 생성 (Gemini AI):** 자연어 프롬프트(예: *"도쿄 2박 3일 미팅 및 현지 점검 일정 짜줘"*) 입력 시 최적의 이동 동선과 신칸센 시간표가 포함된 완벽한 일정을 생성합니다.
* **영수증 OCR 경비 자동 정산:** 지출 영수증 사진 촬영 시 이미지 파싱 기술로 가맹점명, 금액, 결제일, 카테고리를 구조화 데이터로 자동 등록합니다.
* **자동 출장일보 생성 및 내보내기:** 체크인 기록과 경비 내역을 조합하여 마크다운 리포트를 자동 작성하고, Word 문서 저장 및 이메일 발송 기능을 제공합니다.
* **초대 코드(회사 코드) 연동:** 사장님(관리자)이 발급한 회사 코드를 입력하여 소속 회사에 즉시 참여할 수 있습니다.

### 2. 👔 관리자 (사장님/어드민) 주요 기능
* **회사 코드 (Company Code) 자동 발급:** 어드민 계정 로그인 시 고유한 영문/숫자 조합의 회사 코드가 생성됩니다.
* **실시간 근태 모니터링 대시보드:** 소속 사원들의 현장 체크인 및 체크아웃 시간, 장소 정보를 타임라인 형태 및 지도상에서 실시간 모니터링합니다.
* **팀 출장 일정 공유:** 팀 단위 출장 건에 대해 팀원 간 일정을 실시간으로 공유하고 조회할 수 있습니다.

---

## 🛡️ 데이터 보안 및 프라이버시 원칙 (Privacy-First Security)

O1BO는 **"사원의 프라이버시 보호와 관리자의 필요 근태 정보의 완벽한 데이터 분리"**를 최우선 원칙으로 설계되었습니다.

1. **철저한 데이터 접근 분리 (Data Segregation)**
   - **공유 데이터 (Admin Shared):** 오직 **체크인/체크아웃 시간 및 장소 명칭 (`checkIns`)** 데이터만 관리자 대시보드와 공유됩니다.
   - **비공개 개인 데이터 (Strictly Private):** 사원의 **세부 출장 일정 (`trips`)**, **개인 메모**, **경비 세부 내역 (`expenses`)**, **영수증 사진** 등은 DB 수준에서 철저히 소유자 본인만 접근 가능하며, 관리자라도 읽을 수 없습니다.

2. **Backend Firestore 보안 규칙 적용 (`firestore.rules`)**
   ```javascript
   // 개인 출장 데이터 - 본인 이외 접근 불가 (관리자도 읽기 불가)
   match /trips/{tripId} {
     allow read, create, update, delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
   }
   
   // 근태 체크인 데이터 - 본인 또는 해당 회사 코드의 관리자만 읽기 가능
   match /checkIns/{checkInId} {
     allow read: if isAuthenticated() && 
       (request.auth.uid == resource.data.userId || 
        (resource.data.companyCode != null && isCompanyAdmin(resource.data.companyCode)));
   }
   ```

---

## 🛠 기술 스택 (Tech Stack)

* **Core & UI:** React 19, TypeScript, Vite, Vanilla CSS & Tailwind CSS
* **Mobile Hybrid:** Capacitor 8 (`@capacitor/android`, `@capacitor/ios`, `@capacitor/geolocation`, `@capacitor/camera`)
* **AI Core:** Google GenAI SDK (`@google/genai` - Gemini 2.5 / 3.0 API)
* **Backend & Storage:** Firebase (Firestore, Auth), LocalStorage 게스트 모드 폴백 지원
* **Mapping & Icons:** Leaflet, React-Leaflet, Lucide React
* **Build Target:** Android App (`com.company.o1bo`, APK: `개발내역/01BO.apk`)

---

## 🚀 설치 및 구동 방법 (How to Run)

### 1. 사전 준비 사항 (Prerequisites)
- **Node.js**: v20.x 이상 권장
- **npm**: v10.x 이상
- **Android Studio & SDK** (안드로이드 모바일 빌드 시 필요)

### 2. 프로젝트 클론 및 의존성 설치
```bash
git clone https://github.com/hangjin01/01BO.git
cd 01BO
npm install
```

### 3. 환경 변수 설정 (`.env`)
프로젝트 루트 경로에 `.env` 파일을 생성하고 아래 정보를 입력합니다:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. 웹 로컬 개발 서버 실행 (Web Local Server)
```bash
npm run dev
# 접속 주소: http://localhost:5173
```
*Tip: 테스트 계정(로컬 게스트 모드)으로 로그인하면 Firebase 설정 없이 즉시 전체 기능을 테스트할 수 있습니다.*

### 5. 프로덕션 웹 빌드 및 프리뷰 (Production Build)
```bash
npm run build
npm run preview
```

### 6. 안드로이드 모바일 앱 빌드 및 에뮬레이터/실기기 실행 (Android App)
```bash
# Web 소스코드를 안드로이드 네이티브 프로젝트에 동기화
npx cap sync android

# 디버그 APK 빌드 (android/app/build/outputs/apk/debug/app-debug.apk 생성)
cd android
./gradlew assembleDebug

# 연결된 안드로이드 실기기 또는 에뮬레이터에 설치 및 실행
adb install -r app/build/outputs/apk/debug/app-debug.apk
# 또는 최신 빌드본 APK 직접 설치
adb install -r ../개발내역/01BO.apk
```

---

## 📂 프로젝트 구조 (Project Structure)

```
📂 01BO
├── 📂 android/                     # Capacitor 안드로이드 네이티브 프로젝트
├── 📂 assets/
│   └── 📂 screenshots/            # 실제 에뮬레이터 구동 스크린샷 (01~04)
├── 📂 components/                  # React UI 컴포넌트 모음 (Icons 등)
├── 📂 services/                    # 비즈니스 로직 및 API 연동
│   ├── 📄 geminiService.ts          # Google Gemini AI 일정/OCR 엔진
│   ├── 📄 locationService.ts        # Geolocation & Haversine 50m 거리 계산
│   └── 📄 apiService.ts             # REST API 커스텀 통신 및 로컬 폴백
├── 📂 개발내역/                     # 안드로이드 빌드 아티팩트 (01BO.apk)
├── 📄 App.tsx                       # 메인 컨트롤러 (상태 관리, 다국어, 권한 분기)
├── 📄 types.ts                      # TypeScript 데이터 모델 (User, Trip, CheckIn 등)
├── 📄 firebase.ts                   # Firebase App 초기화 설정
├── 📄 firestore.rules               # Firestore 데이터 보안 및 권한 검증 규칙
├── 📄 package.json                  # 프로젝트 의존성 및 스크립트 정의
└── 📄 README.md                     # 프로젝트 종합 문서
```

---

## 🤝 라이선스 (License)

본 프로젝트는 사내 출장 및 근태 관리를 위해 제작된 프라이빗 소프트웨어입니다.
