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
    
    # Enable Asian characters styling (Malgun Gothic) in MS Word
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

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_styles(run, name="맑은 고딕", size_pt=11, color_hex="319795", bold=True)
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
    p.paragraph_format.line_spacing = 1.15
    run_title = p.add_run(f"[{title}] ")
    set_run_styles(run_title, name="맑은 고딕", size_pt=9.5, color_hex=border_color_hex, bold=True)
    run_text = p.add_run(text)
    set_run_styles(run_text, name="맑은 고딕", size_pt=9.5, color_hex="4A5568", italic=True)
    
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

def add_styled_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Style Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_shading(hdr_cells[i], "1A365D")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            set_run_styles(run, name="맑은 고딕", size_pt=10, color_hex="FFFFFF", bold=True)
            
    # Add and Style Data Rows
    for r_idx, row_data in enumerate(rows):
        row = table.add_row()
        for i, val in enumerate(row_data):
            cell = row.cells[i]
            cell.text = str(val)
            # Alternating background shading
            bg_color = "F7FAFC" if r_idx % 2 == 1 else "FFFFFF"
            set_cell_shading(cell, bg_color)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            
            # Alignments: columns with short codes or numbers are centered
            if i == 0 or len(str(val)) <= 8:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            for run in p.runs:
                set_run_styles(run, name="맑은 고딕", size_pt=9.5, color_hex="2D3748")
                
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(6)
    sp.paragraph_format.space_after = Pt(6)

def setup_page(doc, doc_title):
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header setup
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run(f"O1BO 스마트 출장 관리 시스템 | {doc_title}")
        set_run_styles(hrun, name="맑은 고딕", size_pt=8.5, color_hex="718096")
        
        # Footer setup
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Confidential — O1BO 스마트 출장 보고 시스템 2026-1학기")
        set_run_styles(frun, name="맑은 고딕", size_pt=8, color_hex="A0AEC0", italic=True)

def create_semester_summary_doc(output_path):
    """File 1: 2026-1학기 진행 내용.docx"""
    doc = Document()
    doc_title = "2026-1학기 개발 종합 보고서"
    setup_page(doc, doc_title)
    
    # Title
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "2026학년도 1학기 O1BO 프로젝트 개발 진행 보고서\n", size_pt=20, color_hex="1A365D", bold=True)
    add_run(p_title, "스마트 출장 일정 관리 및 실시간 근태 확인 시스템", size_pt=13, color_hex="4A5568")
    
    add_callout(doc, 
                "본 보고서는 2026학년도 1학기 동안 진행된 '스마트 출장 관리 및 근태 확인 시스템 (O1BO)'의 주차별 개발 실적과 핵심 성과를 집대성한 최종 요약 문서입니다.", 
                "초록 (Executive Summary)", border_color_hex="1A365D")
    
    add_heading_1(doc, "1. 프로젝트 개요 및 추진 목표")
    p = add_custom_para(doc)
    add_run(p, "본 프로젝트(O1BO)는 기업 사원의 불필요한 출장 행정 업무(수동 일정 작성, 영수증 수수 및 수동 정산, 보고서 수기로 작성 등)를 ")
    add_run(p, "Google Gemini AI 기술과 모바일 하이브리드 기술을 융합하여 혁신적으로 자동화", bold=True)
    add_run(p, "하는 동시에, 관리자가 출장 사원의 현지 근태를 실시간으로 확인하면서도 사원의 사생활과 세부 정보는 철저히 격리하고 암호화하는 프라이버시 최우선 지향형 스마트 솔루션을 목표로 구축되었습니다.")

    add_heading_2(doc, "1.1 주요 추진 분야")
    add_bullet_item(doc, "일정 및 리포트 자동화: ", "자연어로 채팅 입력 시 출장 일정을 자동 빌드하고 일보를 1초 만에 마크다운과 워드로 변환.", 0)
    add_bullet_item(doc, "GPS 기반 실시간 근태 검증: ", "위경도 좌표를 실시간 측정하고 Haversine 수식을 적용해 출장지 50m 반경 진입 시 지능형 체크인 검증.", 0)
    add_bullet_item(doc, "철저한 프라이버시 보호 (Privacy Segregation): ", "근태만 공유하고 개인 일정/경비/영수증 파일은 Firestore Security Rules를 통해 원천적으로 타인 및 관리자 접근 차단.", 0)

    add_heading_1(doc, "2. 2026-1학기 개발 마일스톤 및 성과 지표")
    p = add_custom_para(doc)
    add_run(p, "2026학년도 1학기 동안 단계별 스펙트럼에 맞추어 설계, 인프라, 알고리즘, 인공지능 통합, 문서화 순으로 개발이 착실하게 완성되었습니다. 전체 성과 요약은 다음과 같습니다.")
    
    headers = ["구분", "주요 개발 마일스톤", "핵심 기술 스택", "달성 상태"]
    rows = [
        ["1주차", "React/TypeScript 뼈대 설계 & 다국어(KO/JA) 인프라", "React 18, Vite, Tailwind CSS", "완료 (100%)"],
        ["2주차", "Firebase BaaS 및 프라이버시 격리형 DB 스키마 설계", "Firebase Auth/Firestore, types.ts", "완료 (100%)"],
        ["3주차", "GPS Geolocation & Haversine 근태 검증 알고리즘", "HTML5 Geolocation, Leaflet Map", "완료 (100%)"],
        ["4주차", "Gemini 3.5 AI 일정 조율 및 영수증 OCR 정산 연동", "Gemini API (gemini-3.5-flash)", "완료 (100%)"],
        ["5주차", "Word 리포트 자동저장 내보내기 & 시스템 예외 최적화", "docx XML mapping, Client Blob", "완료 (100%)"]
    ]
    add_styled_table(doc, headers, rows)

    add_heading_1(doc, "3. 주차별 상세 진행 요약")
    
    add_heading_2(doc, "3.1 [1주차] React & Vite 초기 환경 구축 및 다국어 지원 설계")
    add_bullet_item(doc, "핵심 과업: ", "TypeScript 기반 React 프로젝트 레이아웃 및 뷰 상태(ViewState) 탭 라우팅 인프라 생성.", 0)
    add_bullet_item(doc, "성과: ", "통합 아이콘 컴포넌트(Icons.tsx)로 일관된 디자인 시스템 뼈대를 완성하고 한국어/일본어 다국어 설정을 구축함.", 0)

    add_heading_2(doc, "3.2 [2주차] Firebase 통합 및 프라이버시 보호형 데이터 구조 설계")
    add_bullet_item(doc, "핵심 과업: ", "Firebase BaaS 인증 및 Firestore 실시간 DB 결합. 회사 연동 코드 발급 및 가입 기능 설계.", 0)
    add_bullet_item(doc, "성과: ", "직원용(소유자 권한)과 관리자용(회사 매치 권한)의 DB 보안 정책을 설계하여 타인이 내 출장일정/영수증을 넘볼 수 없는 최적의 데이터 모델 완성.", 0)

    add_heading_2(doc, "3.3 [3주차] 고정밀 GPS 위치 기반 자동 근태 체크인/아웃 구현")
    add_bullet_item(doc, "핵심 과업: ", "위치 정보 획득 및 위경도 삼각 측량 Haversine 알고리즘 탑재.", 0)
    add_bullet_item(doc, "성과: ", "출장지 중심 반경 50미터 이내에서만 버튼이 활성화되는 자동 지오펜싱 체크인 로직과 실시간 타임라인 대시보드 인터페이스 연동 완료.", 0)

    add_heading_2(doc, "3.4 [4주차] Gemini 3.5 AI 일정 조율 및 영수증 OCR 정산 시스템 통합")
    add_bullet_item(doc, "핵심 과업: ", "최신 인텔리전스 AI 적용을 통한 일정 조율 챗봇 및 영수증 OCR 비서 구현.", 0)
    add_bullet_item(doc, "성과: ", "gemini-3.5-flash 모델 적용으로 대화형 일정 수정 기능을 최적화하고 영수증 텍스트 파싱을 100% 모듈화. 미개발 콜백 연결을 마쳐 시스템 락앤 프리징 해결.", 0)

    add_heading_2(doc, "3.5 [5주차] Word 리포트 자동저장 내보내기 구현 및 UX 예외 처리 최적화")
    add_bullet_item(doc, "핵심 과업: ", "보고서 Word 파일 다운로드 포맷 설계 및 시스템 리질리언스(Resilience) 보강.", 0)
    add_bullet_item(doc, "성과: ", "내보내기와 동시에 Firestore DB에 자동 세이브되는 융합형 다운로드를 구현하였으며, 삭제 취소 먹통 모달 버그 및 비회원 권한 크래시를 전면 해결함.", 0)

    add_heading_1(doc, "4. 향후 로드맵 및 종합 결론")
    p = add_custom_para(doc)
    add_run(p, "본 O1BO 스마트 출장 및 근태 솔루션은 2026-1학기 개발 과정을 통해 실무 비즈니스 현장에 투입할 수 있을 정도로 성숙한 완성도에 도달했습니다. 차기 개발 목표로는 ")
    add_run(p, "① 스마트폰 NFC 물리 장치를 연동한 GPS+NFC 2중 보안 검증 체계 구현, ② 네트워크가 단절된 오프라인 환경에서도 로컬 큐에 체크인을 임시 저장하는 PWA 고도화", bold=True)
    add_run(p, "를 목표로 하여 엔터프라이즈 레벨의 안정성을 추가로 획득할 예정입니다.")

    doc.save(output_path)

def create_week1_doc(output_path):
    """File 2: 1주차_개발내역.docx"""
    doc = Document()
    setup_page(doc, "1주차 개발 보고서")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 1주차 개발 내역 보고서\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "주제: React & Vite 초기 환경 구축 및 다국어 지원 설계", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 개발 개요 및 목표")
    p = add_custom_para(doc)
    add_run(p, "본 1주차 개발에서는 최신 프론트엔드 빌드 아키텍처를 도입하여 빠르고 고성능의 SPA(Single Page Application) 기반 구조를 적립하고, O1BO의 UI 컴포넌트 뼈대와 다국어 글로벌 팩을 기본 안착하는 것을 핵심 목표로 진행하였습니다.")

    add_heading_1(doc, "2. 세부 개발 및 기술적 구현 사항")
    
    add_heading_2(doc, "2.1 Vite 및 React 18, TypeScript 프레임워크 융합")
    add_bullet_item(doc, "Vite 번들러 설정: ", "기존의 무거운 Webpack 대비 100배 빠른 HMR(Hot Module Replacement) 속도를 제공하는 Vite 5.x 및 Node 번들러 결합.", 0)
    add_bullet_item(doc, "TypeScript 엄격 모드 적용: ", "데이터 모델 전 영역에 엄격한 정적 타입 검사(Strict Mode)를 선언하여 런타임 Null 에러를 원천적으로 통제하도록 tsconfig.json 구성.", 0)
    
    add_heading_2(doc, "2.2 Tailwind CSS를 활용한 반응형 UI 및 통합 디자인 시스템")
    add_bullet_item(doc, "반응형 그리드 시스템: ", "데스크톱 어드민 대시보드와 스마트폰 사원 전용 웹뷰의 유연한 화면 가변성을 위해 Tailwind 반응형 유틸리티 클래스 도입.", 0)
    add_bullet_item(doc, "통합 아이콘 컴포넌트: ", "Lucide React 기반의 통합 아이콘 모음 'components/Icons.tsx'를 작성하여 시스템 전체에서 가볍고 세련된 아이콘을 단일 모듈로 재사용하도록 구조화.", 0)

    add_heading_2(doc, "2.3 탭 기반 가상 라우팅(ViewState) 및 다국어 지원 시스템(i18n)")
    add_bullet_item(doc, "ViewState 라우터: ", "무거운 브라우저 라우터 대신, 상태(State) 값인 ViewState(HOME, TRIPS, NEW_TRIP, REPORTS 등)를 도입하여 딜레이가 전혀 없는 SPA 가상 내비게이션 구축.", 0)
    add_bullet_item(doc, "다국어 통합 설계: ", "한국어(ko)와 일본어(ja)를 즉시 실시간 스위칭할 수 있도록 App.tsx 내에 통합 번역 딕셔너리를 로드하고 사용자의 선호 테마를 캐싱 처리.", 0)

    add_heading_1(doc, "3. 개발 성과 및 산출물")
    headers = ["산출 파일 경로", "주요 구성 요소 및 역할", "기술적 의의"]
    rows = [
        ["/package.json", "Vite, React 18, Tailwind 의존성 정의", "프로젝트 핵심 빌드 라이브러리 규정"],
        ["/App.tsx (초기형)", "ViewState 제어 루프 및 번역 리소스", "통합 화면 전환 및 다국어 전환 로직 선언"],
        ["/components/Icons.tsx", "Lucide React 기반 통합 벡터 아이콘 셋", "디자인 일관성 및 아이콘 모듈 로딩 경량화"],
        ["/tsconfig.json", "TypeScript 컴파일러 및 모듈 해석 규칙", "타입 세이프 코딩 규율 및 컴파일 환경 확립"]
    ]
    add_styled_table(doc, headers, rows)

    add_callout(doc, "1주차 개발 결과, 로딩 및 조작 딜레이가 극도로 제어된 최적의 프론트엔드 모듈 뼈대가 완성되었습니다. 이는 향후 외주 API와 데이터베이스 통신 레이어를 얹을 수 있는 튼튼한 토대가 되었습니다.", "1주차 요약")

    doc.save(output_path)

def create_week2_doc(output_path):
    """File 3: 2026-1학기_개발내역_2주차.docx"""
    doc = Document()
    setup_page(doc, "2주차 개발 보고서")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 2주차 개발 내역 보고서\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "주제: Firebase 통합 및 프라이버시 보호형 데이터 구조 설계", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 개발 개요 및 목표")
    p = add_custom_para(doc)
    add_run(p, "본 2주차에는 클라우드 백엔드 인프라 구축을 최우선 목표로 잡았습니다. ")
    add_run(p, "서버리스(Serverless) 아키텍처인 Firebase BaaS(Backend-as-a-Service)", bold=True)
    add_run(p, "를 도입하여 Authentication(사용자 인증)과 Firestore NoSQL DB를 연동하였고, 사장의 권한 통제와 사원의 프라이버시 권한을 엄격하게 상호 격리하는 DB 규칙과 타입 구조 설계를 완료하였습니다.")

    add_heading_1(doc, "2. 세부 개발 및 기술적 구현 사항")
    
    add_heading_2(doc, "2.1 Firebase Auth 및 Firestore 연동 인프라 완성")
    add_bullet_item(doc, "인증 게이트웨이: ", "Firebase Google Social Sign-in을 통합 연동하여 기업 사용자의 진입 장벽을 최소화.", 0)
    add_bullet_item(doc, "Firestore 초기화: ", "클라이언트가 실시간 문서 스냅샷 리스너를 통해 고속으로 데이터를 동기화하도록 firebase.ts 설정.", 0)

    add_heading_2(doc, "2.2 데이터 도메인 타입 정의 및 6자리 회사 코드 아키텍처")
    add_bullet_item(doc, "엄격한 타입 스키마 (types.ts): ", "TypeScript를 통해 User, Trip, ItineraryItem, CheckInRecord, Expense 데이터 스키마를 고도 구조화.", 0)
    add_bullet_item(doc, "회사 연동 코드 발급 메커니즘: ", "관리자 가입 즉시 고유한 6자리 대문자 회사 코드(e.g., 'XY83A1')가 자동 생성되게 설계. 사원은 홈 화면에서 사장님이 발급해 준 회사 코드를 입력함으로써 동일 도메인 내 그룹으로 논리적으로 묶이는 구조 설계.", 0)

    add_heading_2(doc, "2.3 데이터 격리(Data Segregation) 설계 및 프라이버시 보안 체계")
    add_callout(doc, "O1BO의 핵심 가치: 관리자(사장)는 사원의 '근태 정보(체크인/체크아웃)'만 모니터링할 수 있으며, 사원의 '상세 출장 일정(Itinerary)', '개인 메모', '지출 내역 및 영수증(Expenses)'에는 절대 접근할 수 없습니다.", "프라이버시 세그리게이션 원칙", border_color_hex="319795")
    add_bullet_item(doc, "Firestore 보안 규칙 (firestore.rules) 코딩: ", "trips와 expenses 컬렉션은 오직 해당 문서를 생성한 본인(uid === resource.data.userId)만 읽고, 쓰고, 삭제할 수 있도록 원천 격리 규칙 지정.", 0)
    add_bullet_item(doc, "체크인 정보 공유 규칙: ", "checkIns 컬렉션에 한해서만, 본인 혹은 해당 레코드의 companyCode와 연동된 관리자 계정만 조회가 가능하도록 2중 보안 체크 함수(isCompanyAdmin) 구현.", 0)

    add_heading_1(doc, "3. 개발 성과 및 산출물")
    headers = ["개발 파일 경로", "설계된 스키마 / 기술 속성", "보안 등급"]
    rows = [
        ["/firebase.ts", "Firebase SDK App 초기화, Auth 및 DB 인스턴스 수출", "보안 핵심 통제선"],
        ["/types.ts", "User, Trip, CheckInRecord, Expense 인터페이스 정립", "타입 세이프티 확보"],
        ["/firestore.rules", "isAuthenticated(), isCompanyAdmin() 보안 룰즈 선언", "백엔드 최종 차단선 (A등급)"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_week3_doc(output_path):
    """File 4: 2026-1학기_개발내역_3주차.docx"""
    doc = Document()
    setup_page(doc, "3주차 개발 보고서")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 3주차 개발 내역 보고서\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "주제: 고정밀 GPS 위치 기반 자동 근태 체크인/아웃 구현", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 개발 개요 및 목표")
    p = add_custom_para(doc)
    add_run(p, "본 3주차에는 출장 관리에 실질적인 데이터 정량성을 부여하는 ")
    add_run(p, "고정밀 GPS 기반 자동 출장 검증 모듈", bold=True)
    add_run(p, "을 설계했습니다. 사원이 출장 현지에 도착했을 때 부정 출장을 방지하기 위해, 지정된 출장지 좌표 기준 특정 거리 반경 내에서만 체크인이 활성화되는 모듈을 만들고, 관리자의 실시간 타임라인 대시보드 화면을 전격 구성하였습니다.")

    add_heading_1(doc, "2. 세부 개발 및 기술적 구현 사항")
    
    add_heading_2(doc, "2.1 Geolocation API 통합 및 고정밀 위경도 좌표 측정")
    add_bullet_item(doc, "고정밀 하드웨어 통신: ", "브라우저 및 기기 GPS 센서에 직접 접근해 고정밀(highAccuracy) 모드로 위도, 경도 좌표 값을 획득하는 locationService.ts 개발.", 0)
    add_bullet_item(doc, "지도 시각화 연동: ", "Leaflet 오픈소스 맵 라이브러리를 바인딩하여 사원이 자신의 위상 위치와 지정 출장 목적지의 공간적 위치를 직관적으로 확인할 수 있도록 인터페이스 결합.", 0)

    add_heading_2(doc, "2.2 Haversine(하버사인) 대원 거리 계산 수학 공식 도입")
    p = add_custom_para(doc)
    add_run(p, "사원의 현재 위치 좌표 $P_1(\\phi_1, \\lambda_1)$와 목적지 좌표 $P_2(\\phi_2, \\lambda_2)$ 간의 구면 거리를 지구 반경 $R=6371km$를 기준으로 정밀하게 계산하는 하버사인 공식을 자바스크립트 엔진으로 코딩:")
    add_callout(doc,
                "d = 2R * arcsin( sqrt( sin^2((lat2 - lat1)/2) + cos(lat1) * cos(lat2) * sin^2((lon2 - lon1)/2) ) )",
                "Haversine Formula", border_color_hex="2B6CB0")
    add_bullet_item(doc, "50m 지오펜싱(Geofencing) 장벽: ", "연산 결과 거리가 '50m 이내'일 때만 활성화되는 체크인 버튼 가드 구현. 이에 미달 시 체크인 시도가 원천 불가능하도록 제어해 가짜 출장 방지.", 0)

    add_heading_2(doc, "2.3 관리자 대시보드 및 실시간 근태 타임라인")
    add_bullet_item(doc, "실시간 어드민 타임라인: ", "소속 사원들이 체크인/체크아웃을 수행한 내역을 실시간으로 가져와 시간 순서대로 렌더링하는 대시보드 구축.", 0)
    add_bullet_item(doc, "출장 시간 자동 연산: ", "체크인 시간과 체크아웃 시간을 실시간 매칭하여 사원이 현지에서 몇 시간 동안 실근무를 수행했는지 차트로 표기하는 파이프라인 형성.", 0)

    add_heading_1(doc, "3. 개발 성과 및 산출물")
    headers = ["개발 모듈 파일", "적용된 기술 요소", "작동 효과"]
    rows = [
        ["/services/locationService.ts", "HTML5 Geolocation, Haversine 알고리즘", "위도/경도 실시간 측정 및 50m 이격 계산"],
        ["/App.tsx (어드민 대시보드)", "Firestore 실시간 Snapshots, Timeline UI", "사원의 현지 근태 상태 실시간 지도 및 시간순 모니터링"],
        ["/types.ts (CheckInRecord)", "CheckInRecord 타입 인터페이스 명세", "체크인 일시, 체크아웃 일시, 위치좌표 타입 규격 보증"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_week4_doc(output_path):
    """File 5: 2026-1학기_개발내역_4주차.docx"""
    doc = Document()
    setup_page(doc, "4주차 개발 보고서")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 4주차 개발 내역 보고서\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "주제: Gemini 3.5 AI 일정 조율 및 영수증 OCR 정산 시스템 통합", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 개발 개요 및 목표")
    p = add_custom_para(doc)
    add_run(p, "본 4주차에는 서비스의 가장 파괴적인 기능인 ")
    add_run(p, "Google Gemini AI 인텔리전스 레이어 연동", bold=True)
    add_run(p, "을 집중적으로 단행하였습니다. 기존의 구형/미지원 모델을 최신 프론트엔드 통신 스키마에 맞게 쇄신하고, 사용자의 자연어 프롬프트를 분석하는 챗봇 일정 조율기, 영수증 이미지 OCR 처리기, 그리고 종합 출장 일보를 1초 만에 자동 작성해 주는 초지능형 오토 보고 레이어를 통합 완성하였습니다.")

    add_heading_1(doc, "2. 세부 개발 및 기술적 구현 사항")
    
    add_heading_2(doc, "2.1 구형 모델명 제거 및 최신 Gemini 3.5 Flash 모델 교체")
    add_bullet_item(doc, "Gemini API 모델 갱신: ", "기존의 불완전하거나 지원 종료된 'gemini-3-flash-preview' 레거시 참조 구문을 완벽한 정식 버전인 'gemini-3.5-flash'로 일제 보강.", 0)
    add_bullet_item(doc, "Vite API Key 안전장치: ", "배포 및 번들링 시점에 API 키 참조가 소실되지 않도록 process.env.GEMINI_API_KEY 및 process.env.API_KEY 이중 바인딩 선언.", 0)

    add_heading_2(doc, "2.2 자연어 AI 비즈니스 일정 자동 조정 및 영수증 OCR 시스템")
    add_bullet_item(doc, "일정 대화형 가공 (geminiService.ts): ", "'도쿄 2박 3일 IT 컨퍼런스 참가 일정 짜줘'라고 챗봇에 말하면, AI가 정확한 시간대별 Itinerary JSON을 구성하여 캘린더에 로드하는 기술 구축.", 0)
    add_bullet_item(doc, "영수증 이미지 파싱 OCR (Receipt OCR): ", "사원이 스마트폰 카메라로 영수증을 촬영해 올리면, AI가 이미지 내 픽셀을 직접 분석하여 가맹점 상호명, 지출 금액, 결제일, 지출 품목 카테고리를 실시간 추출하여 DB에 자동 기입하는 시스템 완성.", 0)

    add_heading_2(doc, "2.3 미구현 핵심 AI 콜백 연결을 통한 시스템 정지(Freezing) 완치")
    add_callout(doc, "기존 코드상에서 '개요 작성' 및 '일보 자동 작성' 버튼만 누르면 뷰포트 내부에서 심각한 오류가 유발되거나 화면이 먹통이 되던 빈 껍데기 함수(Empty Callbacks) 버그를 원천 해결하였습니다.", "오류 해결 주요 보고", border_color_hex="1A365D")
    add_bullet_item(doc, "handleGenerateReport 실체화: ", "활성화된 출장의 체크인 기록, 영수증 지출 리스트, 상세 일정을 즉시 스크래핑해 한 번에 요약 마크다운 리포트로 통합 편찬해 주는 비동기 핵심 로직 완성.", 0)
    add_bullet_item(doc, "handleAiScheduleAction 이식: ", "채팅 기반의 대화 내역에서 '내일 오후 2시에 A사 추가' 같은 명령어 인식 시, 기존 일정 배열을 자동 스캔하여 정확한 시간 순서대로 일정 아이템을 밀어 넣어 재정렬하는 지능화 비즈니스 알고리즘 완비.", 0)

    add_heading_1(doc, "3. 개발 성과 및 산출물")
    headers = ["개발 파일 경로", "AI 핵심 역할", "기대 효과"]
    rows = [
        ["/services/geminiService.ts", "gemini-3.5-flash API 인터페이스 설계", "자연어 기반 일정 생성 및 영수증 OCR 정밀 매핑"],
        ["/App.tsx (AI 컨트롤러)", "handleGenerateReport, handleAiScheduleAction 구현", "버튼 클릭 시 화면 멈춤 버그 완벽 치료 및 자동 정산 실체화"],
        ["/types.ts", "Trip 인터페이스에 report?: string; 캐싱 명세 보강", "일보 정보의 지속성 캐싱 확보로 데이터 통신 지연시간 최소화"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_week5_doc(output_path):
    """File 6: 2026-1학기_개발내역_5주차.docx"""
    doc = Document()
    setup_page(doc, "5주차 개발 보고서")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 5주차 개발 내역 보고서\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "주제: Word 리포트 자동저장 내보내기 구현 및 UX 예외 처리 최적화", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 개발 개요 및 목표")
    p = add_custom_para(doc)
    add_run(p, "본 5주차에는 O1BO 서비스의 실무 실용성을 최고조로 올리는 ")
    add_run(p, "문서 추출 자동화 및 프론트엔드 품질 강화(UX/UI 예외 복구)", bold=True)
    add_run(p, "를 집중 달행하였습니다. AI 생성 리포트를 기업 보고용 MS Word 파일(.doc/docx)로 다이렉트 변환하는 모듈을 안착하고, 확인 모달 탈출 불가 버그 해결 및 네트워크 오프라인/게스트 세션 시의 DB 접근 런타임 오류 방어막을 구축하였습니다.")

    add_heading_1(doc, "2. 세부 개발 및 기술적 구현 사항")
    
    add_heading_2(doc, "2.1 MS Word 호환 서식 반영 다운로드 모듈 및 한글 인코딩 보장")
    add_bullet_item(doc, "XML 호환 서식 전처리: ", "MS Word가 프린터 레이아웃 규격을 즉시 파싱하도록 XML 메타 태그를 이식하고, 한국 및 일본 오피스 최적화 서식('맑은 고딕', 'Segoe UI', 'Meiryo' 등) 스택을 스타일링 시트에 주입.", 0)
    add_bullet_item(doc, "UTF-8 BOM (Byte Order Mark) 주입: ", "한글 및 한자 인코딩이 깨지지 않고 완벽하게 출력되도록 파일 헤더에 '\\ufeff' 바이트 코드를 물리적으로 결합하여 Blob 다운로드 실행.", 0)

    add_heading_2(doc, "2.2 Word 내보내기 시 Firestore 클라우드 백그라운드 자동 저장 연동")
    add_bullet_item(doc, "One-Click Complete 플로우: ", "사용자가 'Word로 내보내기'를 누른 순간, 로컬 기기로 파일이 다운로드되는 동시에 Firestore 데이터베이스의 해당 출장 레코드('report' 필드)에 최신 작성본을 백그라운드로 안전하게 선(先) 저장함.", 0)
    add_bullet_item(doc, "메인보드 복귀 및 토스트 안내: ", "저장 완료와 동시에 '일보 파일이 성공적으로 저장 및 Word로 내보내기 되었습니다!' 라는 성공 피드백 토스트창을 띄우고, 사용자 뷰를 메인화면(Home Dashboard)으로 부드럽게 복귀(Redirect) 시키는 동적 UX 구현.", 0)

    add_heading_2(doc, "2.3 삭제 확인 모달 갇힘(Stuck) 현상 및 취소 에러 전면 완치")
    add_bullet_item(doc, "모달 탈출 불가 원인: ", "기존 코드가 삭제 확인창의 취소 및 삭제 확인 버튼 모두에 전역 로딩 플래그(disabled={loading})를 강제 결합해 둠에 따라, 백그라운드 스택 오버 발생 시 모달에서 취소조차 누르지 못하고 영구 락이 걸리던 치명적 결함 식별.", 0)
    add_bullet_item(doc, "구조적 분리 해결: ", "취소 버튼에서 disabled 속성을 완벽히 철거하여 로딩 중에도 상시 탈출 가능하게 하고, 삭제 버튼 클릭 시 비동기 렌더링 스택의 밀림 없이 '즉시 모달 닫기'를 선행한 후 비동기 데이터베이스 커넥션을 try-finally 블록에서 비동기로 처리함으로써 자원 교착 상태 완벽 파쇄.", 0)

    add_heading_2(doc, "2.4 게스트(Guest) 비회원 환경에서의 Firestore 보안 크래시 방어")
    add_bullet_item(doc, "낙관적 업데이트 (Optimistic Update) & Fallback: ", "인증 세션이 없는 테스트(Anonymous) 환경에서도 CRUD 작업이 동작하도록 로컬 React 상태 리스트(upcomingTrips, checkIns 등) 및 localStorage 백업 체계를 구축하여 DB 권한 에러로 인한 화면 백화 현상을 차단.", 0)

    add_heading_1(doc, "3. 개발 성과 및 산출물")
    headers = ["수정 완료 파일", "패치된 솔루션 기술", "보안 및 성능 개선"]
    rows = [
        ["/App.tsx (Word 익스포트)", "handleExportToWord 비동기 스레드 구축", "원클릭 다운로드 + 파이어베이스 동시 세이브 구현"],
        ["/App.tsx (Confirm 모달)", "disabled 가드 철폐 & try-finally 로딩 해제", "삭제 확인창 영구 프리징 버그 전면 해결"],
        ["/App.tsx (DB 트랜잭션)", "낙관적 UI 선행 반영 및 try-catch 감싸기", "게스트 모드에서 Firestore 권한 오류로 인한 비정상 먹통 전면 차단"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_project_intro_doc(output_path):
    """File 7: 프로젝트_소개_및_구조.docx"""
    doc = Document()
    doc_title = "O1BO 프로젝트 가이드 및 구조 분석서"
    setup_page(doc, doc_title)
    
    # Title
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "스마트 출장 관리 및 근태 확인 시스템\n", size_pt=20, color_hex="1A365D", bold=True)
    add_run(p_title, "O1BO 프로젝트 설계 및 구조 분석서", size_pt=13, color_hex="4A5568")
    
    add_callout(doc, 
                "본 문서는 스마트 출장 관리 시스템 [O1BO]의 아키텍처, 폴더 및 소스코드 구성, 철저한 프라이버시 보호를 위한 데이터 분리 원칙, 그리고 데이터베이스 보안 규칙을 종합하여 기술한 종합 백서입니다.", 
                "소개 (About the Project)", border_color_hex="1A365D")
    
    add_heading_1(doc, "1. 프로젝트 비전 및 기획 목적")
    p = add_custom_para(doc)
    add_run(p, "전통적인 기업 환경에서의 출장 처리는 대단히 번잡스럽고 오류가 잦은 행정 소모전이었습니다. ")
    add_run(p, "O1BO(One-Stop Business Organizer) 스마트 출장 시스템", bold=True)
    add_run(p, "은 AI 비서 및 고정밀 지오펜싱 기술을 융합하여 출장 계획의 수립부터 경로 확인, 현장 체크인 근태 검증, 경비 자동 OCR, 그리고 자동 일보 보고서 편찬까지의 모든 워크플로우를 원스톱으로 처리합니다. ")
    add_run(p, "특히, 직원의 개인 생활(세부 일정 및 영수증)은 철저히 보호하고, 회사는 필요한 최소 근태 데이터(체크인 유무)만 투명하게 확인하는 상생형 보안 솔루션을 자랑합니다.")

    add_heading_1(doc, "2. 시스템 아키텍처 및 폴더 구조")
    p = add_custom_para(doc)
    add_run(p, "O1BO 프로젝트는 React 18 SPA를 기반으로 삼고, 초고속 번들러 Vite, 정적 타입 세이프티 TypeScript, Firebase 서버리스 클라우드 DB, 그리고 Google Gemini AI를 통합 결합한 최첨단 하이브리드 아키텍처로 구현되었습니다.")
    
    headers = ["폴더 / 파일 이름", "핵심 담당 역할 및 기능", "비고"]
    rows = [
        ["/components/Icons.tsx", "Lucide React 기반의 통합 벡터 아이콘 모음집", "디자인 일관성 확보"],
        ["/services/geminiService.ts", "Google Gemini AI 기반 챗봇 일정 생성, 영수증 OCR, 마크다운 일보 생성", "gemini-3.5-flash 모델 적용"],
        ["/services/locationService.ts", "Geolocation API 및 Haversine 구면 대원 거리 연산 알고리즘", "50m 오차 자동 체크인 검증"],
        ["/App.tsx", "메인 어플리케이션 상태(State) 컨트롤러 및 권한별 UI 렌더링", "SPA 가상 라우팅 담당"],
        ["/types.ts", "User, Trip, ItineraryItem, CheckInRecord, Expense 데이터 스펙 선언", "TypeScript 타입 규격 정의"],
        ["/firestore.rules", "백엔드 Firestore 데이터베이스의 엄격한 유저별 접근 통제", "프라이버시 수호 최종 장벽"]
    ]
    add_styled_table(doc, headers, rows)

    add_heading_1(doc, "3. 프라이버시 보호 및 보안 설계 모델")
    p = add_custom_para(doc)
    add_run(p, "O1BO는 사원의 인권과 정보 보안을 위해 ")
    add_run(p, "데이터 분리 세그리게이션(Data Segregation)", bold=True)
    add_run(p, " 원칙을 철저하게 준수합니다. 관리자가 속한 회사의 사원이라고 할지라도, 사원의 상세한 출장 사적 동선이나 경비 사용처, 카드 영수증 원본 이미지 파일 등은 데이터베이스 접근 단에서부터 사장님 계정의 읽기/조회가 원천적으로 철저히 차단됩니다.")
    
    add_heading_2(doc, "3.1 Firestore 백엔드 보안 규칙(firestore.rules)의 내부 통제선")
    p = add_custom_para(doc)
    add_run(p, "프론트엔드 자바스크립트 우회나 해킹 툴을 사용한 DB 강제 조회를 방어하기 위해 Firestore Security Rules에 엄격한 인권 격리 알고리즘을 이식하였습니다.")
    add_bullet_item(doc, "Trips 및 Expenses 규칙: ", "allow read, write: if request.auth.uid == resource.data.userId; 적용을 통해, 로그인한 소유자 외에는 관리자나 시스템 어드민조차 해당 레코드에 접근 불가능하도록 백엔드 최종 단에서 즉시 Drop 처리함.", 0)
    add_bullet_item(doc, "CheckIns 규칙: ", "allow read: if request.auth.uid == resource.data.userId || isCompanyAdmin(resource.data.companyCode); 을 통해, 오직 근태(체크인/아웃 시각 및 장소명) 데이터만 사원 본인 및 소속 회사 관리자 계정에 상호 연동되어 투명하게 조회되도록 설계 완료.", 0)

    add_heading_1(doc, "4. 2중 출장 인증 시스템 (NFC 물리 태깅) 기술 로드맵")
    p = add_custom_para(doc)
    add_run(p, "향후 업데이트 예정인 ")
    add_run(p, "2중 출장 인증 시스템 (GPS + NFC 물리 결합)", bold=True)
    add_run(p, "은 GPS 기반의 현행 지오펜싱을 더욱 신뢰할 수 있게 강화할 예정입니다.")
    add_bullet_item(doc, "1단계: ", "사원이 현장에 도착하여 스마트폰 앱의 GPS 센서 판독(50m)을 거쳐 수동으로 1차 체크인/체크아웃을 수행합니다.", 0)
    add_bullet_item(doc, "2단계: ", "출장 목적지 사무실 데스크 등에 비치된 보안 암호화된 NFC 물리 태그 스티커에 스마트폰을 밀접 태깅하여, 하드웨어적인 실제 방문 여부를 최종 2차 증빙(Physical Anti-Fake) 처리합니다.", 0)
    add_bullet_item(doc, "대외적 파급력: ", "GPS 조작 어플리케이션(Fake GPS 등)을 원천 무력화하며, 사원과 기업 모두가 법적으로 신뢰할 수 있는 실 근무 데이터를 확보함으로써 분쟁 없는 근태 생태계를 완성합니다.", 0)

    doc.save(output_path)

if __name__ == "__main__":
    out_dir = r"c:\Users\User\.gemini\antigravity-ide\scratch\01BO\개발내역"
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    print("O1BO Word Document Generation Script Initialized...")
    
    # Define document filenames
    docs_to_create = [
        ("2026-1학기_진행_내용.docx", create_semester_summary_doc),
        ("1주차_개발내역.docx", create_week1_doc),
        ("2주차_개발내역.docx", create_week2_doc),
        ("3주차_개발내역.docx", create_week3_doc),
        ("4주차_개발내역.docx", create_week4_doc),
        ("5주차_개발내역.docx", create_week5_doc),
        ("프로젝트_소개_및_구조.docx", create_project_intro_doc)
    ]
    
    success_count = 0
    for filename, creator_func in docs_to_create:
        full_path = os.path.join(out_dir, filename)
        try:
            print(f"Generating: {filename} ... ", end="")
            creator_func(full_path)
            print("SUCCESS")
            success_count += 1
        except Exception as e:
            print(f"FAILED (Error: {e})")
            
    print(f"\nDocument Generation Completed. {success_count} / {len(docs_to_create)} files generated successfully.")
    if success_count == len(docs_to_create):
        sys.exit(0)
    else:
        sys.exit(1)
