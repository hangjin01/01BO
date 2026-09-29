> 2026-09-26: 아래 문서는 최초 프런트 계약입니다. 현재 AWS 반영 여부와 접속 방법은 [배포 결과](AWS_DEPLOYMENT.md)를 우선 확인하세요. 주요 데이터 API와 세션 코드 인증은 반영했고, 메일은 미설정 응답만 지원합니다.

# AWS 서버 연결 규격 — 2026-09-25

현재 변경 범위는 프런트엔드다. AWS/Oracle 서버 소스 수정, 배포, DB 마이그레이션은 수행하지 않았다. 아래 신규 경로는 프런트가 기대하는 계약이며, 기존 서버에 구현되어 있다고 가정하면 안 된다.

## 실행

Node.js가 정상 동작하는 환경에서 `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run dev`를 사용한다. 개발 UI는 5173, 기본 API는 3000이다. `.env.local`에 `VITE_API_BASE_URL=https://서버주소/api`를 지정한다. 변경 후 Vite를 재시작한다.

이 컴퓨터의 시스템 Node는 libnode/SQLite 심볼 오류가 있어 검증에 Codex 번들 Node를 사용했다. 번들 경로는 설치 버전에 따라 달라질 수 있다. `npm test`의 DOCX 구조 검증에는 Python 3 표준 라이브러리도 필요하다.

## 공통 규칙

- 모든 요청은 `credentials: include`로 서버 세션 쿠키를 전달한다. Google/OAuth 로그인 시작·콜백 및 세션 발급은 아직 연동하지 않았다. 로그인 버튼은 이미 발급된 서버 세션을 `/auth/me`로 확인한다.
- 쿠키, HTTPS, 허용 origin 및 credentials CORS, CSRF 보호는 서버에서 구성해야 한다.
- 사용자·회사·역할은 세션에서 도출한다. 요청의 userId/companyCode/role, verified 값을 권한 증거로 신뢰하지 않는다.
- 성공 응답은 아래 계약에 따르고, 실패는 적절한 4xx/5xx와 `{ "success": false, "message": "사용자에게 표시할 오류" }`를 반환한다. 프런트는 HTTP 200의 success:false도 실패로 처리한다.
- 요청 제한 시간은 60초다. 변경 요청 timeout 후 서버가 이미 저장했을 수 있으므로 서버 측 중복 요청 방지 정책이 필요하다.
- `/api`를 제외한 경로를 아래에 표기했다.

## 추가·변경이 필요한 API

| 경로 | 요청 | 성공 응답 |
|---|---|---|
| GET `/auth/me` | 현재 세션 | `{success:true,data:BackendUser}` |
| POST `/auth/logout` | 없음 | 204 또는 `{success:true}`; 세션 무효화 |
| PATCH `/users/me` | `{name}` | `{success:true,data:BackendUser}` |
| POST `/teams` | `{}` | 서버가 초대 코드 생성 후 `{success:true,data:BackendUser}` |
| POST `/teams/join` | `{code}` | 초대·소속 검증 후 `{success:true,data:BackendUser}` |
| POST `/companies/join` | `{code}` | 가입 정책 검증 후 `{success:true,data:BackendUser}` |
| PUT `/trips/:id` | Trip 필드 + `itineraryJson` JSON 문자열, `isSharedWithTeam` 0/1, `report` 문자열 | 실제 저장한 `{success:true,data:BackendTrip}` |
| DELETE `/trips/:id` | 없음 | 204 또는 `{success:true}` |
| POST `/trips/:id/report/email` | `{recipient,report}` | 실제 발송 성공 후 204 또는 `{success:true}` |
| POST `/ai/generate` | Gemini 형태의 contents/generationConfig | `{text:"모델의 응답 문자열"}` |

BackendUser는 `UID_VAL, EMAIL, NAME, ROLE, COMPANY_CODE, TEAM_CODE`를 사용한다. BackendTrip은 기존 Oracle 응답의 `ID, USER_ID, TITLE, STATUS, START_DATE, END_DATE, DESTINATION, ITINERARY_JSON, REPORT, COMPANY_CODE, TEAM_CODE, IS_SHARED_WITH_TEAM`을 사용한다. 프런트 변환은 `services/apiService.ts`에 있다.

`PUT /trips/:id`는 일정 수정과 보고서 저장 모두에서 사용한다. 응답에 저장된 Trip이 없으면 프런트는 성공으로 처리하지 않는다. 삭제는 연결된 근태·경비의 보존 정책과 일치하도록 서버에서 원자적으로 처리해야 한다.

AI 키와 모델 선택은 서버에만 둔다. 기존 소스에 포함되었던 키는 소스에서 제거했지만 발급처 폐기·재발급과 Git 이력/기존 배포 파일 정리는 별도 작업이다. AI 엔드포인트는 인증, 요청 크기 제한, 사용량 제한, 오류 메시지 정제를 적용해야 한다. 이미지 요청은 base64를 포함하므로 Express 기본 JSON 용량 제한을 검토한다. 프런트 파일 제한은 10MiB이다.

## 기존 API에서 확인할 사항

- `/trips`, `/check-ins`, `/expenses`, `/users` 목록은 기존 `{success:true,data:[...]}` 구조를 사용한다. 관리자 조회에 companyCode를 붙이지만, 서버가 세션 기반으로 강제 제한해야 한다.
- 체크인/체크아웃은 실제 위치를 전송한다. 서버가 일정 좌표와 거리를 재계산해야 한다. 수동/NFC 체크아웃은 프런트에서 임의로 verified:true를 만들지 않는다. 현장 태그 등록·검증과 재사용 정책은 서버 작업이다.
- 경비 POST는 확인한 JPY 금액만 저장한다. OCR 응답에 currency가 없거나 JPY가 아니면 자동 진행하지 않는다. 다른 통화 지원을 위해서는 DB 모델과 모든 집계의 통화 구분이 필요하다.
- DELETE `/expenses/:id`는 204 또는 `{success:true}`를 지원한다.
- 영수증 이미지는 확인 화면의 임시 미리보기에만 사용하며 업로드·영구 보관하지 않는다. 객체 스토리지 업로드 API는 아직 없다.
- 회사 관리자에게 개인 영수증 URL을 반환하지 않는 정책을 서버에 구현해야 한다.

## 연결 후 통합 검증

1. OAuth 로그인→세션 확인→재접속 시 동일 사용자 복원→로그아웃 후 세션 거부.
2. 출장 생성→수정→재조회, 보고서 저장→재조회, 출장 삭제→재조회.
3. 다른 회사/다른 사용자 ID를 직접 요청해도 접근 거부.
4. 범위 밖 GPS, 위치 권한 거부, 등록되지 않은 NFC 태그의 인증 거부.
5. AI/메일/DB 실패 시 성공 알림·가짜 데이터가 생기지 않는지 확인.
6. 실제 메일 수신과 Oracle 데이터 검증. 프런트 빌드 성공은 이 검증을 대체하지 않는다.
