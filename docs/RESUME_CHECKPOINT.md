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
