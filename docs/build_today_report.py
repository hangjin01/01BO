from pathlib import Path
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

OUT = Path(__file__).with_name('O1BO_2026_09_29_작업_보고서.docx')
FONT = 'Noto Sans CJK KR'
NAVY = '1F3A5F'
BLUE = 'DCEAF7'
GRAY = 'F4F6F8'
BORDER = 'D9D9D9'

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    tc_pr.append(shd)

def borders(cell):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in('w:tcBorders')
    if tc_borders is None:
        tc_borders = OxmlElement('w:tcBorders')
        tc_pr.append(tc_borders)
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        tag = 'w:' + edge
        el = tc_borders.find(qn(tag))
        if el is None:
            el = OxmlElement(tag)
            tc_borders.append(el)
        el.set(qn('w:val'), 'single')
        el.set(qn('w:sz'), '6')
        el.set(qn('w:color'), BORDER)

def set_cell_margin(cell, top=110, start=130, bottom=110, end=130):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in('w:tcMar')
    if tc_mar is None:
        tc_mar = OxmlElement('w:tcMar')
        tc_pr.append(tc_mar)
    for side, value in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        node = tc_mar.find(qn('w:' + side))
        if node is None:
            node = OxmlElement('w:' + side)
            tc_mar.append(node)
        node.set(qn('w:w'), str(value))
        node.set(qn('w:type'), 'dxa')

def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    rep = OxmlElement('w:tblHeader')
    rep.set(qn('w:val'), 'true')
    tr_pr.append(rep)

def keep_row_together(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement('w:cantSplit')
    tr_pr.append(cant_split)

def add_text(paragraph, text, bold=False, color=None, size=None):
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = FONT
    run._element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    if size:
        run.font.size = Pt(size)
    return run

def bullet(doc, text, level=0):
    p = doc.add_paragraph(style='List Bullet' if level == 0 else 'List Bullet 2')
    p.paragraph_format.space_after = Pt(4)
    add_text(p, text)
    return p

def table(doc, headers, rows, widths):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.style = 'Table Grid'
    hdr = t.rows[0]
    set_repeat_table_header(hdr)
    for i, header in enumerate(headers):
        cell = hdr.cells[i]
        cell.width = Inches(widths[i])
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        shade(cell, NAVY)
        borders(cell); set_cell_margin(cell)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_text(p, header, bold=True, color='FFFFFF', size=9.5)
    for row_i, row in enumerate(rows):
        word_row = t.add_row()
        keep_row_together(word_row)
        cells = word_row.cells
        for i, value in enumerate(row):
            cell = cells[i]
            cell.width = Inches(widths[i])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if row_i % 2 == 1:
                shade(cell, GRAY)
            borders(cell); set_cell_margin(cell)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            if i == 0 and len(value) < 18:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            add_text(p, value, size=9.5)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

def heading(doc, text, level=1):
    p = doc.add_paragraph(style=f'Heading {level}')
    p.paragraph_format.space_before = Pt(16 if level == 1 else 10)
    p.paragraph_format.space_after = Pt(7)
    add_text(p, text, bold=True, color='000000', size=15 if level == 1 else 12)
    return p

def body(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(7)
    p.paragraph_format.line_spacing = 1.22
    add_text(p, text, size=10.8)
    return p

doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.7)
section.bottom_margin = Inches(0.7)
section.left_margin = Inches(0.78)
section.right_margin = Inches(0.78)

styles = doc.styles
styles['Normal'].font.name = FONT
styles['Normal']._element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
styles['Normal'].font.size = Pt(10.8)
for name in ['Title', 'Heading 1', 'Heading 2', 'List Bullet', 'List Bullet 2']:
    styles[name].font.name = FONT
    styles[name]._element.rPr.rFonts.set(qn('w:eastAsia'), FONT)

title = doc.add_paragraph(style='Title')
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_text(title, 'O1BO 2026년 9월 29일 작업 보고서', bold=True, color='000000', size=24)
subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_after = Pt(18)
add_text(subtitle, '인증 흐름 정비와 로그인 화면 글라스 디자인 적용', color='4B5563', size=12)

body(doc, '오늘 작업의 핵심 결과는 비밀번호 기반 로그인과 회원가입 흐름을 화면에 연결하고, 로그인 화면을 iPhone 스타일의 반투명 글라스 인터페이스로 개선한 것입니다. 인증과 회사 가입 후의 상태 전환도 현재 서버 세션을 기준으로 정리했습니다. 타입 검사와 프로덕션 빌드는 통과했습니다. 다만 일반 Node 실행 환경에서 시스템 라이브러리 충돌이 확인되어, 검증에는 제공된 런타임을 사용했습니다.')

heading(doc, '오늘 완료한 작업')
table(doc,
    ['영역', '완료 내용', '사용자에게 보이는 결과'],
    [
        ['인증', 'PasswordLogin 컴포넌트에 로그인과 회원가입 모드를 구현하고 passwordAuth 서비스와 연결했습니다.', '이메일과 비밀번호로 로그인할 수 있고, 회원가입 때 이름과 비밀번호 확인을 입력합니다.'],
        ['입력 검증', '회원가입 비밀번호 확인 일치 여부와 15자에서 128자 길이 제한을 화면과 HTML 속성으로 처리했습니다.', '서버 요청 전에 비밀번호 불일치를 안내하며 긴 패스프레이즈 사용이 가능합니다.'],
        ['세션 처리', '로그인 성공 시 사용자 정보를 App 상태에 반영하고 홈 화면으로 이동하도록 연결했습니다.', '성공한 사용자는 로그인 화면에 남지 않고 앱 본문으로 진입합니다.'],
        ['회사 가입', '회사 코드가 없는 사용자를 CompanyMembership 화면으로 분기했습니다.', '회원가입 직후 회사 생성 또는 초대 코드 참여를 완료한 뒤 기능을 사용할 수 있습니다.'],
        ['글라스 디자인', '로그인 카드, 모드 탭, 입력창, 오류 안내, 제출 버튼에 반투명 배경과 블러, 테두리, 그림자, 전환 효과를 적용했습니다.', '밝은 모드와 다크 모드에서 유리 질감과 선명한 입력 대비를 제공합니다.'],
        ['배경', '로그인 배경에 오렌지와 블루 계열의 흐린 원형 빛 번짐을 추가했습니다.', 'backdrop blur가 실제로 보이며 카드가 배경에서 자연스럽게 분리됩니다.'],
    ], [1.05, 3.3, 2.45])

heading(doc, '문제가 발생한 지점과 해결 방법')
table(doc,
    ['문제', '원인과 영향', '해결 방법', '상태'],
    [
        ['글라스 효과가 평면적으로 보일 가능성', '반투명 카드만 적용하면 뒤쪽 배경의 색과 형태가 거의 없어 블러가 눈에 띄지 않습니다.', '카드에 backdrop blur와 반투명 테두리를 적용하고, 카드 뒤에 오렌지와 블루 블러 배경을 배치했습니다.', '해결'],
        ['다크 모드 가독성 저하 위험', '투명한 입력창과 탭은 어두운 배경에서 경계가 약해질 수 있습니다.', '다크 모드용 반투명 슬레이트 배경, 흰색 저농도 테두리, 밝은 텍스트와 포커스 테두리를 별도로 지정했습니다.', '해결'],
        ['로그인과 가입 상태가 섞일 위험', '탭을 전환한 뒤 기존 비밀번호, 확인값, 오류가 남으면 다른 모드의 상태가 보일 수 있습니다.', '탭 전환 시 비밀번호, 확인값, 오류 메시지를 초기화하고 처리 중에는 탭과 입력을 비활성화했습니다.', '해결'],
        ['기본 Node 명령 실패', 'npm run typecheck 실행 시 /usr/bin/node가 libnode와 SQLite 심볼 충돌로 종료됐습니다. 코드 오류와 무관하게 검증이 중단됩니다.', 'Codex가 제공한 Node 24 런타임으로 TypeScript와 Vite를 직접 실행했습니다.', '우회 검증 완료'],
    ], [1.35, 2.15, 2.15, 1.15])

heading(doc, '변경한 파일과 역할')
table(doc,
    ['파일', '주요 변경'],
    [
        ['components PasswordLogin tsx', '로그인과 회원가입 UI, 입력 제약, 오류 안내, 요청 중 상태를 담당합니다. 탭과 입력창, 오류 패널, 제출 버튼에 글라스 디자인을 적용했습니다.'],
        ['App tsx', '비로그인 화면의 배경과 로그인 카드에 반투명 글라스 레이어를 적용했습니다. PasswordLogin의 성공 콜백으로 사용자 상태와 화면 전환을 연결했습니다.'],
        ['components CompanyMembership tsx', '회사 정보가 없는 신규 사용자가 회사 생성 또는 초대 코드 참여를 선택할 수 있도록 인증 뒤 흐름을 분리합니다.'],
        ['services apiService ts', '비밀번호 인증과 현재 세션 사용자 조회 등 서버 통신을 담당합니다.'],
    ], [2.25, 4.85])

heading(doc, '검증 결과')
table(doc,
    ['검증 항목', '결과', '비고'],
    [
        ['TypeScript 검사', '통과', 'tsc --noEmit를 제공된 Node 런타임으로 실행했습니다.'],
        ['프로덕션 빌드', '통과', 'Vite가 1,737개 모듈을 변환하고 dist 산출물을 생성했습니다.'],
        ['번들 경고', '주의 필요', '최종 JavaScript 청크가 약 545 kB로 Vite의 500 kB 경고 기준을 넘었습니다. 현재 빌드를 막지는 않습니다.'],
        ['브라우저 수동 확인', '다음 작업 권장', '실제 휴대폰과 데스크톱에서 글라스 대비, 키보드, 탭 이동을 확인해야 합니다.'],
    ], [1.55, 1.35, 4.2])

heading(doc, '참고 사항')
body(doc, '이 보고서는 2026년 9월 29일 현재 작업 공간의 변경 사항과 이번 대화에서 수행한 검증을 기준으로 작성했습니다. 보고서에는 변경 목적과 동작을 설명했지만, 서버 배포나 실제 계정 생성은 수행하지 않았습니다.')

doc.add_page_break()
heading(doc, '다음에 해야 할 작업')
body(doc, '아래 항목은 오늘 확인된 상태를 기준으로 우선순위를 제안한 것입니다. 운영 배포 전에 인증과 세션 관련 항목을 먼저 완료하는 편이 안전합니다.')
table(doc,
    ['우선순위', '다음 작업', '완료 기준'],
    [
        ['높음', '실기기 인증 시나리오 점검', '로그인, 회원가입, 비밀번호 불일치, 짧은 비밀번호, 서버 오류, 로그아웃 뒤 재로그인을 iOS와 Android에서 확인합니다.'],
        ['높음', '세션 보안 점검', '쿠키의 Secure, HttpOnly, SameSite 설정과 세션 만료 및 만료 후 로그인 화면 복귀를 서버와 함께 점검합니다.'],
        ['높음', '가입 후 회사 참여 흐름 점검', '회사 생성과 초대 코드 참여가 성공·실패·중복 코드 상황에서 올바른 안내와 화면 이동을 제공하는지 확인합니다.'],
        ['중간', '접근성 점검', '키보드 탭 순서, 포커스 표시, 오류 role alert 읽기, 작은 화면에서의 글자와 대비를 확인합니다.'],
        ['중간', '번들 크기 최적화', 'AI, 지도, 보고서 기능처럼 초기 화면에 필요 없는 모듈을 동적 import로 분리해 초기 청크 경고를 줄입니다.'],
        ['낮음', '디자인 세부 조정', '실제 기기에서 배경 블러의 농도, 카드 투명도, 다크 모드 명암을 확인한 뒤 브랜드 톤에 맞게 수치를 미세 조정합니다.'],
        ['낮음', '개발 환경 복구', '시스템 /usr/bin/node의 libnode SQLite 심볼 충돌 원인을 정리해 npm run 명령이 기본 환경에서도 동작하도록 합니다.'],
    ], [0.8, 2.3, 4.0])

for sec in doc.sections:
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_text(footer, 'O1BO 작업 보고서  |  2026년 9월 29일', color='6B7280', size=8.5)

doc.save(OUT)
print(OUT)
