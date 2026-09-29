# 제로보 관리형 에이전트 구성 (2026-09-29)

## 실행 구조

O1BO 앱 → 로그인된 AWS API → OpenAI Agents API의 제로보 → dispatch_zerobo 함수 요청 → AWS 권한 검사 및 DB 트랜잭션 → 앱에 실제 결과 표시.

OpenAI는 대화 해석과 작업 선택을 맡고, 기존 AWS 서버(57.183.12.111)는 인증·회사별 접근 통제·Oracle 저장을 맡는다. 실행 환경은 `environment: {type: "none"}`이며 별도 샌드박스나 신규 호스팅 서버는 필요 없다. OpenAI API 사용량은 발생한다. DB 암호나 SSH 키를 에이전트에 제공하지 않는다.

## 텍스트 정의

원본은 `/home/orora/01BO/server-work/backend/config/zerobo-instructions.md`다. 한국어 지침을 수정한 뒤 서버에 파일을 반영하고, 서버 프로젝트에서 다음을 실행하면 기존 에이전트가 갱신된다.

```sh
docker exec -e O1BO_AGENT_ID_FILE=/app/.private/managed-agent.json trip-api node scripts/create-managed-agent.js --update
```

저장된 정의 이름은 ‘제로보 · O1BO 출장 도우미’, 모델은 gpt-6-astra, reasoning low다. 앱 요청마다 이 정의와 업무 지침으로 새 세션을 만든다. 기존 세션을 다른 사용자에게 재사용하지 않는다.

## 연결 범위

- 본인 출장 조회, 사장만 같은 회사 전체 조회.
- 기존 일정 시간·제목 변경과 사실 기반 일보 저장은 기존 실행기를 사용한다.
- 새 장소가 필요한 등록·변경은 장소 검색 공급자 연결 전까지 저장되지 않는다.
- 이메일 공급자는 미연결이며 발송하지 않는다.
- 사용자가 요청한 작업 하나를 서버에서 실행한다. 임의 SQL·셸·웹 검색 도구는 제공하지 않는다.
- 날짜 기준은 Asia/Tokyo. 예정·방문 인증·경비를 구분하고 성과를 만들어내지 않는다.

## 대화와 재시도

AWS는 같은 사용자·회사·역할·conversationId의 최근 8개 결과만 다음 요청에 포함한다. 역할 변경 후 과거 권한으로 받은 결과가 다시 입력되지 않도록 필터링한다. 앱을 완전히 새로 열면 새 대화가 시작된다. 장기 대화 복원과 백그라운드 작업 큐는 아직 구현하지 않았다.

AI 작업 선택은 약 43초 제한이며 시간 초과 시 DB 작업을 실행하지 않는다. 저장된 요청은 같은 requestId 재시도 시 원래 결과를 돌려준다. DB 저장과 요청 기록은 같은 트랜잭션이다. 결과는 커밋 이후에만 OpenAI 도구 결과로 전달한다. 결과 전달 실패가 이미 성공한 DB 작업을 취소하거나 재실행시키지 않는다. 앱에는 서버의 확정 결과를 표시한다.

## 비밀 설정

키는 AWS `/home/ubuntu/.config/o1bo/openai.env`(600), 저장된 에이전트 ID는 서버 backend/.private/managed-agent.json(600)에 있다. Compose api의 env_file로 키를 로드한다. 키를 문서·프런트·채팅에 넣지 않는다.

`O1BO_AGENT_MODE=responses`를 API 환경에 설정하면 기존 Responses 작업 분류기로 되돌릴 수 있다. 키나 Oracle 설정을 출력하지 말 것.

## 남은 외부 연결

장소 검색 공급자, 이메일 발송 공급자, 앱 운영용 HTTPS 주소, 실제 모바일 기기 검증은 별도 작업이다. Google 로그인도 보류 상태다.

## 공식 근거

- https://developers.openai.com/api/docs/guides/agents-api/configuration
- https://developers.openai.com/api/docs/guides/agents-api/tools/functions

## 검증 결과

실제 OpenAI 관리형 세션으로 노진아 본인 조회200, 김행진 회사 조회200, 노진아 회사 조회403, 이메일 미연결 안내200을 확인했다. 동일 요청 재시도 결과도 일치했다. 임시 로그인/요청 기록을 정리했으며 기존 출장 전체가 검사 전후 동일했다. 일정 쓰기·일보 저장은 공급자 대역을 사용한 실제 Oracle 회귀검사로 검증했다.
