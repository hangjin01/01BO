# NFC + GPS 현장 확인 — 2026-10-04

## 사용자 승인 범위
회사 설정 켜기/끄기, 현장에 고정한 스티커, NFC와 GPS 확인, 사장만 직원 현황 열람. 개인 휴대 스티커는 방문 증거가 아님. 일반 정적 태그/휴대폰 GPS는 복제·위치 조작을 완전히 방지하지 못함. 로그인 MFA나 보안 태그의 암호학적 진위 확인으로 설명하지 않는다.

## 구현
- 회사별 COMPANY_NFC_POLICY, 사장만 수정. 기본 끄기. 직원은 조회만 가능. 휴대폰 localStorage로 보안 정책을 결정하지 않음.
- 기존 NFC_TAGS를 사용해 회사/출장/일정에 태그 연결. 현재 1개 태그는 1개 일정에 연결. 범용 현장 재사용은 추후 별도 현장 테이블로 확장.
- 설정 → 출장/방문 일정 선택 → 빈 NDEF 스티커 기록·등록 → 회사 NFC 켜기. 태그가 없는 일정은 GPS 방식. 해제는 정책을 끈 뒤 가능.
- 태그 내용은 무작위 o1bo:토큰, MIME application/vnd.o1bo.tag. 서버에는 SHA256만 저장. 스티커 재기록 시 이전 연결은 자동 해제되지 않으므로 같은 스티커를 여러 일정에 재등록하지 말 것.
- 체크인/체크아웃 버튼 모두 매 요청 서버 정책 확인. 필수 현장에서는 수동/태그 누락 요청 서버 차단.
- NFC_CHALLENGES: 사용자/회사/출장/일정/동작에 묶인 60초 토큰. 체크인 기록과 같은 트랜잭션에서 소비. 중복 요청은 출장 행 잠금 및 상태 순서 검사.
- 등록 태그, 목적지 반경50m, GPS 정확도50m 이내, 위치 측정60초 이내 검사. 이는 클라이언트 제공 GPS의 유효성 검사이며 기기 증명/위조 방지는 아님.
- CHECK_INS.VERIFICATION_METHOD: nfc_gps / gps / unverified. 사장 화면에 방법 표시. 새 기록에는 태그 원문 저장하지 않음. 과거 기록은 이전 기록으로 표시.
- Android 로컬 Capacitor O1boNfc 플러그인: 전경 읽기/쓰기, 45초 제한, 취소/백그라운드 정리. 웹은 NDEFReader 지원 기기에서만 사용. 빈 NDEF 형식 스티커 필요.
- 네이티브 위치는 기존 Capacitor Geolocation 사용, Android 정확/대략 위치 권한 추가.

## 검증과 배포
AWS 3.113.249.124, 기존 api 파일 백업 /home/ubuntu/o1bo-backups/20261004-nfc/before.tgz.
추가 migration scripts/migrate-nfc.js 적용, tests/nfc.js 실제 Oracle 검사 통과 후 api 재시작/health OK DB ready.
검사: 사장 전용 설정, 태그 없는 켜기 차단, 회사 격리, NFC 필수 체크인/아웃, 미등록 태그/GPS/시간 오류, 동시 중복 제출, 사장만 다른 직원 조회, GPS fallback. 임시 회사/사용자/출장 전부 제거. 실제 회사 설정 켜지 않음. 실제 메일/위치 전송 없음.
프런트 타입 검사, 회귀 검사, Vite 빌드 및 Android debug APK 빌드 통과. APK는 android/app/build/outputs/apk/debug/app-debug.apk. 실기기 인식은 별도 검증 필요.

## 실기기 전제 및 다음 단계
- Android 설치 앱은 HTTPS API 주소가 반드시 필요. 현재 localhost 개발 프런트→SSH 터널은 PC용이며 그대로 설치해서 서버에 연결되지 않음.
- 기존 Gmail OAuth 콜백 localhost도 휴대폰용 HTTPS 구성 필요.
- 실제 스티커 쓰기/읽기, NFC 꺼짐/권한 거부, 실외 GPS, 만료/취소 후 재시도, 직원 체크인→사장 화면 새로고침 실기기 검증은 남음.
- 사장 화면은 조회/새로고침 방식. 푸시 알림·백그라운드 추적 없음.
- GPS/NFC 실패 시 성공 처리하지 않는다. 별도 사유 제출→사장 수동 승인 워크플로는 후속 작업이며 아직 미구현.
- 발표 준비 우선순위: HTTPS/모바일 OAuth → 안드로이드 실기기 NFC/GPS/Word 공유 → 예외 승인 → 전체 시연 회귀.
