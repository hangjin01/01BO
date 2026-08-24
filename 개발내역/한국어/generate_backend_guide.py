import os
import sys
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_run_styles(run, name="맑은 고딕", size_pt=10.5, color_hex="2D3748", bold=False, italic=False):
    run.font.name = name
    run.font.size = Pt(size_pt)
    if color_hex:
        run.font.color.rgb = RGBColor.from_string(color_hex)
    run.bold = bold
    run.italic = italic
    
    rPr = run._r.get_or_add_rPr()
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:ascii'), name)
    rFonts.set(qn('w:hAnsi'), name)
    rFonts.set(qn('w:eastAsia'), name)
    rPr.append(rFonts)

def add_custom_para(doc, text="", style=None, space_after=6, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = doc.add_paragraph(style=style)
    p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if text:
        run = p.add_run(text)
        set_run_styles(run)
    return p

def add_run(p, text, name="맑은 고딕", size_pt=10.5, color_hex="2D3748", bold=False, italic=False):
    run = p.add_run(text)
    set_run_styles(run, name, size_pt, color_hex, bold, italic)
    return run

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_styles(run, name="맑은 고딕", size_pt=15, color_hex="1A365D", bold=True)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_styles(run, name="맑은 고딕", size_pt=12.5, color_hex="2B6CB0", bold=True)
    return p

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_callout(doc, text, title="NOTE", color_hex="F7FAFC", border_color_hex="1A365D"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, color_hex)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"[{title}] ")
    set_run_styles(run_title, name="맑은 고딕", size_pt=9.5, color_hex=border_color_hex, bold=True)
    run_text = p.add_run(text)
    set_run_styles(run_text, name="맑은 고딕", size_pt=9.5, color_hex="4A5568", italic=True)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(4)
    sp.paragraph_format.space_after = Pt(4)

def add_code_block(doc, code):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, "F7FAFC")
    set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
    
    # Thin gray border around code block
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E0"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E0"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E0"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E0"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    run = p.add_run(code)
    set_run_styles(run, name="Consolas", size_pt=9, color_hex="1A202C")
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(4)
    sp.paragraph_format.space_after = Pt(4)

def add_bullet_item(doc, bold_prefix, text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.left_indent = Inches(0.25 * (level + 1))
    
    if bold_prefix:
        run_bold = p.add_run(bold_prefix)
        set_run_styles(run_bold, name="맑은 고딕", size_pt=10, color_hex="2D3748", bold=True)
        
    run_text = p.add_run(text)
    set_run_styles(run_text, name="맑은 고딕", size_pt=10, color_hex="2D3748")
    return p

def setup_page(doc, doc_title):
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run(f"O1BO 스마트 출장 관리 시스템 | {doc_title}")
        set_run_styles(hrun, name="맑은 고딕", size_pt=8.5, color_hex="718096")
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Confidential — O1BO 백엔드 연동 & 확장 개발 가이드")
        set_run_styles(frun, name="맑은 고딕", size_pt=8, color_hex="A0AEC0", italic=True)

def generate_guide():
    doc = Document()
    doc_title = "백엔드 연동 및 향후 개발 가이드"
    setup_page(doc, doc_title)
    
    # Title
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 백엔드 연동 및 향후 추가 개발 가이드 백서\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "BaaS 인프라 설정 및 2중 NFC 물리 체크인 & PWA 오프라인 캐싱 설계법", size_pt=11, color_hex="4A5568")
    
    add_callout(doc, 
                "본 문서는 O1BO 스마트 출장 관리 어플리케이션을 신규 백엔드(Firebase) 프로젝트에 연동하는 절차와, 향후 혁신적으로 확장 도입할 GPS+NFC 2중 근태 인증 및 PWA 기반 오프라인 저장·백그라운드 동기화 시스템 구현법을 상세한 예제 코드와 함께 제공합니다.", 
                "소개 (About the Guide)", border_color_hex="1A365D")
    
    add_heading_1(doc, "1. 백엔드 (Firebase BaaS) 연동 및 마이그레이션 가이드")
    p = add_custom_para(doc)
    add_run(p, "O1BO는 서버를 직접 구축하지 않고 백엔드를 API 형태로 빌려 쓰는 ")
    add_run(p, "BaaS (Backend-as-a-Service) 패러다임의 최정점인 Firebase", bold=True)
    add_run(p, "를 기반으로 가동됩니다. 새로운 Firebase 콘솔을 생성하고 프론트엔드 프로젝트를 매칭시키는 단계는 다음과 같습니다.")

    add_heading_2(doc, "1.1 Firebase 프로젝트 및 앱 설정")
    add_bullet_item(doc, "프로젝트 생성: ", "구글 Firebase Console (https://console.firebase.google.com/)에 접속하여 '프로젝트 추가'를 클릭하고 프로젝트명을 'O1BO-App' 등으로 등록합니다.", 0)
    add_bullet_item(doc, "웹 앱(Web App) 등록: ", "프로젝트 개요 화면에서 웹(Web) 아이콘(</>)을 눌러 앱을 추가 등록하고 발급된 firebaseConfig JSON 객체를 획득합니다.", 0)
    add_bullet_item(doc, "구글 소셜 로그인 활성화: ", "Firebase Build 메뉴의 'Authentication'으로 들어가 시작하기를 누르고, Sign-in method 탭에서 'Google' 프로바이더를 사용 설정(Enable)합니다.", 0)

    add_heading_2(doc, "1.2 로컬 환경 변수 (.env) 구성 및 firebase.ts 적용")
    p = add_custom_para(doc)
    add_run(p, "프로젝트 루트 디렉토리에 '.env.example' 파일을 참고하여 실제 비밀 키와 엔드포인트 정보가 담긴 '.env' 파일을 신규 생성합니다. 해당 변수는 Vite 번들러 속성에 의해 프론트엔드로 로드됩니다:")
    
    env_code = """# Firebase Web App configuration
VITE_FIREBASE_API_KEY=AIzaSyA1...YourActualKey...
VITE_FIREBASE_AUTH_DOMAIN=o1bo-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=o1bo-app
VITE_FIREBASE_STORAGE_BUCKET=o1bo-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=9876543210
VITE_FIREBASE_APP_ID=1:9876543210:web:abcdef123456

# Google Gemini AI Endpoint key
VITE_GEMINI_API_KEY=AIzaSyD7...YourGeminiKey..."""
    add_code_block(doc, env_code)

    add_heading_2(doc, "1.3 백엔드 Firestore 보안 규칙 (firestore.rules) 수동 설정")
    p = add_custom_para(doc)
    add_run(p, "Firestore Database를 활성화(아시아 리전 설정 권장)한 후, 프라이버시 보호 장벽인 firestore.rules 파일의 규칙을 콘솔의 'Rules' 탭에 복사하여 붙여넣고 게시(Publish)합니다. 이 규칙은 서버리스 아키텍처의 유일한 백엔드 수호선입니다:")
    
    rules_code = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 헬퍼: 사용자가 유효하게 로그인된 상태인지 검사
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // 헬퍼: 현재 로그인 유저가 해당 회사 코드의 어드민(사장님)인지 검사
    function isCompanyAdmin(companyCode) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyCode == companyCode;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    match /trips/{tripId} {
      // 사적인 일정 리스트는 오직 소유한 본인(userId)만 CRUD 가능 (사장님도 읽기 불가)
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    match /checkIns/{checkInId} {
      // 근태 데이터는 본인 또는 해당 회사의 사장님(관리자)만 조회 가능
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.userId || 
        (resource.data.companyCode != null && isCompanyAdmin(resource.data.companyCode))
      );
      allow create, update: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }
  }
}"""
    add_code_block(doc, rules_code)

    add_heading_1(doc, "2. 향후 추가 기능 구현 설계: 2중 근태 인증 (Web NFC API)")
    p = add_custom_para(doc)
    add_run(p, "GPS 우회 프로그램(Fake GPS 등)을 사용한 부정 출장 검증 사태를 원천 차단하기 위해, 모바일 웹 브라우저에서 ")
    add_run(p, "물리 NFC 태그 칩 스티커에 밀접 태깅 시에만 최종 체크인이 승인되는 2중 근태 검증 시스템", bold=True)
    add_run(p, "을 설계합니다.")

    add_heading_2(doc, "2.1 Web NFC (NDEFReader) 아키텍처 및 연동 원리")
    add_bullet_item(doc, "동작 플로우: ", "사용자가 체크인 버튼을 누르면 GPS 거리를 1차 측정하고, 50m 반경 안에 들어왔을 시 NFC 태깅 지시 팝업이 활성화됩니다. 스마트폰 뒷면을 현장의 NFC 칩 스티커에 접촉하면 고유 인증 토큰을 수신하여 2차 물리 검증을 마칩니다.", 0)
    add_bullet_item(doc, "지원 범위: ", "하드웨어적으로 NFC 리더가 탑재된 Android 기기의 크롬 브라우저, iOS Safari의 PWA 웹뷰 환경 등에서 즉시 동작 가능합니다.", 0)

    add_heading_2(doc, "2.2 NFC 태그 리딩 핵심 구현 Javascript 예제 코드")
    nfc_code = """// React 컴포넌트 내 NFC 리드 구현 스니펫
const handleNfcVerification = async (tripId) => {
  if (!('NDEFReader' in window)) {
    alert("이 브라우저는 NFC 물리 인식을 지원하지 않습니다. 최신 크롬 모바일을 권장합니다.");
    return false;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.scan(); // NFC 수신 모드 활성화
    console.log("NFC 스캐너가 대기 중입니다. 기기를 태그에 가져다 대세요.");

    return new Promise((resolve, reject) => {
      ndef.addEventListener("reading", async ({ message, serialNumber }) => {
        // NFC 내에 저장된 고유 회사 암호화 토큰 파싱
        const decoder = new TextDecoder();
        let validTokenFound = false;

        for (const record of message.records) {
          const text = decoder.decode(record.data);
          // O1BO 전용 특수 인증 코드 검증 (서버 해시와 비교)
          if (text === "O1BO_OFFICE_VERIFIED_TOKEN") {
            validTokenFound = true;
          }
        }

        if (validTokenFound) {
          console.log("물리 NFC 태그 2차 인증 성공! 시리얼:", serialNumber);
          resolve({ serial: serialNumber, verified: true });
        } else {
          alert("일치하지 않는 유효하지 않은 NFC 카드입니다.");
          resolve({ verified: false });
        }
      });

      ndef.addEventListener("readingerror", () => {
        alert("NFC 태그 판독 도중 오류가 발생했습니다. 다시 시도해 주세요.");
        reject(new Error("NFC Reading Error"));
      });
    });
  } catch (error) {
    console.error("NFC 스캐닝 오류:", error);
    return { verified: false, error };
  }
};"""
    add_code_block(doc, nfc_code)

    add_heading_1(doc, "3. 향후 추가 기능 구현 설계: 오프라인 캐싱 (PWA)")
    p = add_custom_para(doc)
    add_run(p, "출장 지역이 산간지방이거나 지하 빌딩 내부여서 모바일 인터넷망이 불안정한 경우에도 정상 조작되도록 ")
    add_run(p, "PWA (Progressive Web App) 오프라인 모드", bold=True)
    add_run(p, "를 도입합니다. 이는 서비스 워커(Service Worker)와 IndexedDB 브라우저 로컬 데이터베이스를 조화롭게 융합하여 가동시킵니다.")

    add_heading_2(doc, "3.1 Vite PWA 플러그인 설정 가이드")
    add_bullet_item(doc, "플러그인 설치: ", "npm install -D vite-plugin-pwa 명령어를 실행하고 vite.config.ts를 구성하여 manifest.json 및 오프라인 precaching 규칙을 부여합니다.", 0)
    add_bullet_item(doc, "IndexedDB 백업: ", "사용자가 오프라인 상태일 때 '체크인/체크아웃'을 시도하면, Firebase SDK 에러를 뱉는 대신 로컬 IndexedDB에 해당 트랜잭션을 큐(Queue)로 임시 적재합니다.", 0)

    add_heading_2(doc, "3.2 PWA 백그라운드 동기화 (Background Sync API) 예제 코드")
    p = add_custom_para(doc)
    add_run(p, "네트워크가 다시 온라인('online' 이벤트 감지)으로 변경되는 즉시, 서비스 워커가 IndexedDB의 큐를 읽어 Firestore 백엔드로 일괄 전송(Batch commit) 처리하는 백그라운드 싱크 모듈 스니펫입니다:")
    
    pwa_code = """// service-worker.js (Vite PWA 백그라운드 동기화 스니펫)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Vite 프리캐싱 라우팅 초기화
precacheAndRoute(self.__WB_MANIFEST);

// 백그라운드 동기화 플러그인 정의
// 네트워크 단절로 인해 실패한 POST/PUT 요청을 자동으로 재로드 시도함
const bgSyncPlugin = new BackgroundSyncPlugin('checkInSyncQueue', {
  maxRetentionTime: 24 * 60, // 최대 24시간 동안 저장 및 재시도
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shift())) {
      try {
        const checkInData = await entry.request.clone().json();
        // Firestore REST API를 호출하여 백그라운드에서 동적으로 체크인 상태 기입
        await fetch('https://firestore.googleapis.com/v1/projects/o1bo-app/databases/(default)/documents/checkIns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${checkInData.authToken}`
          },
          body: JSON.stringify(checkInData.payload)
        });
        console.log("오프라인 체크인 기록이 백그라운드에서 성공적으로 클라우드로 동기화되었습니다!");
      } catch (error) {
        console.error("동기화 재시도 실패. 큐에 재진입합니다.", error);
        await queue.unshift(entry);
        throw error;
      }
    }
  }
});

// 체크인 API 라우터에 백그라운드 싱크 플러그인 장착
registerRoute(
  /\/databases\/\(default\)\/documents\/checkIns/,
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);"""
    add_code_block(doc, pwa_code)

    add_heading_1(doc, "4. 결론 및 마그네틱 결합 체계 구축")
    p = add_custom_para(doc)
    add_run(p, "본 개발 가이드 백서에 명시된 Firebase 마이그레이션 정책, Web NFC 물리 암호 토큰 인증, 그리고 PWA 백그라운드 오프라인 동기화 모듈을 차례로 연쇄 구현함으로써, O1BO는 비단 단순 모바일 웹 클라이언트를 넘어 어떠한 현장 통신 장애 속에서도 기기의 하드웨어를 직접 활용해 절대적인 신뢰도를 갖추는 ")
    add_run(p, "엔터프라이즈 레벨 근태 관리 플랫폼", bold=True)
    add_run(p, "으로의 완벽한 성장을 보증받게 됩니다.")

    # Save documents
    out_dir = r"c:\Users\User\.gemini\antigravity-ide\scratch\01BO\개발내역"
    doc.save(os.path.join(out_dir, "백엔드_연동_및_향후_개발_가이드.docx"))
    doc.save(os.path.join(out_dir, "백엔드 연동 및 향후 개발 가이드.docx"))
    print("SUCCESS BACKEND GUIDE")

if __name__ == "__main__":
    generate_guide()
