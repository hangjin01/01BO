# 최신 API — OpenAI 전환

서버 IP `18.177.154.126`, health `2026-09-28-openai-agent`. 제로보·OCR·AI 보고서의 제공자를 OpenAI로 변경했다. DB 스키마 변경 없음. OPENAI_API_KEY 미설정으로 실제 AI 실행은 아직 불가하다. [연결 상세](ZEROBO_AGENT.md).

# 최신 API — 2026-09-28 제로보

`18.177.154.126`에 `2026-09-28-zerobo-agent` 배포. AGENT_REQUESTS/AGENT_REPORTS 추가, API 컨테이너만 재시작. [제로보 구현/연결 제약](ZEROBO_AGENT.md) 참고. Gemini·장소·메일 외부 설정은 미완료다.

# 2026-09-28 최신 상태

현재 IP는 `18.177.154.126`입니다. 이메일/비밀번호 회원가입·로그인, 회사 생성·초대·사장 전용 조회가 배포되었습니다. API 버전은 `2026-09-28-password-auth`, DB 상태는 ready입니다. AUTH_CREDENTIALS 테이블을 추가했으며 기존 데이터는 유지했습니다.

[최신 재개 기록](RESUME_CHECKPOINT.md)과 [인증 구현](PASSWORD_AUTH.md)을 우선 참고하세요. 아래는 이전 배포 기록으로, 이전 IP·로그인 방식 설명이 포함됩니다.

# AWS 반영 결과 및 실행 방법 — 2026-09-26

## 완료된 반영

- 서버: `ubuntu@16.76.123.239`, 호스트 `ip-172-31-30-140`.
- SSH 키: `/home/orora/aws/japan-app-key.pem`. 새 IP의 호스트 키는 기존 `57.182.243.64`에 저장된 키와 StrictHostKeyChecking으로 대조했다.
- 실제 운영 경로: `/home/ubuntu/japan-trip-app`. `/home/ubuntu/01BO_Server`는 실행 소스가 아니며 수정하지 않았다.
- API 컨테이너 `trip-api`만 교체·재시작했다. Oracle 컨테이너와 기존 업무 테이블은 유지했다.
- 인증 없는 업무 API는 401을 반환한다. 일회용 코드 로그인·로그아웃, 회사/사용자 접근 제한, 출장 CRUD·보고서 저장, 경비 CRUD 중 생성/조회/삭제, 서버 GPS 거리 계산, 미등록 NFC 거부를 반영했다.
- `/api/health`는 실제 DB 조회 성공 시 database:ready를 반환한다. 배포 식별자는 `2026-09-25`이다.
- 세션은 `Secure; HttpOnly; SameSite=Lax; Path=/api`, 8시간 만료. DB에는 세션 토큰과 로그인 코드의 SHA-256 해시만 저장한다.
- 도메인 없는 현재 상태에서 로그인은 SSH 터널의 localhost로 진행한다. 이는 SSH 운영자가 코드를 발급하는 개발용 접근 방식이며 Google/OAuth 로그인 완성을 의미하지 않는다.
- 재시작마다 npm install을 실행하던 Compose command를 node server.js로 변경했다. 새 의존성은 추가하지 않았다.

## 데이터 보존 검증

| 테이블 | 이전 | 이후 | 전체 행 해시 비교 |
|---|---:|---:|---|
| COMPANIES | 2 | 2 | 동일 |
| USERS | 6 | 6 | 동일 |
| TRIPS | 5 | 5 | 동일 |
| CHECK_INS | 7 | 7 | 동일 |
| EXPENSES | 9 | 9 | 동일 |

신규 테이블: APP_SESSIONS, LOGIN_CODES, APP_TEAMS, COMPANY_INVITES, NFC_TAGS. 기존 테이블 DDL은 변경하지 않았다. 테스트는 고유한 TEST_ 접두사 데이터로 수행했고 finally 절에서 해당 테스트 회사 및 연결 데이터를 정리했다.

## 프런트 데이터 연결 변경 — 2026-09-26

- 로컬 테스트 계정 로그인과 자동 복원, 샘플 출장/팀 데이터, 로컬 업무 데이터 저장 분기를 제거했다. 기존 브라우저 샘플 데이터는 서버로 업로드하지 않으며 사용하지 않는다.
- 시작 시 항상 `/auth/me`로 세션을 확인한다. 미로그인은 로그인 화면, 연결 실패는 오류로 표시한다.
- `/trips`, `/users`, `/check-ins`, `/expenses` 응답으로 개인·팀·관리자 화면 데이터를 구성한다. 팀 변경 시 다시 조회한다.
- 업무 저장 응답에 실제 저장 레코드가 없으면 오류로 처리하며, 가짜 성공 데이터를 만들지 않는다.
- 기존 로컬 테스트 세션을 쓰던 경우, 아래 방법으로 선택한 서버 계정의 일회용 코드를 발급해 로그인해야 한다.
- 브라우저에서 사용자가 선택한 COMP01 관리자 계정 로그인 성공을 확인했다. 서버 팀원 2명·공유 출장 1건, 관리자 화면의 회사 출장 4건·경비 8건이 표시되었다. 이는 기존 Oracle 데이터이며 프런트 샘플을 DB로 옮긴 것이 아니다.

## 로컬에서 연결

프로젝트 폴더 `/home/orora/01BO/01BO`에서 터미널 두 개를 사용한다.

첫 번째 터미널:

```bash
bash scripts/aws-tunnel.sh
```

두 번째 터미널:

```bash
npm run dev
```

브라우저는 `http://localhost:5173`을 연다. `/api` 요청을 Vite가 `127.0.0.1:3000`으로 프록시하며 SSH 터널이 AWS의 80번 포트로 전달한다. `.env.local`에 예전 IP의 VITE_API_BASE_URL이 있으면 `/api`로 수정하거나 해당 항목을 제거한 뒤 Vite를 재시작한다. 포트 3000 또는 5173을 다른 프로그램이 사용하면 충돌을 먼저 해결한다.

이 환경의 시스템 Node에서 SQLite 심볼 오류가 발생하면 아래 번들 런타임으로 개발 서버를 실행할 수 있다. 이 경로는 Codex 설치 상태에 따라 바뀔 수 있다.

```bash
/home/orora/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort
```

Chrome 계열/Firefox의 localhost 예외를 이용하되 Secure 쿠키를 끄지 않는다. Safari 및 실제 모바일 배포는 HTTPS 설정 후 검증해야 한다. 참고: [MDN Secure 쿠키](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).

### 로그인 코드 발급

SSH로 서버에 접속한 운영자가 기존 계정의 USER_ID를 지정하여 발급한다. 이메일이나 임의 UID로 계정을 자동 생성하지 않는다.

```bash
ssh -i /home/orora/aws/japan-app-key.pem -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o HostKeyAlias=57.182.243.64 ubuntu@16.76.123.239

docker exec trip-api node scripts/issue-login-code.js USER_ID
```

출력된 코드를 앱의 ‘일회용 로그인 코드’ 입력란에 붙여 넣는다. 코드는 10분 동안 한 번만 사용할 수 있고, 로그아웃은 서버 세션을 삭제한다. 코드를 Git, 문서, 공유 로그에 저장하지 않는다.

USER_ID를 모르면 서버에서 다음과 같이 기존 UID·역할·회사만 조회할 수 있다. 올바른 계정을 선택하며 다른 사용자의 계정으로 임의 로그인하지 않는다.

```bash
docker exec trip-api node -e 'const d=require("./db");(async()=>{console.table((await d.executeQuery("SELECT UID_VAL, ROLE, COMPANY_CODE FROM USERS ORDER BY UID_VAL")).rows);await(await d.initializePool()).close(0)})().catch(()=>process.exit(1))'
```

IP가 다시 바뀌면 `O1BO_AWS_HOST=새IP bash scripts/aws-tunnel.sh`로 실행한다. 호스트 키가 달라지면 검증을 생략하지 말고 다른 서버인지 확인한다.

## 백업과 복구

서버 백업:

- `/home/ubuntu/o1bo-backups/20260925-before-api-update/source.tar.gz`
- `/home/ubuntu/japan-trip-app/backend/.backups/20260925-before-api-update.json`

첫 번째는 이전 소스·Compose·초기화 SQL이다. 두 번째는 단일 읽기 전용 트랜잭션에서 추출한 기존 5개 업무 테이블과 컬럼 정보의 JSON 스냅샷이다. Oracle Data Pump/물리 백업이나 실제 재해복구 훈련을 대체하지 않는다. 파일 권한은 비공개이며 자격증명과 개인정보를 포함할 수 있으므로 공유하지 않는다.

이번 배포는 health 실패 시 이전 API/Compose를 복구하도록 구성했다. 실제 배포는 health에 통과했으므로 복구를 실행하지 않았다. 이전 소스는 인증이 없는 버전이므로 수동 롤백 시에는 외부 접근을 제한하고 사용해야 한다. 새 테이블을 삭제하는 롤백은 자동 실행하지 않는다.

로컬 수정 서버 코드: `/home/orora/01BO/server-work/backend`. 배포 스크립트: `/home/orora/01BO/server-work/deploy.sh` (최초 배포의 원본 해시를 검사하므로 그대로 재실행하면 중단될 수 있음).

## 검증 결과와 한계

- 실제 운영 API와 Oracle에 대해 일회용 코드 재사용 거부, Secure 쿠키, 신원 필드 위조 방어, 출장 생성/수정/재조회/삭제, 긴 한글·일본어 CLOB 보고서, 경비 저장/집계/삭제, GPS 범위 밖 미인증, 미등록 NFC 거부, 체크아웃 중복 거부, 회사 간 조회/수정/삭제 차단, 임의 권한 상승 거부, 로그아웃을 검증했다.
- 로컬 Vite 프록시를 거친 health 성공과 비인증 trips 401을 확인했다.
- 프런트 타입 검사·회귀 테스트·빌드 통과. JS 번들 500kB 초과 경고는 남아 있다.
- 최종 Secure 쿠키의 실제 브라우저 로그인, 휴대폰 NFC/위치, 이메일 수신, 실제 Gemini 생성은 아직 검증하지 않았다.

## 남은 설정

1. Gemini: 서버의 GEMINI_API_KEY가 비어 있다. 현재 AI 호출은 503 미설정 응답. 과거 노출 키를 재사용하지 않는다.
2. 이메일: `/trips/:id/report/email`은 입력/권한을 확인하고 503 미설정 응답을 반환한다. 실제 메일 공급자 연동 코드는 후속 구현이 필요하다.
3. 도메인/HTTPS 및 OAuth: 운영 공개 로그인, 프록시 신뢰 범위, 허용 origin, 모바일 연결 설정 후 검증해야 한다.
4. 현장 NFC 태그: NFC_TAGS에 실제 태그 등록이 필요하다. 태그 등록 UI/관리 API는 아직 없다.
5. 영수증 파일 보관, 다중 통화·실시간 환율, 팀 목록 동기화와 오프라인 재전송은 후속 작업이다.
6. DB 포트 1521의 호스트 바인딩과 AWS 보안 그룹은 변경하지 않았다. 인터넷 접근 허용 여부는 별도 확인이 필요하다.
