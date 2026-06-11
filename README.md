# O1BO - 스마트 출장 관리 및 근태 확인 시스템

O1BO는 기업의 사원들이 출장 일정을 관리하고 경비를 정산하며, 관리자(사장님)가 사원들의 현장 체크인/체크아웃 상태를 실시간으로 확인할 수 있는 스마트 출장 관리 어플리케이션입니다. AI 기술을 활용하여 일정 생성 및 영수증 처리를 자동화하고, 철저한 데이터 분리를 통해 사원의 개인 프라이버시를 강력하게 보호합니다.

---

## 📂 프로젝트 폴더 및 소스코드 구조 (Project Directory Structure)

현재 프로젝트는 최신 React, TypeScript, Vite 번들러 및 Firebase BaaS 기반으로 설계되었으며, 주요 소스코드는 역할에 따라 깔끔하게 분리되어 있습니다.

```
📂 O1BO (Root Directory)
├── 📂 components/                  # 재사용 가능한 UI 컴포넌트 폴더
│   └── 📄 Icons.tsx                # Lucide React 기반의 통합 아이콘 컴포넌트 모음
├── 📂 services/                    # 비즈니스 로직 및 외부 API 연동 서비스
│   ├── 📄 geminiService.ts          # Google Gemini AI 서비스 (일정 생성, 영수증 OCR, 일보 작성)
│   └── 📄 locationService.ts        # Geolocation 기반 GPS 서비스 (좌표 측정 및 거리 계산)
├── 📂 progress_history/             # 개발 히스토리 및 피처 기록 백업 폴더
│   ├── 📄 bugfix_delete_modal_stuck_guide.txt
│   ├── 📄 chat_features_info.txt
│   ├── 📄 feature_ai_report_system_fix.txt
│   ├── 📄 feature_ai_report_word_and_dashboard_integration.txt
│   └── 📄 feature_ai_report_word_export.txt
├── 📄 App.tsx                       # 메인 어플리케이션 컴포넌트 (UI 레이아웃, 라우팅, 상태 관리)
├── 📄 types.ts                      # 애플리케이션 공통 데이터 모델 및 타입 정의 (TypeScript)
├── 📄 firebase.ts                   # Firebase App 초기화 및 Firestore/Auth 설정
├── 📄 firestore.rules               # 백엔드 데이터 접근 권한을 규정하는 Firestore 보안 규칙
├── 📄 index.html                    # HTML 메인 템플릿
├── 📄 index.tsx                     # React 진입점 (마운팅 코드)
├── 📄 package.json                  # 프로젝트 의존성(Dependencies) 및 스크립트 정의
├── 📄 tsconfig.json                 # TypeScript 컴파일 옵션 설정
├── 📄 vite.config.ts                # Vite 빌드 도구 설정
└── 📄 print-db.js                   # Firestore DB 데이터 디버깅을 위한 보조 스크립트
```

### 🔍 주요 핵심 파일 상세 분석

* **[`App.tsx`](file:///c:/Users/User/.gemini/antigravity-ide/scratch/01BO/App.tsx) (메인 컨트롤러):**
  * 서비스의 중심축 역할을 하는 컴포넌트로, 전반적인 상태 관리(State), 다국어 리소스(`ko`/`ja`), 캘린더 날짜 필터링, 테마 변경(Light/Dark), 그리고 각 권한별 화면 분기(일반 사용자 포털 vs 어드민 대시보드) 처리를 총괄합니다.
* **[`types.ts`](file:///c:/Users/User/.gemini/antigravity-ide/scratch/01BO/types.ts) (타입 정보 정의):**
  * `User`, `Trip`, `ItineraryItem`, `CheckInRecord`, `Expense` 등 DB 스키마와 일대일 매칭되는 인터페이스를 선언하여 코드 전반의 타입 세이프티를 확보합니다.
* **[`services/geminiService.ts`](file:///c:/Users/User/.gemini/antigravity-ide/scratch/01BO/services/geminiService.ts) (Gemini AI 엔진):**
  * **일정 자연어 제어:** 챗봇에 입력된 프롬프트를 분석하여 완전한 일정 데이터 객체를 반환합니다 (`generateTripFromChat`, `adjustTripItinerary`).
  * **영수증 OCR:** 이미지 데이터를 파싱하여 가맹점명, 지출 금액, 결제일, 카테고리를 구조화된 JSON 데이터로 자동 리턴합니다 (`analyzeReceiptImage`).
  * **출장 일보 자동 생성:** 체크인 기록과 영수증 정산 내역을 종합해 풍부한 마크다운 비즈니스 리포트를 만들어 줍니다 (`generateTripReport`).
* **[`services/locationService.ts`](file:///c:/Users/User/.gemini/antigravity-ide/scratch/01BO/services/locationService.ts) (GPS/위치 계산):**
  * 브라우저의 Geolocation API를 통해 고정밀 위도/경도를 획득하고, Haversine 공식을 사용해 목적지 중심과의 거리를 분석하여 50m 이내 자동 체크인 여부를 연산합니다.
* **[`firestore.rules`](file:///c:/Users/User/.gemini/antigravity-ide/scratch/01BO/firestore.rules) (보안 계층):**
  * 클라이언트 단의 제한에만 의존하지 않고 Firestore DB 단에서 접근 권한을 최종 차단 및 검증합니다.

---

## 🌟 주요 기능 (Key Features)

### 1. 일반 사용자 (사원) 기능
* **출장 일정 관리:** 목적지, 기간, 목적 등을 입력하여 출장 일정을 생성하고 관리할 수 있습니다.
* **스마트 체크인/체크아웃:** 출장지 도착 및 출발 시 GPS 위치 정보를 기반으로 체크인과 체크아웃을 기록합니다.
* **경비 관리 및 영수증 OCR:** 지출 내역을 기록하고, 영수증 사진을 업로드하면 AI가 자동으로 금액, 날짜, 사용처 등을 분석하여 입력해 줍니다.
* **AI 출장 일정 생성:** 챗봇에게 "도쿄 2박 3일 출장 일정 짜줘"라고 입력하면 AI가 자동으로 최적의 일정을 생성해 줍니다.
* **자동 보고서 생성 및 이메일 발송:** 출장 일정, 체크인 기록, 경비 내역을 종합하여 깔끔한 마크다운 형태의 보고서를 생성하고, 지정된 이메일로 바로 발송할 수 있습니다.
* **회사 연동 (초대 코드):** 관리자가 발급한 '회사 코드'를 앱 홈 화면에서 입력하여 소속 회사에 가입할 수 있습니다.

### 2. 관리자 (사장님) 기능
* **초대 코드(회사 코드) 발급:** 관리자 계정 생성 시 고유한 6자리 영문/숫자 조합의 회사 코드가 자동 발급됩니다.
* **어드민 대시보드:** 소속 사원들의 최근 체크인 및 체크아웃 기록을 실시간 타임라인 형태로 확인할 수 있습니다.
* **근태 모니터링:** 직원이 어느 장소에서 언제 업무를 시작(체크인)하고 종료(체크아웃)했는지 파악할 수 있습니다.

### 🚀 향후 업데이트 예정: 2중 출장 인증 시스템 (NFC + 수동 체크아웃)
현재의 GPS 기반 체크아웃 시스템을 더욱 강력하게 보완하기 위해, 추후 **'수동 체크아웃 + NFC 태그 인증'**을 결합한 2중 출장 인증 시스템이 도입될 예정입니다.
* **1단계 (수동 체크아웃):** 앱 내에서 사용자가 직접 체크아웃 버튼을 눌러 1차 확인 및 시간 기록을 진행합니다.
* **2단계 (NFC 물리 인증):** 출장지(또는 지정된 업무 장소)에 비치된 NFC 태그에 스마트폰을 태그하여 실제 현장에 있음을 암호화된 데이터로 2차 인증합니다.
* **기대 효과:** GPS 위치 조작(Fake GPS 등)을 원천적으로 차단하고, 출장지 방문 및 업무 수행에 대한 확실한 물리적 증빙 자료로 활용되어 기업 근태 관리의 신뢰성을 극대화합니다.

---

## ⚙️ 시스템 작동 방식 (How it Works)

### 회사 코드 연동 시스템 (Company Code System)
1. **관리자 가입:** 사장님이 구글 계정으로 로그인하면, 시스템이 자동으로 `admin` 권한과 함께 고유한 `companyCode`를 부여합니다.
2. **코드 공유:** 사장님은 어드민 대시보드에 표시된 6자리 코드를 사원들에게 메신저 등으로 공유합니다.
3. **사원 등록:** 사원이 앱에 로그인하면 홈 화면 상단에 **'회사 코드' 입력란**이 나타납니다. 코드를 입력하고 참여하면 해당 사원의 계정 정보에 `companyCode`가 등록되어 두 계정이 논리적으로 연결됩니다.

### 데이터 흐름 (Data Flow)
* 사원이 출장지에서 **체크인/체크아웃** 버튼을 누르면, 해당 기록(`checkIns` 컬렉션)에 사원의 `companyCode`가 함께 저장됩니다.
* 관리자의 대시보드는 Firestore 데이터베이스에서 **자신의 회사 코드와 일치하는 체크인/체크아웃 기록만**을 실시간으로 불러와 화면에 렌더링합니다.

---

## 🔒 보안 및 데이터 프라이버시 (Security & Data Privacy)

본 시스템의 가장 핵심적인 설계 철학은 **"사원의 프라이버시 보호와 관리자의 필요 정보(근태)의 완벽한 분리"**입니다.

### 1. 철저한 데이터 분리 원칙 (Data Segregation)
* **공유되는 데이터:** 오직 **체크인/체크아웃 시간 및 장소(`checkIns`)** 데이터만 관리자와 공유됩니다. 이는 업무 수행 여부를 확인하기 위한 최소한의 근태 정보입니다.
* **절대 공유되지 않는 데이터:** 사원의 **출장 세부 일정(`trips`)**, **개인 메모**, **경비 지출 내역(`expenses`)**, **영수증 사진** 등은 철저한 개인 정보로 취급되어 데이터베이스 저장 단계부터 회사 코드와 연동되지 않습니다.

### 2. 강력한 Firestore 보안 규칙 (Security Rules)
프론트엔드에서의 숨김 처리가 아닌, 백엔드(Firestore) 단에서 원천적으로 접근을 차단하는 보안 규칙을 적용했습니다.

* **개인 데이터 (Trips, Expenses):**
  ```javascript
  match /trips/{tripId} {
    // 오직 문서를 생성한 본인(userId)만 읽고, 쓰고, 수정하고, 삭제할 수 있습니다.
    // 관리자(admin)라 할지라도 다른 사람의 출장이나 경비 데이터에는 절대 접근할 수 없습니다.
    allow read, create, update, delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
  }
  ```
* **근태 데이터 (Check-ins):**
  ```javascript
  match /checkIns/{checkInId} {
    // 본인이거나, 해당 기록의 회사 코드와 일치하는 관리자(isCompanyAdmin)만 읽을 수 있습니다.
    allow read: if isAuthenticated() && (request.auth.uid == resource.data.userId || (resource.data.companyCode != null && isCompanyAdmin(resource.data.companyCode)));
  }
  ```

### 3. 권한 탈취 및 변조 방지
* **역할(Role) 보호:** 사원이 임의로 자신의 권한을 `admin`으로 변경하거나, 다른 회사의 코드로 데이터를 조작할 수 없도록 데이터 쓰기(Create/Update) 시 엄격한 스키마 검증(`isValidUser`, `isValidCheckIn` 등)을 거씁니다.
* **소유권 검증:** 모든 데이터는 생성 시 현재 로그인한 사용자의 UID(`request.auth.uid`)와 일치해야만 저장이 허용됩니다.

---

## 🛠 기술 스택 (Tech Stack)

* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
* **Backend/BaaS:** Firebase (Authentication, Firestore Database)
* **AI Integration:** Google Gemini API (텍스트 기반 일정 생성, 이미지 기반 영수증 OCR)
* **Mapping:** Leaflet, React-Leaflet
* **Icons:** Lucide React
