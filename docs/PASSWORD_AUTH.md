# 이메일/비밀번호 인증 — 2026-09-28

회원가입은 이름·이메일 아이디·비밀번호를 받는다. 가입 직후 로그인 상태에서 회사 만들기(사장) 또는 초대 참여(직원)를 선택한다. 회사코드는 로그인 자격 증명이 아니다.

## DB와 API

- AUTH_CREDENTIALS: USER_ID(PK, USERS 참조), LOGIN_ID(UNIQUE), PASSWORD_HASH, FAILED_ATTEMPTS, LOCKED_UNTIL, CREATED_AT.
- POST /api/auth/register: email, password, name, sessionMode(web/native).
- POST /api/auth/login: email, password, sessionMode(web/native).
- GET /api/auth/me, POST /api/auth/logout으로 세션 복원/폐기.
- 이메일은 소문자/공백 정규화. 기존 USERS 이메일로 신규 계정 생성/권한 자동 연결은 거부한다.
- 비밀번호 15~128 Unicode 문자, 최대512 UTF-8 바이트. scrypt N=32768,r=8,p=3, random16-byte salt, 64-byte key. 해시만 DB 저장.
- KDF 동시 처리 최대2개. IP 요청 제한과 DB 실패5회/10분 잠금 적용.

## 모바일/웹

웹은 8시간 Secure/HttpOnly/SameSite=Lax 쿠키를 사용한다. 모바일은 같은 서버 세션의 토큰을 iOS Keychain/Android 보안 저장소 플러그인으로 보관하고 Bearer 헤더로 전송한다. 세션 DB에는 토큰 SHA256만 저장한다. 자동 갱신은 없으며 만료 후 재로그인한다.

실제 모바일은 HTTPS VITE_API_BASE_URL이 필요하다. 현재 도메인/HTTPS 미설정이므로 휴대폰 실사용 연결은 아직 준비되지 않았다. localhost 개발 미리보기는 SSH 터널을 쓴다. Android 플러그인 동기화만 확인했으며 실제 기기와 iOS 검증은 남아 있다.

## 검증/남은 범위

backend/tests/password-auth.js는 가입, 로그인, 해시와 salt, 권한 입력 무시, 중복/기존 계정 보호, 잠금 해제, 웹·native 세션, 만료, 로그아웃, 동시 가입 롤백을 실DB/API로 검증한다. 테스트 데이터는 해당 테스트가 만든 고유 이메일만 정리한다.

이메일 인증/비밀번호 재설정/기존 계정의 비밀번호 등록 UI는 미구현이다. 기본 비밀번호는 생성하지 않았다. Google 로그인은 추후 진행한다.
