## 2026-11-01 GitHub 소스 동기화
- 최신 AWS IP: 57.183.24.179 (사용자 제공). API 주소는 https://api.01bo.cloud/api 유지.
- 기존 server-work/backend 소스를 이 저장소 backend/에 포함. 비밀 환경설정·DB 데이터·촬영 자료는 제외.
- 시연에서 발견한 관리자 집계 및 발송 상태 복원 문제는 아직 수정 전.

## 2026-10-27 최신: v0.32 설치 및 시연 영상
- 최신 AWS IP: 18.182.40.79, HTTPS API 정상.
- 실기기 영상과 인수인계: `/home/orora/01BO/reports/demo-video-20261027/RESUME.md`
- 최종 영상: `/home/orora/01BO/reports/demo-video-20261027/01BO-v0.32-실기기-전체시연.mp4`
- Gmail 재연결 후 khyoungjin011@gmail.com 수신 및 Word 첨부 사용자 사진 확인 완료.
- 미해결: 관리자 경비·활동 집계 표시, 채팅 재오픈 시 이미 보낸 메일을 발송 전으로 표시하는 문제. 재발송 금지.
- 이하 과거 기록보다 위 최신 인수인계 우선.

## 2026-10-17 v0.32 로고 최종 시연빌드
- 새 AWS3.113.18.25 SSH/API/DB 정상, scripts 기본IP 갱신. API도메인 유지.
- 사용자 Downloads/로고.png를 public/brand/logo.png, 로그인/헤더, Android 런처·시작화면에 적용. 원본 이미지 유지, 각 해상도 아이콘 크기 변환.
- versionName0.32/versionCode7, releases/01bo-v0.32.apk. 기존과 동일 디버그서명(스토어릴리즈 아님).
- TypeScript/Vite/cap sync/assembleDebug/testDebugUnitTest 통과. APK서명/ZIP/원본로고포함 확인.
- 이번 USB기기 미연결로 휴대폰 업데이트설치 미실행. 릴리즈노트/sha256/build로그 releases에 저장.

## 2026-10-17 노진아 바이어 미팅 추가
- 사용자 요청으로 노진아(yabisinsa@naver.com) 계정에 오늘 도쿄타워10:00/도쿄역13:00/긴자15:00 출장3개 생성. 각 목적·방문 제목은 바이어 미팅. 공개 장소검색 좌표 사용. 기존 김행진3개 유지, 회사 총6개.

## 2026-10-17 사용자 요청 일정 초기화 완료
- 사용자 명시 요청으로 demo2 김행진/노진아 기존 출장7개 삭제. CHECK_INS/EXPENSES/AGENT_REPORTS/REPORT_EMAILS/NFC_TAGS/NFC_CHALLENGES 모두0 확인. 계정2개·Gmail연결2개 유지.
- 김행진 계정에 2026-10-17 전주대10:00, 집13:00, 전북대15:00 출장3개(각 방문1개) 생성. 집은 삭제 전 기존 집 일정 좌표 보존. 대학은 공개 지오코더 캠퍼스 결과.
- NFC회사ON정책 유지, 태그등록0이므로 새 일정은 태그 재등록 전 GPS방식. 기존 제로보 대화 기록/로컬캡처·Word 보관자료는 삭제 대상에 포함하지 않음.
- 기존 메일초안도 일정연계 삭제됨. 이전 메일 재발송 작업은 더 진행하지 않음. 새 시연은 새 일정 기준.

## 2026-10-17 Gmail 재연결/Word/음성 검증
- 새 Gmail 토큰 갱신 HTTP200 확인. 기존2건 unknown은 재발송하지 않음. 신규 본인 테스트1통 발송 승인 async 질문 대기.
- 실제 Android Word 다운로드/공유 성공, 기기 파일을 reports/demo-verification-20261016/word에 추출해 ZIP/XML 확인.
- 사용자 음성 '일정 보여 줘' 인식 및 실제 제로보 응답 성공. 캡처41~44.
- 추가 한국검색/등록/경비/일본어홈/사장NFC조회 캡처. 갱신ZIP reports/01BO_실기기캡처_20261017.zip.
- 남은 실기기: 승인 후 신규메일/직원 화면/카메라OCR/배경호출. 현재 사장 로그인, 제로보 모달 열림. USB R3CWA05BK9Y, WebView4748 포트9223.

## 2026-10-17 전체 실기기 캡처 재개
- 새 IP18.182.20.90, scripts 기본주소 갱신, API/DB/USB 정상.
- 앱 v0.311 설치 완료: NFC ON 주황/OFF 투명. 자료 reports/demo-verification-20261016.
- 실기기 NFC 체크인/체크아웃 모두 nfc_gps VERIFIED=1 확인, 스 출장 시연용 추가 일정. 원본 캡처24장 저장됨.
- AI 현재 위치 복사 요청 미지원, 실제 일보 작성/메일 초안 생성 성공. 메일 발송 버튼은 이전 승인 검토 사용량 초과로 실행 안 됨.
- 재개 시 메일2건 unknown, Google refresh HTTP400 invalid_grant 확인. 재발송 보류. 사용자 사장 로그인/Gmail 재연결 요청.
- 남은 작업: 발송 여부 사용자 확인, 재연결 후 승인된 메일 검증, Word/음성/직원/추가 화면 캡처 및 ZIP.

## 2026-10-16 첫 접속 DB 오류 대응
- 새 AWS35.72.246.211, HTTPS API 정상. scripts 기본 IP 갱신.
- 10/15,10/16 첫 요청 ORA-01109 확인. API가 Oracle OPEN 전에 준비 완료 로그 출력. db.js가 풀 생성만 확인하던 구조.
- db.js 수정: USERS 빈 결과 조회로 startup 준비 확인(일시적 Oracle 오류 최대30회,2초간격), 업무 전 연결 검증/불량 연결 drop(최대3회). 업무 SQL/transaction은 재실행하지 않음. 준비 실패503 안내.
- mock tests/db-readiness.js 통과: startup 대기, stale 연결 폐기, write/transaction 재실행 금지, 재시도 상한.
- AWS db.js.before-readiness-20261016 백업 후 모듈 배포, API만 재시작. DB 재시작은 수행하지 않음. 전체 서버 콜드부팅 재현은 아직 미검증.
- NFC 서버 조회: 집 일정 활성 태그2개, 회사정책 미설정(OFF). MIME문구는 태그 형식. 앱 체크인에서 스캔 시작 필요. USB 현재 미연결, 실기기 체크인 아직 미완료.

## 2026-10-15 한국 장소 검색 / 현재 위치 선택
- 한국 장소가 안 나온 원인: backend/lib/places.js countrycodes=jp 고정. kr,jp 및 한국어/일본어 응답으로 수정, AWS18.181.235.32 마운트 코드 백업 후 반영, trip-api 재시작. 실제 서울역 검색 5개 결과/한국 좌표 확인.
- PlaceSearch에 현재 위치 사용 추가. 휴대폰 GPS, 오차50m 이하일 때만 선택; 외부 지오코더로 GPS를 보내지 않음. 일정 저장 전에는 DB에 저장하지 않음. 한국/일본 검색 안내 수정.
- tsc, Vite, cap sync, Android assembleDebug 통과. releases/01bo-v0.31.apk, versionCode5. 현재 위치 새 기능으로 소규모 버전0.31.
- 실제 GPS 선택 및 NFC 스티커 테스트는 아직 미완료. 사용자 현재 장소에서 테스트 일정 필요.

## 2026-10-15 NFC 실기기 검증 준비 (진행 중)
- 최신 AWS IP18.181.235.32, SSH 호스트키 확인. API/Oracle 및 HTTPS api.01bo.cloud/api/health OK. 서버 NFC 코드 로컬과 일치, tests/nfc.js 실제 Oracle 회귀 통과, 임시 데이터 정리. 서버 코드 변경/배포 없음.
- 수정: ScheduleView NFC 체크아웃 완료 판정(서버가 한 번 저장한 체크아웃 인정). nfcVerification.ts 태그읽기→GPS→challenge→저장, 비동기 각 경계 취소 검사, 저장중 취소 금지. NFC 위치 재시도/단계 안내.
- NfcPlugin NFC상태 API, 포맷 가능한 빈 태그 지원, 쓰기불가/용량부족 안내. NfcSettings 상태 확인/서버등록 재시도.
- tsc, Vite, cap sync, tests/nfc-verification.mjs, tests/regression.mjs, :app:assembleDebug/:app:testDebugUnitTest 통과.
- APK /home/orora/01BO/releases/01bo-v0.301.apk (versionCode4,debug서명v2), SHA256 b76b93b333fa4072988510ee4cb9f65922d4aaf0b230562f7c065592f0f9bfe6.
- USB디버깅/RSA 허용 완료. ADB Samsung SM_S916N 연결, v0.301 APK 업데이트 설치 Success, NFC enabled 확인. 앱 실행 후 로그인 화면 확인. 사용자 사장 계정 로그인 대기. 실제스티커 읽기쓰기/GPS체크인아웃 아직 미검증.
- 테스트 일정은 실제 스티커 현장좌표50m이내여야 함. 기존 도쿄일정은 국내테스트 불가. 사장태그등록→회사ON→직원체크인/아웃→사장조회 순서. 아직 실제정책/기록 변경안함.

## 2026-10-15 화살표 PPT와 광고 영상 완료
- PPT: presentations/nfc-deck/output/01BO_서비스와_AWS보안_기능설명판.pptx. 기존31장 구성 유지, 주요 앱 화면에 한/일 설명과 주황색 화살표 추가. 최종 검증 통과.
- 광고: presentations/nfc-deck/video/01BO_광고_모션그래픽_30초.mp4. 30초720p24fps무음,720프레임 디코딩 확인. 실제 앱 화면과 기존NFC개념이미지,한/일 자막,확대/이동/순차강조.
- 소스 build/annotate.mjs, build/video.mjs. 시스템FFmpeg라이브러리충돌로 /tmp/01bo-video-runtime 독립FFmpeg사용. 영상 음악/내레이션 미포함.

## 2026-10-15 PPT 확대 및 AWS 보안 통합
- 사용자 요청: 화면이 작아 안 보이는 문제 수정, 제공 AWS 보안 아키텍처 DOCX 내용 추가.
- 수정본 31장: 기존 앱 캡처 중앙 확대, AWS 7장 추가. 한국어/작은 일본어 유지.
- 작성 소스 presentations/nfc-deck/build/revise.mjs. 최종화 finalize-revised.mjs.
- 출력 예정 presentations/nfc-deck/output/01BO_서비스와_AWS보안_확대개정판.pptx.
- AWS 내용은 제공 문서의 보고 상태 기준. Config 위반-정상 실험, EC2 SG 최종점검, SSM 미완료 구분. 새 AWS 감사/배포 수행 안 함.

## 2026-10-14 발표 자료 완료
- 24장 한국어/일본어 PPT: /home/orora/01BO/presentations/nfc-deck/output/01BO_NFC_서비스소개_한일발표.pptx
- 실제 김행진 사장·노진아 직원 화면 포함, 짧은 본문과 상세 발표자 노트. 비밀번호 미포함.
- NFC는 검증 로직 구현과 실제 Android/스티커 테스트 미완료를 구분. 새 이메일 발송·체크인·일정 변경 없음.
- 작성 소스: presentations/nfc-deck/build/build.mjs 및 content.mjs.

## 최신 서버 주소
- 사용자 제공 AWS IP: 43.207.123.126. 로컬 SSH 도구 기본값 반영. SSH 연결 및 trip-api/trip-oracle 실행 확인. 김행진·노진아 실제 웹 로그인 확인. 이번 PPT 작업에서 서버 배포나 재시작은 하지 않음.

## 2026-10-14 지도 경로 테스트 완료
- TripMap: 날짜별 시간순 번호, 체크인 기록 있는 장소 초록색, 자동차 도로 예상 경로 버튼 및 거리/시간 표시. 실제 GPS 이동궤적은 아님.
- routeService.ts: FOSSGIS OSRM routed-car 공개 서비스에 버튼 클릭 시 좌표만 전송. 15초 timeout, 세션 내 캐시 20개, 클라이언트 동시요청/1.1초 제한, 2~25개 좌표 검증. 운영 다중 사용자용 공급자/서버 전역 제한은 별도 준비 필요.
- 사용자 요청에 따라 로그인한 김행진의 `[시연 테스트] 10월 5일 전체 흐름` 출장에 2026-10-05 13:00 皇居外苑, 15:00 東京タワー를 제로보 UI로 실제 저장. 기존 11:00 도쿄역 유지. 체크인 기록은 생성하지 않음.
- 브라우저에서 세 장소 도로 경로(4.6km, 예상 7분) 표시 확인. road-route.mjs 검증, tsc, Vite build 통과. APK 미빌드.
- 앞선 수정: 회사 출장현황 야간 스크롤 색상, CARTO 키 요구 지도 제거 → OSM 타일+야간 필터.

# 서버 IP 재연결과 전체 개발 보고서 완료 — 2026-10-14

- 최신 AWS IP 13.196.199.180. 기존 HostKeyAlias 호스트키 검증 통과, trip-api/trip-oracle 실행 확인. 내부 및 HTTPS api.01bo.cloud /api/health 모두 OK/database ready. 서버 배포·DB 재시작·실제 메일 발송 없음.
- aws-tunnel.sh/store-openai-key.py/configure-google-oauth.py 기본 IP 갱신. 앱 HTTPS API 주소 변경 필요 없음.
- 중단된 전체 개발 이력 Word 보고서 완료: /home/orora/01BO/reports/01bo-v0.3_전체개발이력_2026-10-14.docx. 초기9/24 분석→인증/회사→AI/Gmail/일정→NFC/모바일→HTTPS→v0.3 호출→금일 재연결, 검증/미완료/시연/경로 포함. 최종15페이지 렌더 및 전 페이지 육안 검사 완료. 비밀키 원문 미포함.
- 보고서 생성 스크립트 reports/build_history_report.py. QA 렌더 reports/qa-verified는 내부 검증용.
- 기능 기준은 여전히 v0.3. 다음 업무는 Android 실기기 로그인·지도·제로보·Word/메일 확인 및 호출 권한/잠금/알림 종료 검증. 문서 작성만으로 실기기 검증 완료 처리하지 않음.

---

# v0.3 제로보 호출 설정 — 2026-10-10

- 사용자 지정: 이번 버전 v0.3, APK 이름 `01bo-v0.3.apk`. 이전 지도·이메일 APK는 `/home/orora/01BO/releases/01bo-v0.2.apk`로 이름 변경 완료. 이전 날짜 버전 나머지는 보존. Android versionCode=3/versionName=0.3, 다음 기준은 docs/RELEASE_NAMING.md.
- 설정에 KO/JA 호출 카드 추가. Android 전용 실제 서비스 상태 조회, 기본 OFF, 권한 거부/미지원 오류, 켜기/끄기. 한국어 호출만 지원.
- WakeService/WakePlugin 등록: 비공개 microphone foreground service, 알림 켜기/끄기, 로컬 Vosk 한국어 모델, 최대30분 wakelock/만료. 모델은 APK assets 포함, 최초 ON에서 앱 전용 저장소 준비. 프로세스 강제 종료/재부팅 자동 시작 없음. 앱 작업 제거·로그아웃·계정 범위 변경·음성 입력 시작 시 종료.
- ‘제로보’만 독립적으로 말하고 잠시 기다리면 응답음과 알림. 사전상 ‘제로 보’로 분리 인식, <UNK> 거절 경로·단어 confidence0.8 이상·10초 중복 억제. 배경 음성 저장/전송 없음. 앱이 활성이고 잠금 해제면 AI 대화창 열기. 백그라운드는 알림 눌러 앱 복귀. **백그라운드 명령 듣기/업무 자동 실행은 미구현**. 이메일 최종 확인 유지.
- 코드: android/app/src/main/java/com/company/o1bo/{WakeService,WakePlugin,WakePhrase}.java, services/wakeService.ts, components/ZeroboWakeSettings.tsx. 기존 버튼 음성 입력 보존.
- 모델 준비: scripts/prepare-wake-model.py (공식82MB ZIP SHA256 고정); 큰 모델 assets는 gitignore, 별도 준비 필요. Vosk0.3.75/JNA5.18.1. 라이선스 assets/licenses.
- 검증: tsc/Vite/cap sync/Gradle assembleDebug와 단위검사 통과. 실제 로컬 모델 로딩·어휘·문법·무음 결과 확인. APK v2서명/16KB ZIP정렬 검증 통과. ADB 연결 기기 없음: 실제 말소리/잠금/절전/배터리/권한 시나리오 미검증. 실기기 완료로 보고하지 말 것.
- 최종 APK `/home/orora/01BO/releases/01bo-v0.3.apk` 약140MB, SHA256 `1c8affec5c6cc6ee0ae41d93f0ec860468e0e80933808715aa62b42f13c8e2f3`.
- 다음: APK 업데이트 후 설정 ON→마이크/알림 허용→대기 상태→홈으로 나가 ‘제로보’→응답음/알림→앱 대화창→알림OFF 후 마이크 표시 해제 확인. 인식률/오작동·배터리는 실제 단말 결과로 조정.

---

# 지도·이메일 확인 및 백그라운드 음성 계획 — 2026-10-10

- 사용자 Gmail 연동 해결 확인. 아래 과거 mismatch 미해결 기록은 이제 해소됨.
- TripMap: Leaflet CSS 앱에 포함(외부 unpkg 의존 제거), 최소 높이, 크기 변경 재계산, unmount 정리, 좌표 검증, 단일 지점 확대 제한, 타일 오류/재시도. 지도 API 키가 없는 문제가 아님. 실제 기존 휴대폰 실패 원인은 미확정.
- EmailPreview: 수신자·제목·Word 첨부를 보여주는 ‘정말 보내겠습니까?’ 확인/취소 추가. 최종 확인에서만 기존 confirm:true 발송 API 호출. 실제 테스트 메일은 보내지 않음.
- 제로보 기존 일정 생성/수정·일보 작성·주소 지정 이메일 초안 기능에 빠른 요청 예시 추가. 서버/모델 변경 없음.
- 임시 360px 화면에서 지도 타일 6개 로딩·350px 높이 확인, 지도 재진입 및 이메일 확인/취소 검증. 임시 파일/탭 삭제. 타입/Vite/Capacitor/Gradle/서명 검사 통과.
- APK: /home/orora/01BO/releases/O1BO-2026-10-10-map-email-debug.apk. 휴대폰 지도·이메일 확인 흐름 최종 검증 필요.
- 백그라운드 ‘제로보’ 호출은 아직 미구현. docs/ZEROBO_BACKGROUND_VOICE_PLAN.md에 기본 OFF, 로컬 호출어, Android 마이크 서비스/알림 종료, 잠금 상태 처리 및 검증 계획 저장. 현재 APK는 버튼 음성 입력만 지원.

---

# 카드 넘침 수정·Gmail mismatch 진단 — 2026-10-10

- 새 AWS IP35.76.108.13, 기존 호스트키 검증/DB health 확인. 접속 스크립트3개 갱신. API 도메인 health도 정상.
- 사용자 Gmail 오류 정확히400 redirect_uri_mismatch 확인. 서버 callback은 https://api.01bo.cloud/api/gmail/callback으로 이미 정상. Google 웹 OAuth 클라이언트 226826988016-jkbcqlonth53st05v13a4tljj514mlhj.apps.googleusercontent.com에 동일 URI 등록 필요. 프로젝트 idyllic-folio-510408-d6 클라이언트 화면 링크와 등록 칸(승인된 리디렉션 URI) 안내함. Google 콘솔 등록 완료/실제 OAuth 성공 확인은 아직 없음. 앱 수정으로 해결 완료라고 하지 말 것.
- HomeView 긴 제목/작성자/장소/활동 가맹점 줄바꿈. flex 텍스트 min-width0, 아이콘 shrink0, 장소/기간/동작 버튼은 작은 폭에서 wrap. index.css .home-view 범위 overflow-wrap:anywhere. 전체페이지 overflow hidden으로 덮지 않음.
- 임시 QA 화면에서 실제 HomeView에 긴 한글/일본어/연속영문 데이터를 전달. CUA DOM 측정320·360·412px에서 scrollWidth=clientWidth, 내부 가로이탈 없음. 실제 데이터 변경 없음. 임시 QA 파일/탭 정리 완료.
- 타입/Vite/Capacitor/Gradle 빌드 및 서명 검증 완료. APK releases/O1BO-2026-10-10-card-fix-debug.apk (기존 음성·Gmail 수정 포함).
- 변경은 버그 수정. 일본어 전체 번역은 이번 범위 아님.

---

# 모바일 음성·Gmail 버그 수정 — 2026-10-10

- 사용자 확인: 제로보 글자 요청은 문제가 아니고 음성 입력만 안 됨. AI 모델/에이전트 정의 변경 안 함.
- Android Web Speech 의존 대신 O1boSpeech 플러그인 추가. 시스템 ACTION_RECOGNIZE_SPEECH 활동 실행(ko-KR/ja-JP), 결과는 입력창에 반영, 사용자가 전송. 취소/미지원/시작 오류 처리. MainActivity 등록. 상시듣기/자동전송 아님. Android 실제 음성 앱 설치/활성화 상태는 기기에서 확인 필요.
- Gmail callback 서버에서 https://api.01bo.cloud/api/gmail/callback으로 변경. 완료 화면의 API루트404 이동링크 제거. Browser 종료/앱복귀 시 상태갱신, 버튼 처리중 표시와 오류 안내 개선.
- Google Cloud 콘솔 승인된 redirect URI 등록 안내했으며 사용자 완료 확인은 아직 없음. 기존 localhost URI 유지 가능. 프로젝트 idyllic-folio-510408-d6 웹 OAuth 클라이언트에 HTTPS URI 추가 필요. 실제 OAuth 완료·메일 발송 테스트 안 함.
- 원격 백업 /home/ubuntu/o1bo-backups/gmail-mobile-20261009-170757. workflow.env는600 유지. 컨테이너 재생성 후 HTTPS callback/health 확인.
- 타입검사/Vite/Capacitor/Gradle 빌드 및 APK 서명 검증 통과. Gmail 테스트대역(PKCE/state/쿠키·회사범위·재사용) 통과. 실기기 음성/Google 동의는 아직 미검증.
- APK releases/O1BO-2026-10-10-voice-gmail-debug.apk. 이번 수정은 버그수정으로 분류.
- 릴리즈 제목 사용자 규칙: 큰 변경0.1→0.2 / 작은 변경0.1→0.11 / 버그수정0.11→0.111, 정식출시1.0. 이 지시는 제목에 관한 것. 이전 산출물은 날짜 제목뿐이라 현재 기준번호 미확정; 예시번호를 임의로 기존 버전이라고 주장하지 말 것. Android 내부versionCode/versionName은 이번 요청으로 변경하지 않음.
- 일본어 미번역 부분은 사용자 요청대로 후순위.

---

# HTTPS API 프런트·APK 연결 — 2026-10-10 KST

- AWS 13.193.178.156, API https://api.01bo.cloud/api. ALB/ACM HTTPS 확인 완료. 01bo.cloud 메인 웹 배포는 별도 미진행.
- .env.production에 VITE_API_BASE_URL=https://api.01bo.cloud/api, .env.development에는 /api. Vite proxy는 HTTPS 도메인으로 전달(changeOrigin/인증서검증 true). 로컬 쿠키의 same-site 유지를 위한 프록시이며 이제 SSH 터널은 웹 개발에 필요 없음.
- 서버 TRUSTED_PROXY_CIDRS=172.31.0.0/16 (IMDS로 확인한 VPC CIDR). forwarded-host 제거, HTTPS req.secure 인식, rate limit은 req.ip 사용. 전체 프록시 무조건 신뢰 설정 아님. AWS SG에서 EC2 80 인바운드를 ALB SG로 제한하는 운영 설정은 별도 확인 필요.
- CORS: 기존 localhost5173 + https://localhost + capacitor://localhost + https://01bo.cloud + https://api.01bo.cloud. 임의 Origin 허용 안 함.
- 원격 백업 /home/ubuntu/o1bo-backups/https-api-20261009-165322/before.tgz (600). server.js/password-routes.js/compose 반영, trip-api 재생성. DB 컨테이너 유지.
- tests/proxy.js 로컬 통과(신뢰되지 않은 프로토콜 헤더·host 위조 차단). 외부 HTTPS 로그인 빈입력400, 직접 IP에 HTTPS헤더 위조403. Android OPTIONS204/정확한 Allow-Origin 확인.
- AWS 컨테이너에서 TEST_BASE_URL=https://api.01bo.cloud/api로 tests/password-auth.js 및 tests/integration.js 모두 통과. 임시 계정/데이터 생성 및 정리; 기존 사용자 로그인 우회 없음. 실사용자 브라우저 로그인/Android 실기기 검증은 별도 남음.
- 타입 검사/Vite production build/Capacitor sync/assembleDebug 통과. 번들에 HTTPS API 주소 확인. releases/O1BO-2026-10-10-https-debug.apk 생성, debug 서명v2 검증.
- 로컬 Vite5173 실행 세션77414, /api/health DB ready 확인. 개발 서버 중단되면 번들 Node로 재실행.
- Gmail callback은 아직 http://localhost:5173/api/gmail/callback. 모바일 Gmail 신규 연결에는 Google 콘솔 HTTPS redirect 추가 및 서버 환경변수 전환이 필요. API 연결 완료를 모바일 Gmail까지 완료라고 설명하지 말 것.
- 다음: 사용자 실제 앱 로그인/영수증 촬영/파일공유/GPS, Google callback 전환. NFC 추가 작업은 보류 유지.
- 프록시 참고: https://expressjs.com/en/guide/behind-proxies/

---

# ALB /health 반영 — 2026-10-10 KST

- AWS 13.193.178.156. 정확한 도메인은 01bo.cloud(영문 o), 사용자 확인 완료. ALB 방식으로 연결 진행 요청; 이전 nginx 직접 구성은 미실행.
- backend/server.js 최상단에 GET /health 추가. 인증/CORS/API 제한/DB 조회 이전에 200 {success:true,message:"OK"}. 기존 /api/health DB 준비 상태 검사 유지.
- tests/health.js: DB 조회 실패 모의 시 /health 200 및 DB 호출0, /api/health503 검증 통과. 기존 프로세스 시작은 DB pool 초기화 후 listen하므로 DB 접속 불가 상태에서 최초 기동 독립성까지 보장하지는 않음.
- 원격 동일 코드 해시 확인 후 백업/배포. trip-api만 재시작, DB 컨테이너 변경 없음. 외부 http://13.193.178.156/health 200, /api/health DB ready, 미인증 /api/trips401 확인.
- 원격 백업 /home/ubuntu/o1bo-backups/health-20261009-163514/server.js.
- 다음 ALB Target Group: instance 대상, HTTP80, health path /health, success200. 실제 Target Group/ALB 생성·수정은 아직 안 함. HTTPS 프록시 신뢰/CORS/Google callback/APK URL 전환도 아직 미완료.

---

# 대화 복원·안드로이드 영수증 연결 — 2026-10-06

- 사용자: 도메인 아직 없음. HTTPS/도메인 작업은 미루고 나머지 기능부터 진행. NFC 추가 작업도 보류 유지.
- AWS 18.183.243.107의 /api/agent/history 반영 및 trip-api 재시작 완료. DB ready 확인. 사용자+회사+역할별 최근 대화 최대20턴 복원. 내부 tool pending/accessRole 제외, 만료된 장소 선택 제거, 이메일 현재 상태 조회.
- 서버 tests/agent.js 통과: 대화 순서, 본인 데이터 한정, 사장이 직원 개인 대화 조회 불가, 잘못된 conversationId 차단, 기존 요청 중복 방지 포함. AI/장소 공급자는 테스트 대역. 테스트 데이터 정리, 실제 메일 발송 없음.
- AIChatModal에서 완료 대화는 서버에서 복원. 처리 중 요청은 sessionStorage에 요청번호/본문을 보관하여 같은 탭 새로고침 후 같은 번호로 재시도. 앱 강제종료 후 미완료 작업 복원/서버 영속 작업 큐는 아직 미구현. 역할/회사 변경 시 별도 화면 인스턴스.
- Android 영수증: Capacitor Camera.takePhoto/chooseFromGallery 연결. 촬영 2000px/품질85, 갤러리 자동 저장 안 함. 웹은 기존 파일 입력 유지. 사진 선택 후 기존 OCR→금액/날짜 확인→저장 흐름 사용. HEIC는 서버 미지원이므로 업로드 전에 형식 안내.
- tests/receipt-camera.mjs 추가: 촬영·갤러리 분기, MIME/파일 내용, 취소/빈 선택/파일 누락/읽기 실패 검사 통과. 네이티브 호출은 대역이며 실제 휴대폰 촬영/OS 카메라 활동 중 앱 종료 복원은 아직 검증하지 않음.
- 타입 검사/기존 회귀 검사/Vite build 통과. 로그인 화면 확인, 사용자 로그인 대기 중이므로 대화 복원 실제 UI와 실제 영수증 OCR는 미검증.
- 최종 Android sync/assembleDebug/서명v2 검증 통과. 새 파일 /home/orora/01BO/releases/O1BO-2026-10-06-camera-debug.apk. SHA256 1e07e3bd041ab93c19f8b6264116a60720372dcc54fb76b84baaf7d7dd3fc674. 대화 복원/네이티브 카메라/파일 형식 안내 포함. HTTPS API 미설정인 설치 확인용 debug 빌드이며 실기기 서버 연결 완료본 아님.
- 로컬 Vite 5173 및 SSH 터널3000 재실행. /api/health OK. 중단 시 프로세스 종료될 수 있음.
- 다음: 로그인 후 대화 복원/새로고침과 경비 직접 입력 검증. 실제 휴대폰 카메라·갤러리·OCR·Word 공유 검증. 비밀번호 재설정/이메일 인증, 회사 변경/사장 위임, 운영 DB 백업·복구는 별도 미완료. 도메인 준비 후 HTTPS API/Gmail 모바일 callback 및 최종 APK 설정 필요.

---

# APK 빌드 및 서버 IP 갱신 — 2026-10-06

- 최신 AWS IP18.183.243.107. SSH 기존 호스트키 검증, API OK/DB ready 확인. 연결 스크립트3개 기본IP 갱신.
- 사용자 요청: 실제 서비스 준비, APK 우선. HTTPS용 도메인 보유 여부를 비동기 질문했으며 응답 대기. 도메인 없음으로 단정하지 말 것.
- 최신 Vite build / capacitor sync android / assembleDebug 성공. 실제 출력명 android/app/build/outputs/apk/debug/01BO.apk이며 app-debug.apk가 아님. 이전10/5빌드도 이 이름으로 존재했음.
- 전달파일 /home/orora/01BO/releases/O1BO-2026-10-06-debug.apk (약16MB). apksigner v2서명 검증 성공. SHA256 b29a82488941fae344c607731694ba6f114e9e6ba20669bbb594cae78643e319.
- JDK21을 공식 Adoptium에서 /home/orora/01BO/toolchains/jdk21로 준비. gradle.properties의 사라지는 /tmp/jdk21 경로를 새 경로로 변경.
- 이 APK는 debug 설치용. 휴대폰 HTTPS API 주소가 아직 설정되지 않아 실제 로그인/서버 연결 완료본이 아님. release서명/스토어배포/실기기검증 아님.
- 다음: 도메인 답변에 따라 HTTPS/API 및 Google callback 구성 후 VITE_API_BASE_URL 반영 APK 재빌드. 도메인 없는 IP TLS도 공식 Let's Encrypt상 가능하나 변동IP/단기갱신/Google callback 제약 별도 고려. 아직 인증서나 외부서비스 생성하지 않음.
- NFC 추가 작업은 보류 유지.

---

# 실제 화면 시연 완료 — 2026-10-05

- 김행진 로그인 및 Gmail rlaskslsl093@gmail.com 연결 상태 확인. 새로고침 후 세션/기존 출장 복원 확인.
- 공개 장소 東京駅 검색→丸の内一丁目 결과 선택→`[시연 테스트] 10월 5일 전체 흐름` 출장 생성(10/5–10/7). 가상/검증용 목적 명시. 기존 직원 출장 수정하지 않음.
- 새 일정 시간을10:00→11:00으로 UI 변경, 새로고침 후11:00 유지. CUA fill(time)만으로는 React 상태 반영 안 됐으나 키보드 ArrowUp 입력으로 저장 성공. 앱 시간 저장 결함으로 단정하지 말 것.
- 10/5 일보 생성: 예정11:00, 실제 방문기록 없음, 경비0엔. 본인 Gmail 수신 미리보기 생성. 상태 발송 전. 실제 메일 추가 발송 없음.
- Word 웹 다운로드에서 blob 방식은 다운로드 이벤트/파일 저장 확인 실패. apiDownload 웹 분기를 인증 쿠키가 적용되는 attachment endpoint 링크로 변경(오류 선확인 유지, 토큰 URL 없음, native 공유 분기 유지).
- 변경 후 실제 브라우저 download 이벤트와 Downloads/O1BO_Report_2026-10-05.docx 파일 확인. 번들 LibreOffice 렌더1페이지 육안 검증: 한글/일본어/11시 일정 정상, 잘림 없음. 타입/회귀/Vite build 통과.
- 시연 출장/일보/미발송 초안은 검토용으로 유지. IAB 탭1(resumeTab)은 제로보 일보·Word·이메일 화면.
- 다음 주요 미완료: 모바일 HTTPS/API 및 Gmail callback 구성, 안드로이드 실기기 로그인/파일 공유/GPS. NFC 추가 작업 보류. 이번 프런트 수정은 APK 재동기화/재빌드 아직 하지 않음.

---

# 재개 — 2026-10-05

- 사용자 최신 AWS IP: 18.177.155.6. 기존 HostKeyAlias 57.182.243.64로 SSH 호스트키 검증 성공. API health OK/DB ready.
- scripts/aws-tunnel.sh, store-openai-key.py, configure-google-oauth.py의 기본 접속 IP 갱신. 비밀 설정 변경 없음.
- SSH 터널 127.0.0.1:3000→AWS80 실행, Vite localhost:5173 실행. 프런트 /api/health 응답과 미인증 /api/auth/me 401 확인.
- IAB 탭1(resumeTab) 로그인 화면 확인. 사용자에게 김행진/노진아 로그인 요청, 완료 응답 대기. 로그인 우회/추정 금지.
- 오늘 다음 순서: 로그인 후 장소 검색→시연용 일정 생성/수정→일보→Word 다운로드→이메일 미리보기. 추가 실제 발송 요청 없음. 어제 통과한 서버 검사를 이유 없이 반복하지 말 것.
- NFC 추가 작업 보류 유지. 모바일은 HTTPS API 및 Google callback 주소가 여전히 필요; PC localhost/SSH 터널만으로 휴대폰 앱 서비스 연결은 완료되지 않음.

---

# 사용자 요청으로 작업 중단 — 2026-10-04

- 사용자가 토큰 부족으로 마무리하고 재개 준비만 요청. 추가 테스트·구현·메일 발송 중단.
- 최신 서버 IP: 3.113.249.124. 재개 시 IP가 바뀌었는지 확인. SSH 사용자 ubuntu, 키 /home/orora/aws/japan-app-key.pem, HostKeyAlias 57.182.243.64. 키 내용 출력 금지.
- 프런트 /home/orora/01BO/01BO, 백엔드 /home/orora/01BO/server-work/backend. 기존 변경과 새 파일은 디스크에 저장됨. 커밋/푸시하지 않았으므로 git diff와 미추적 파일 모두 보존.
- NFC는 사용자 지시로 현 수준에서 보류. 나머지 핵심 서버/Oracle 검사와 실제 Luna 읽기·권한·추가 질문·요청 재사용 검사 통과. Word 1페이지 렌더 검증 완료. 상세는 아래 기록 및 DEMO_READINESS.md.
- UI는 마지막 확인 때 localhost:5173 로그인 화면. 사용자 로그인 완료로 추정하지 말 것. 재개 후 화면을 확인하고 로그인돼 있으면 장소 검색→일정 등록/변경→일보 생성→Word 다운로드→이메일 미리보기 순으로 시연. 임시 일정은 테스트임을 명시. 실제 메일 추가 발송은 새 명시 요청 필요.
- 모바일 HTTPS API 주소/Google OAuth callback, Android 실기기 검증은 아직 남음. APK 빌드 성공은 휴대폰 서비스 연결 완료와 다름.
- 컴퓨터 재부팅 후 SSH 터널/Vite는 필요하면 다시 실행. scripts/aws-tunnel.sh 사용, Node는 /home/orora/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. 시스템 Node는 이전에 라이브러리 오류 있었음.
- Android Gradle은 /tmp/jdk21 사용 중. 재부팅으로 사라지면 JDK21 복구 필요. QA PNG와 임시 로그 역시 /tmp이므로 영구 산출물로 간주하지 말 것.
- 다음 사용자 메시지 예: “서버 IP는 …이고, 체크포인트부터 이어서 진행해줘.”
- 시연 목표: 10월12일까지 기능 검증, 10월14일·16일 발표. 예약/백그라운드 자동 작업은 생성하지 않음.

---

# NFC 보류 후 핵심 흐름 검증 — 2026-10-04

- 사용자 지시: NFC는 현재 수준에서 멈추고 나머지 플로우 진행. NFC 추가 구현 하지 말 것.
- AWS 실제 Oracle password-auth/company-create/membership/integration/workflow/agent 검사 통과. Gmail OAuth 및 managed agent mock 검사 통과. 외부 메일 발송 없음. 임시 데이터 정리.
- 실제 Luna managed-live 최종 통과: 노진아 본인 일정200, 김행진 회사 일정200, 노진아 회사 조회403, 메일 정보 부족 추가 질문200, 동일 요청 재사용. 기존 출장 변경 없음.
- 서버 오래된 검사 파일을 로컬 현행으로 동기화(tests/gmail.js, managed-live.js, integration.js). 최초 live 검사 unavailable 기대값 실패는 오래된 검사 문제였음. 현행 question 기대값으로 재검사 통과. 앱 런타임 변경 없음.
- 기존 Word Downloads/O1BO_Report_2026-10-03.docx 전체1페이지 렌더/육안 검증 완료: 한글·일본어 정상, 잘림/겹침 없음. /tmp/o1bo-report-qa. 문서 수정 및 신규 이메일 전송 없음.
- IAB 탭5(flowTab) 로그인 화면. 사용자에게 김행진 또는 노진아 계정으로 UI 로그인 요청(비밀번호 채팅 금지); 응답 대기. UI 전체 시연은 아직 재실행하지 않음.
- 다음: 로그인 후 장소 검색→일정 등록/수정→일보/Word/메일 미리보기 UI 시연. 추가 메일은 새 명시 발송 요청이 있을 때만. 모바일 HTTPS API와 OAuth 콜백은 아직 필요. 10/12 기능완료 목표 유지.

---

# NFC 이중 확인 구현 — 2026-10-04

- 사용자 승인: 회사 사장 설정 켜기/끄기, 고정 현장 스티커 NFC + GPS, 직원 현황 사장 열람 방식으로 진행.
- AWS `3.113.249.124`: NFC policy/tag/challenge API 및 check-in/out 서버 강제 검증 배포, migration 적용, API health OK/DB ready.
- 백업 `/home/ubuntu/o1bo-backups/20261004-nfc/before.tgz` (기존 server.js/routes/application.js). 신규 파일은 lib/nfc.js, routes/nfc.js, scripts/migrate-nfc.js, tests/nfc.js.
- 프런트 설정 NfcSettings: 사장만 정책 변경, 출장/일정 선택→빈 NDEF 스티커 기록·등록. 기본 끄기; 실제 회사 설정/태그 미변경.
- 안드로이드 O1boNfc 커스텀 플러그인, 네이티브 위치/권한, 사장 확인 방식 표시 구현. Web NFC fallback. 일반 태그/GPS의 복제·위조 불가 보장을 하지 않는다.
- 실제 Oracle NFC 통합 검사 통과: 별도 임시 회사로 권한/회사 격리, GPS 오류, 필수 단계 우회, 동시 중복 처리 차단 확인. 임시 데이터 정리. 프런트 타입/회귀/Vite 및 Java NFC 컴파일+debug APK 빌드 통과.
- `/tmp/jdk21`이 없어 공식 Adoptium JDK21 재다운로드/복구. 기존 gradle.properties 경로 그대로 사용. /tmp 삭제 시 다시 준비 필요. 새 플러그인 Gradle 의존성 다운로드 완료.
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`. 컴파일 검증용이며 아직 HTTPS API 주소가 없어 네이티브 서버 연결 준비 완료가 아님.
- 실스티커/실기기 검증, 모바일 HTTPS+Gmail callback, 사유 제출→사장 예외 승인 기능은 미완료. 사장 화면은 조회/새로고침, 푸시 아님.
- 상세 설계/제약/이어갈 순서: `docs/NFC_IMPLEMENTATION.md`.

---

# 화면 전환 및 안드로이드 준비 — 2026-10-04

- 최신 AWS IP `3.113.249.124`. 기존 호스트키/API OK/DB ready 확인. 터널 및 Vite 재시작.
- 사용자가 시연 기기를 안드로이드 휴대폰으로 확정.
- 화면 본문 진입 220ms fade/8px 이동, 제로보 sheet 260ms fade/20px 이동. 하단 탭 짧은 터치 반응, prefers-reduced-motion 대응. 데이터 갱신 때 재애니메이션되지 않도록 view 기준 key 사용. 이전 화면 퇴장 대기 없음.
- 타입 검사와 Vite build 통과. capacitor sync android 성공: Browser/Filesystem/Share 포함 6개 플러그인 반영. APK 빌드/실기기 설치 검증은 아직 아님.
- localhost:5173 새 탭5 로그인 화면 열림. 로그인 후 실제 화면 전환 육안 확인 필요.
- AndroidManifest에 위치 권한이 없는 상태 확인(Geolocation 플러그인 요구사항 검토 후 보완 필요). 모바일 서버 HTTPS 주소/Google callback 설정도 여전히 필요. 현재 콜백은 PC localhost 전용.
- Word 렌더링 QA는 아직 미완료.

---

# 제로보 실제 자연어 시연 검증 — 2026-10-03

- 사용자: Gmail 테스트 두 주소 모두 수신 확인. 실제 메일 발송 연동 확인 완료.
- 김행진 로그인 UI에서 현재 시연 테스트 출장 대상, 실제 Luna managed agent로 일정 조회 성공.
- 자연어로 10/3 15:00 시연 테스트 미팅 추가 요청 → 실제 장소 후보 표시 → 사용자 대리 테스트 선택 → 서버 저장 성공.
- 후속 대화 “방금 추가한 ... 15:30으로 변경” 성공, 홈 일정 15:30 표시 확인.
- 자연어로 10/3 일보 작성 성공. 15:30 미팅 포함, 방문 기록 없음/경비0엔 표시. 추가 메일 발송 없음.
- 이번 4회 자연어 요청은 시간 초과 없이 성공. 과거 지연 문제가 완전히 해결되었다거나 전체 실모델 회귀 완료로 주장하지 말 것. durable async job 미구현.
- App.tsx 새 출장의 locationName에 일정 제목이 중복 저장되던 값을 selectedPlace.name으로 수정. 기존 데이터는 수정하지 않음.
- 다음 우선 항목: Word 렌더링 QA, 실기기 HTTPS/파일 공유/GPS 검증, 회사별 권한 시연, AI 지연/복구 안정화.

---

# 실제 이메일 시험 추가 — 2026-10-03

- 사용자가 첫 본인 Gmail 테스트 메일 수신 확인.
- 추가 명시 요청으로 khyoungjin011@gmail.com에 같은 시연 테스트 일보/Word 첨부 1통 발송. UI 메일 서버 접수 확인. 두 번째 주소 수신함 확인은 아직 미완료. 중복 발송 없음.

# Gmail 연결 및 UI 시험 — 2026-10-03

- 김행진 로그인 UI에서 rlaskslsl093@gmail.com Gmail 연결됨 확인.
- 실제 공개 장소 검색 東京駅 결과 확인 및 첫 후보 선택, `[시연 테스트] Gmail·일보 연동 10월 3일` 출장 생성(10/3–10/5). 목적에 가상/기능 검증용 명시. 테스트 데이터는 사용자 검토를 위해 유지.
- 제로보 → 일보·Word·이메일에서 10/3 일보 생성 및 미리보기 성공. 방문 기록 없음/경비0엔 표시 확인. 직원 기존 출장 수정 없음.
- 사용자 명시 승인 후 같은 Gmail 주소로 테스트 메일 1통 발송. UI에서 메일 서버 접수 확인. 수신함 도착은 사용자 확인 대기. 추가/중복 발송하지 않음.
- Downloads/O1BO_Report_2026-10-03.docx 저장 확인. ZIP/XML/한글·일본어 본문 검증 통과. 렌더링 QA는 미완료.

---

# 재개 확인 — 2026-10-03

- 최신 AWS IP `43.206.134.226`. 기존 SSH 호스트키 일치, API OK/DB ready, 버전 2026-10-02-workflow, Gmail 설정 로드 확인.
- 전날 배포 완료: Gmail OAuth/장소 검색/일보·Word/메일 미리보기·발송 백엔드 및 추가 테이블. 백업 `/home/ubuntu/o1bo-backups/20261002T082559-gmail-workflow`.
- 전날 실제 Oracle에서 workflow/agent 회귀 통과. 기존 출장 불변 및 임시 데이터 정리 확인. 외부 메일 발송 없음.
- GmailConnect 설정/일보 UI 구현. 프런트 타입 및 regression 통과. 네이티브 파일 공유 코드 추가됨(실기기 검증/Capacitor sync 미완료).
- 오늘 OAuth 격리 검사 tests/gmail.js 통과: 암호화 변조 검출, PKCE, 쿠키 불일치, 요청 재사용, 사용자/회사 접근 제한, 회사 변경 차단. Google 실인증은 미검증.
- SSH 터널과 Vite 재시작, localhost:5173 로그인 화면 열림. 사용자 기존 O1BO 로그인 대기; 로그인 우회 금지. 다음: 설정 Gmail 연결 → Google 동의 → 연결상태 확인. 실제 이메일은 수신인/테스트 내용 승인 후 발송.
- Google Cloud 프로젝트 O1BO `idyllic-folio-510408-d6`, Gmail API 사용 설정됨, 테스트 사용자 rlaskslsl093@gmail.com. OAuth JSON는 이미 AWS private workflow.env에 저장, 재전송 불필요.
- 목표: 10/12 정상 기능 검증 완료, 10/14·10/16 발표 시연. Luna 지연/타임아웃, 모바일 HTTPS/도메인, 실제 Gmail 발송, 실제 장소 검색, Word 렌더링 QA, 앱 실기기 검증은 아직 완료 아님.

---

# Gmail OAuth 설정 진행 — 2026-10-02

- 최신 AWS IP `13.196.25.195`.
- 사용자가 앱 비밀번호 대신 Google OAuth Gmail 연결 선택. 기존 앱 로그인 방식과 별도.
- Google Cloud 전용 프로젝트 O1BO: `idyllic-folio-510408-d6`. 사용자가 정책 동의 및 OAuth 클라이언트 생성 완료.
- O1BO 프로젝트의 Gmail API 활성화 및 테스트 사용자 `rlaskslsl093@gmail.com` 등록을 Cloud UI에서 확인 완료.
- 웹 클라이언트 이름 `O1BO Gmail - Local Test`, AI-powered agent 옵션 선택. 콜백 `http://localhost:5173/api/gmail/callback` (PC 테스트 전용; 모바일/운영 HTTPS 별도 필요).
- 사용자 제공 Downloads OAuth JSON 검증 후 `scripts/configure-google-oauth.py`로 SSH stdin 전송. AWS `/home/ubuntu/.config/o1bo/workflow.env` 600에 ID/secret/callback/AES key 저장 성공. 비밀 값 출력 금지. 기존 암호화 키 보존.
- 아직 Compose env 연결, OAuth 코드 배포/DB migration, 앱 Gmail 연결/실메일 검증 미완료. 저장 성공을 연결 완료로 주장하지 말 것.
- 장소 검색/일보/Word/메일/OAuth 로컬 변경은 미완성 상태. backend tests/workflow.js 및 agent 회귀, Word 렌더링 QA, 프런트 Gmail 연결 UI, native 다운로드 작업 필요.

---

# Luna 설정 반영 / 지연 문제 미해결 — 2026-09-29

- 연결된 기존 제로보 정의를 API 조회한 결과 사용자가 gpt-5.6-luna로 변경했고 dispatch_zerobo도 유지됨.
- AWS 세션 override에는 Astra가 남아 있어 로컬/서버 config를 gpt-5.6-luna / low로 맞추고 trip-api 재시작함.
- 백업 `/home/ubuntu/o1bo-backups/20260929-luna/zerobo-agent.json`.
- 새 IP 터널과 Vite를 재실행. localhost:5173/api/health에서 API OK/DB ready 확인.
- 최소 요청 Luna 함수 호출 정상. 실제 노진아 본인 조회 200 한 번 확인. 그러나 반복 검사는 상태 조회 지연502/전체 제한43초 초과504로 실패하여 전체 Luna 회귀 통과 아님. 기존 Astra 검증을 Luna 검증으로 주장하지 말 것.
- OpenAI GET 상태 조회 일시 오류만 기존 제한 내 재시도하도록 보완. 생성/업무 저장 자동 재시도 없음. 204 빈 응답 처리 추가. 모의 테스트에서 재조회 시 세션 중복 생성 없음 확인.
- 노진아 출장 1건, itinerary JSON225바이트. 데이터 양이 큰 상황 아님. 정확한 외부 지연 원인은 미확정. 반복 유료 테스트 중단.
- 다음 작업 우선순위: 긴 실행을 앱의 60초 HTTP 제한과 분리하는 지속성 있는 비동기 요청/조회 설계 및 상태 표시 검토. 설정만으로 안정화됐다고 말하지 말 것.
- 실제 검증마다 기존 출장 전후 동일, 임시 세션·요청 기록 정리 완료. 장소·Word·메일은 아직 진행 전.

---

# 최신 접속 확인 — 2026-09-29 22:09 KST

- 새 AWS IP `13.196.198.178`. 기존 SSH 호스트키 검증 통과. API OK / DB ready / OpenAI 키 로드 확인.
- 터널·키 저장 스크립트의 기본 IP 갱신. 실행 중인 로컬 터널의 재연결은 이번 상태 확인에서 수행하지 않음.
- 사용자는 비용 때문에 gpt-5.6-luna 사용 결정. 그러나 서버 config의 실제 모델은 아직 gpt-6-astra. Luna로 운영 변경/실모델 재검증은 다음 작업.
- 사용자가 대시보드에서 새 Luna 에이전트를 저장하려고 함. 새 ID는 아직 받지 않음. 기존 에이전트 변경과 신규 에이전트 연결을 혼동하지 말 것.
- 아래 완료 기능은 그대로이며 장소 검색·이메일·Word 생성 도구는 미연결/미완료.

---

# 현재 재개 지점 — 관리형 제로보 연결 완료 (2026-09-29)

이 절이 아래 과거 기록보다 우선한다.

- AWS IP `57.183.12.111`. OpenAI 키를 사용자 비공개 입력 스크립트로 저장했고, 유효성·실제 호출 검증 및 Compose api env_file 연결 완료. 키 출력 금지.
- OpenAI 저장 에이전트 ‘제로보 · O1BO 출장 도우미’ 생성 및 지침/dispatch_zerobo 도구 갱신 완료. ID는 서버 `/app/.private/managed-agent.json`. gpt-6-astra / low / environment none.
- `/agent/messages`가 관리형 세션을 사용한다. 본인 일정과 인증된 최근 8개 대화를 입력하고, 함수 요청은 AWS의 기존 권한 검사/원자적 저장 실행기가 처리한다. 다른 사용자/회사 세션 공유 없음. 사용자 역할 변경 시 과거 권한 결과 재사용 차단.
- 김행진·노진아 실제 출장 데이터를 OpenAI에 전송하는 검증을 사용자가 명시 승인함. 실제 모델로 본인 조회200, 사장 회사 조회200, 직원 회사 조회403, 이메일 미연결 안내200 및 동일 요청 재시도 검증 통과. 기존 출장 전후 동일, 임시 로그인/요청 기록 정리 완료.
- 기존 일정 등록·변경·일보 저장/중복 방지/소유권 검사는 공급자 대역을 사용한 실Oracle 회귀검사 통과. 실제 장소 검색·이메일 발송은 미연결. 장기 대화 복원/작업 큐/운영 HTTPS/모바일 기기 검증은 남음.
- 백업 `/home/ubuntu/o1bo-backups/20260929-managed-connect/backend-agent.tar.gz`. 키 환경 연결 이전 Compose 백업 `/home/ubuntu/o1bo-backups/20260929T064421-openai-env`.
- 지침 원본 `server-work/backend/config/zerobo-instructions.md`, 상세 운영 [ZEROBO_MANAGED_SETUP.md](ZEROBO_MANAGED_SETUP.md).
- 현재 localhost:5173 브라우저는 로그인 화면이다. 비밀번호를 우회하거나 사용자 로그인 상태를 만들어두지 않았다. 실 API 테스트는 임시 서버 세션으로 수행 후 삭제했다.

---

# 재개 지점 — 키 비공개 입력 준비 (2026-09-29)

- 사용자가 채팅에 OpenAI 비밀키를 올림. 원문은 파일/로그/문서에 복사하지 않았으며 API 인증에도 사용하지 않았다. 폐기/교체 안내함.
- 사용자 터미널에서 `python3 /home/orora/01BO/01BO/scripts/store-openai-key.py` 실행하면 새 키를 숨김 입력하고 SSH stdin으로 서버 `/home/ubuntu/.config/o1bo/openai.env`에 저장한다(디렉터리700/파일600). 로컬 파일·명령 인자·히스토리에 키를 기록하지 않음.
- 아직 이 입력 스크립트는 사용자가 실행하지 않음. 원격 키 저장/활성화/실제 OpenAI 호출은 미실행.
- 서버 Compose 위치 `/home/ubuntu/japan-trip-app/docker-compose.yaml`, 서비스 api. 환경변수에 OPENAI_API_KEY가 아직 없어 private env_file 연결 및 API 서비스만 재생성 필요. DB 설정을 출력하지 말 것.
- `server-work/backend/config/zerobo-agent.json`에 관리형 제로보 정의 초안, `scripts/create-managed-agent.js`에 생성 스크립트 준비. 문법 검사만 수행. 실제 에이전트 미생성. 모델은 공식 예제 gpt-6-astra 초안값이며 계정 접근/호환성 검증은 새 키 입력 후 필요.
- 관리형 세션·조회 function 연결은 아직 미구현. 현재 운영은 기존 Responses API adapter이며 이 두 경로를 혼동하지 말 것.

# 재개 — 2026-09-29

- 최신 AWS IP `57.183.12.111`. 기존 HostKeyAlias 검증 통과, 동일 호스트 ip-172-31-30-140. API `2026-09-28-openai-agent`, DB ready 확인.
- scripts/aws-tunnel.sh 기본 IP 변경. 아래 IP들은 과거 기록이다.
- 사용자 요청으로 API 키 연결은 보류. 사용자가 OpenAI Agents 화면을 제시하며 관리형 에이전트 활용을 문의함. 아직 Agents API 전환/에이전트 생성은 하지 않음.
- 비AI 기능 정리 재개. 최신 구현/미완료 항목은 CURRENT_STATUS.md 참조.

# 현재 재개 지점 — 2026-09-28 OpenAI 전환

- 사용자 요청으로 Gemini에서 OpenAI Responses API로 교체. health 버전 `2026-09-28-openai-agent`.
- `lib/openai.js` 공통 어댑터, `OPENAI_API_KEY`/`OPENAI_MODEL` 사용. 기본 gpt-4.1-mini. 키는 아직 미설정.
- 제로보 strict JSON 작업 분류와 기존 OCR/보고서 API를 모두 OpenAI로 변경. 기존 프런트 파일명 geminiService.ts는 호환상 남아 있음.
- 키 없는 경우503, 응답 거절/미완성/잘못된 작업은 실행 차단. store:false.
- tests/openai.js 계약 검사 및 노진아/김행진 계정 실DB 에이전트 검사 통과. 외부 AI 호출은 없음. 테스트 데이터 정리/기존 회사 출장 보존 확인.
- 배포 백업: `/home/ubuntu/o1bo-backups/20260928T134822-openai`. 운영 키 미설정, 기본 모델 gpt-4.1-mini 확인.
- 다음은 본인 OpenAI 프로젝트 키를 서버 환경에 안전하게 설정한 뒤 실제 모델 응답 검증. 채팅에 키 원문을 요청하지 말 것.
- 자세한 내용: [ZEROBO_AGENT.md](ZEROBO_AGENT.md). 아래 Gemini 관련 상태는 이전 기록이며 현재 공급자는 OpenAI다.

---

# 현재 재개 지점 — 2026-09-28 제로보 API 기반 실행 구조 배포

이 절이 아래 인증/과거 기록보다 우선한다. 서버 IP `18.177.154.126`, health `2026-09-28-zerobo-agent`.

- 사용자 요청: 제로보가 대화로 일정 조회·등록·변경, 일보 작성, 이메일 발송까지 실행하는 에이전트. 먼저 일정 실행 API와 사실 기반 일보 저장을 구현함.
- 프런트 AIChatModal을 대화 기록·장소 후보·실행 결과·동일 요청 재시도 UI로 교체. ‘제로보 열기’ 버튼은 마이크 권한 없이 대화창을 연다.
- 서버 `/api/agent/messages`, `/agent/status`, `/agent/reports` 추가. 별도 AGENT_REQUESTS/AGENT_REPORTS 테이블 추가.
- 모델 응답은 허용된 작업만 실행. 세션 권한과 본인 일정 수정 제한, Asia/Tokyo 날짜, 장소 후보 선택, 원자적 요청 중복 방지 적용.
- 등록된 일정/체크인/경비만으로 일보 작성. 기존 보고서는 보존하며 별도 일보 기록에 저장.
- 사용자 지정 계정: 김행진(admin), 노진아(employee), 회사 `CO_8F5963CC6EF4AE3CD89D81FE`. 이 두 계정으로 실DB/API 테스트 통과. 테스트 제공자를 사용했으며 실제 AI 의미 이해 테스트는 아님. 고유 테스트 데이터/임시 세션 정리 완료, 기존 회사 출장 내용 동일함.
- 운영 API 재시작 후 인증 회귀 테스트 통과. 브라우저의 제로보 요청/미설정 오류 안내 확인. 사용자 세션 변경 없음.
- 백업 `/home/ubuntu/o1bo-backups/20260928T134214-zerobo-agent`.
- **Gemini 키·장소 제공자·메일 제공자 미설정.** 키 원문을 채팅으로 받지 말 것. 실제 AI 대화 실행과 메일 발송은 아직 사용할 수 없음.
- 메일·다단계 자동 실행·네이티브 음성·실기기 테스트·대화 UI 재시작 복원은 후속 작업. 현재 이메일 요청은 ‘발송하지 않음’ 안내.
- 상세와 다음 단계: [ZEROBO_AGENT.md](ZEROBO_AGENT.md).

---

# 현재 재개 지점 — 2026-09-28 이메일/비밀번호 인증 배포 완료

이 절이 아래 과거 기록보다 우선한다. Google 로그인은 사용자 요청으로 후순위이며 현재 로그인은 이메일 아이디/비밀번호다.

- AWS IP: `18.177.154.126`, 기존 서버 호스트 키 검증 완료. scripts/aws-tunnel.sh 기본값 갱신.
- 배포 API 버전: `2026-09-28-password-auth`, DB ready 확인.
- 서버 경로: `/home/ubuntu/japan-trip-app/backend`, 컨테이너 trip-api.
- 배포 전 백업: `/home/ubuntu/o1bo-backups/20260928T132002-password-auth`.
- AUTH_CREDENTIALS 별도 테이블 추가. USERS와 USER_ID로 연결하고 이메일 아이디/비밀번호 해시/실패 횟수/잠금 시각 저장. 기존 업무 데이터 보존.
- POST /api/auth/register, POST /api/auth/login 구현. 이름+이메일+비밀번호로 회원가입 후 회사 만들기/초대 참여 선택.
- 신규 계정은 미소속 employee로 생성. 회사 생성 시에만 사장(admin). 클라이언트의 role/company/userId로 권한 지정 불가.
- 비밀번호 15~128자, scrypt+개별 salt 해시. 로그인 5회 실패 시 10분 잠금, IP별 요청 제한.
- 웹: Secure/HttpOnly 쿠키. 네이티브: 보안 저장소의 bearer 세션. 공통 8시간 만료/로그아웃 폐기.
- 기존 테스트 계정에는 비밀번호가 없다. 기존 이메일로 새 가입하여 계정 권한을 가져갈 수 없음. 기존 사용자 비밀번호 등록 기능은 후속 작업.
- 회원가입/로그인/동시가입 충돌/잠금/웹·네이티브 토큰/로그아웃/만료 실DB 테스트 통과. 회사 생성·초대·권한 통합 테스트도 배포 서버에서 통과.
- 프런트 타입검사·회귀검사·빌드 통과. 브라우저 로그인/회원가입 입력 화면 확인, localhost 프록시 health에서 새 버전/DB ready 확인.
- Android Capacitor 플러그인 동기화 완료. 실제 기기 설치/동작 검증과 iOS 빌드는 미실행.
- 현재 localhost:5173 회원가입 화면을 열어 둠. 실제 본인 계정의 이름·이메일·비밀번호는 사용자가 입력하면 됨.

## 다음 작업/제약

- 실제 휴대폰 접속용 HTTPS API 주소/도메인 설정 필요. 현재 개발은 localhost→SSH 터널→AWS이며, 외부 HTTP 비밀번호 전송은 차단함. Secure 쿠키를 해제하지 말 것.
- 이메일 소유 확인 및 비밀번호 찾기는 미구현. 메일 서비스 설정 후 구현 필요.
- Google은 미구현/보류. 회사 변경 승인 및 사장 권한 위임도 후속 작업.
- 구현 상세: [PASSWORD_AUTH.md](PASSWORD_AUTH.md).
- 로컬 서버 소스 `/home/orora/01BO/server-work/backend`, 프런트 `/home/orora/01BO/01BO`.
- 재시작: `bash scripts/aws-tunnel.sh` 후 번들 Node로 `node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort` 실행.
- 번들 Node: `/home/orora/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

---
아래는 과거 이력이다. 과거 IP, Google 필수, 로그인 불가 안내는 현재 상태가 아니다.

# 최신 추가 완료 — 회사 생성 (2026-09-27)

- POST /companies 배포 완료. 미소속 로그인 계정만 회사 생성 가능.
- 회사명·사장 이름 검증, 회사코드 서버 생성, 현재 로그인 사용자만 사장(admin)으로 배정.
- 계정 행 잠금 + 단일 트랜잭션으로 중복 생성/동시 참여 방지. 기존 회사 소속이면409.
- 같은 이름의 회사라도 별도 회사로 생성되어 기존 회사 권한을 얻을 수 없음.
- UI: 회사 만들기·사장 / 초대 코드로 참여·직원 선택. 생성 후 설정 소속 관리로 이동하여 초대 발급.
- 신규 테스트 계정 DEMO_FOUNDER_1790496784203 으로 회사명 입력 화면 열어둠. 실제 새 회사 생성은 사용자에게 남겨둠.
- 이전 DEMO_JOIN_1790496497940 계정은 사용자가 DEMO_A 참여 완료. 소속 보존, 로그아웃만 수행.
- health version 2026-09-27-company-create.
- 백업 /home/ubuntu/o1bo-backups/20260927T081224-company-create.
- tests/company-create.js와 tests/membership.js 실DB/배포API 통과. 타입검사/프런트 빌드/회귀검사 통과.
- Google 로그인/네이티브 모바일 세션은 여전히 미구현. 현재 일회용 개발 로그인으로 온보딩 검증.

# 재개 기록 — 2026-09-27

## 현재 상태
- AWS IP 13.192.212.105. 기존 HostKeyAlias=57.182.243.64 검증으로 동일 서버 확인.
- 회사 초대 API와 사장 전용 조회 정책 AWS 반영 완료. health version 2026-09-27-membership.
- 최신 백업 /home/ubuntu/o1bo-backups/20260927T080231-membership (server.js, lib/auth.js, routes/application.js).
- 추가 DDL 없음. 기존 회사/업무 기록 보존. 사장 권한은 기존 role=admin, manager/employee는 본인 출장만 조회.
- 테스트 회사 DEMO_A(테스트 A회사), DEMO_B(테스트 B회사) 추가. 각각 사장·부장·과장·대리4명, 직원 출장3건.
- UID: DEMO_A_PRESIDENT/DIRECTOR/MANAGER/ASSOCIATE; DEMO_B도 동일 접미사.
- 부장=manager, 과장/대리=employee, 사장=admin. 직급 이름과 접근 권한은 별개이며 닉네임 변경으로 권한이 바뀌지 않음.
- 기존 COMP01/COMP02 데이터는 삭제하지 않았으므로 총 회사는4개. 테스트용 신규 회사만2개.

## 완료
- 초대 발급/목록/취소/회사 미리보기/일회성 참여. 코드 원문은 DB 미보관, SHA256만 저장. 24시간 유효.
- 이미 회사 소속인 사용자는 초대 코드로 다른 회사로 이동 불가. 같은 회사 참여도409로 권한 보존.
- 미소속 계정 세션 허용, 회사 참여 전 업무 API403. 프로필/회사 참여만 허용.
- 프런트 소속 관리·미소속 온보딩·관리자 초대 UI 연결.
- 사장만 같은 회사 전체 출장/경비/체크인 조회. 직원과 manager는 본인만. 팀 공유 플래그로 접근 우회 불가.
- 부장/과장/대리 출장3건이 테스트 A회사 사장 홈에 표시되는 브라우저 검증 완료.
- 원격 tests/membership.js 및 tests/integration.js 통과. 프런트 타입검사/회귀검사/빌드 통과(최종 UI 문구 조정 후 추가 확인 진행).

## 남은 작업
- Google 로그인: 사용자 선택은 Google만. OAuth 클라이언트 ID는 아직 없음.
- 모바일 앱임: Capacitor appId/Android applicationId com.company.o1bo. 네이티브 Google 로그인 및 안전한 모바일 세션 유지 구현/기기검증이 아직 필요함. 웹 로그인 검증을 모바일 완료로 간주하지 말 것.
- Google Cloud 웹/Android/iOS 클라이언트 설정과 Android 서명 지문, iOS 설정 필요. HTTPS API 주소 미정(현재 도메인 없음).
- Google 로그인 신규회원 생성과 기존 계정 연결을 아직 구현하지 않음. 이메일 일치만으로 기존 사장 계정 자동 연결 금지.
- 회사변경 신청/승인 워크플로는 아직 없음. 현재 안내는 관리자 문의이며 서버는 직접 변경 차단.
- 현재 사장 회사 전체 현황에 기존 role=admin을 사용. 사장 권한 임명 UI는 없음.
- 정식 앱 패키징/설치/네이티브 기기 테스트 미실행.

## 재시작
프런트 /home/orora/01BO/01BO
서버 소스 /home/orora/01BO/server-work/backend
Node /home/orora/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
bash scripts/aws-tunnel.sh
Node로 node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort
테스트 계정 코드는 SSH에서 docker exec trip-api node scripts/issue-login-code.js UID 로 발급.
초대 코드는 로그인 코드와 다름. 초대 원문은 이 문서/Git에 저장하지 않음.
