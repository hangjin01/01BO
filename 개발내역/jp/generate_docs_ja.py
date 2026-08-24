import os
import sys

# Reconfigure stdout and stderr to use UTF-8 to prevent encoding errors on non-UTF-8 terminals (like CP949 on Windows)
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn


def set_run_styles(run, name="Meiryo", size_pt=10.5, color_hex="2D3748", bold=False, italic=False):
    run.font.name = name
    run.font.size = Pt(size_pt)
    if color_hex:
        run.font.color.rgb = RGBColor.from_string(color_hex)
    run.bold = bold
    run.italic = italic
    
    # Enable Asian characters styling (Meiryo) in MS Word
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

def add_run(p, text, name="Meiryo", size_pt=10.5, color_hex="2D3748", bold=False, italic=False):
    run = p.add_run(text)
    set_run_styles(run, name, size_pt, color_hex, bold, italic)
    return run

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_styles(run, name="Meiryo", size_pt=15, color_hex="1A365D", bold=True)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_styles(run, name="Meiryo", size_pt=12.5, color_hex="2B6CB0", bold=True)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_styles(run, name="Meiryo", size_pt=11, color_hex="319795", bold=True)
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
    set_run_styles(run_title, name="Meiryo", size_pt=9.5, color_hex=border_color_hex, bold=True)
    run_text = p.add_run(text)
    set_run_styles(run_text, name="Meiryo", size_pt=9.5, color_hex="4A5568", italic=True)
    
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
        set_run_styles(run_bold, name="Meiryo", size_pt=10, color_hex="2D3748", bold=True)
        
    run_text = p.add_run(text)
    set_run_styles(run_text, name="Meiryo", size_pt=10, color_hex="2D3748")
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
            set_run_styles(run, name="Meiryo", size_pt=10, color_hex="FFFFFF", bold=True)
            
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
                set_run_styles(run, name="Meiryo", size_pt=9.5, color_hex="2D3748")
                
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
        hrun = hp.add_run(f"O1BO スマート出張管理システム | {doc_title}")
        set_run_styles(hrun, name="Meiryo", size_pt=8.5, color_hex="718096")
        
        # Footer setup
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Confidential — O1BO スマート出張報告システム 2026-1学期")
        set_run_styles(frun, name="Meiryo", size_pt=8, color_hex="A0AEC0", italic=True)

def create_semester_summary_doc(output_path):
    """File 1: 2026-1学期_進行内容_日本語.docx"""
    doc = Document()
    doc_title = "2026-1学期 開発総合報告書"
    setup_page(doc, doc_title)
    
    # Title
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "2026年度 1学期 O1BOプロジェクト開発進行報告書\n", size_pt=20, color_hex="1A365D", bold=True)
    add_run(p_title, "スマート出張日程管理およびリアルタイム勤怠確認システム", size_pt=13, color_hex="4A5568")
    
    add_callout(doc, 
                "本報告書は、2026年度1学期中に進行された「スマート出張管理および勤怠確認システム（O1BO）」の週次開発実績と主要成果を取りまとめた最終要約文書です。", 
                "要約 (Executive Summary)", border_color_hex="1A365D")
    
    add_heading_1(doc, "1. プロジェクト概要および推進目標")
    p = add_custom_para(doc)
    add_run(p, "本プロジェクト（O1BO）は、企業社員の不要な出張行政業務（手動での日程作成、領収書の回収および手動精算、報告書の収集・作成など）を")
    add_run(p, "Google Gemini AI技術とモバイルハイブリッド技術を融合して革新的に自動化", bold=True)
    add_run(p, "すると同時に、管理者が出張社員の現地勤怠をリアルタイムで確認しながらも、社員のプライバシーと詳細情報は徹底的に隔離・暗号化するプライバシー最優先志向型スマートソリューションを目標に構築されました。")

    add_heading_2(doc, "1.1 主要推進分野")
    add_bullet_item(doc, "日程およびレポートの自動化: ", "自然語でチャット入力する際、出張日程を自動ビルドし、日報を1秒でマークダウンおよびWordに変換。", 0)
    add_bullet_item(doc, "GPSベースのリアルタイム勤怠検証: ", "緯度経度座標をリアルタイムで測定し、Haversine数式を適用して出張地50m半径進入時にインテリジェントなチェックイン検証。", 0)
    add_bullet_item(doc, "徹底したプライバシー保護 (Privacy Segregation): ", "勤怠のみを共有し、個人日程/経費/領収書ファイルはFirestore Security Rulesを通じて根本的に他人および管理者へのアクセスを遮断。", 0)

    add_heading_1(doc, "2. 2026-1学期 開発マイルストーンおよび成果指標")
    p = add_custom_para(doc)
    add_run(p, "2026年度1学期の間、段階的なスペックに合わせて設計、インフラ、アルゴリズム、人工知能統合、文書化の順で開発が着実に完成しました。全体成果の要約は以下の通りです。")
    
    headers = ["区分", "主要開発マイルストーン", "核心技術スタック", "達成状態"]
    rows = [
        ["1週目", "React/TypeScript骨格設計＆多言語(KO/JA)インフラ", "React 18, Vite, Tailwind CSS", "完了 (100%)"],
        ["2週目", "Firebase BaaSおよびプライバシー隔離型DBスキーマ設計", "Firebase Auth/Firestore, types.ts", "完了 (100%)"],
        ["3週目", "GPS Geolocation & Haversine勤怠検証アルゴリズム", "HTML5 Geolocation, Leaflet Map", "完了 (100%)"],
        ["4週目", "Gemini 3.5 AI日程調整および領収書OCR精算連動", "Gemini API (gemini-3.5-flash)", "完了 (100%)"],
        ["5週目", "Wordレポート自動保存書き出し＆システム例外最適化", "docx XML mapping, Client Blob", "完了 (100%)"]
    ]
    add_styled_table(doc, headers, rows)

    add_heading_1(doc, "3. 週次詳細進行要約")
    
    add_heading_2(doc, "3.1 [1週目] React & Vite初期環境構築および多言語支援設計")
    add_bullet_item(doc, "主要タスク: ", "TypeScriptベースのReactプロジェクトレイアウトおよびビュー状態（ViewState）タブ切り替えインフラ作成。", 0)
    add_bullet_item(doc, "成果: ", "統合アイコンコンポーネント（Icons.tsx）で一貫したデザインシステムの骨格を完成させ、韓国語/日本語の多言語設定を構築。", 0)

    add_heading_2(doc, "3.2 [2週目] Firebase統合およびプライバシー保護型データ構造設計")
    add_bullet_item(doc, "主要タスク: ", "Firebase BaaS認証およびFirestoreリアルタイムDB結合。会社連動コード発行および加入機能設計。", 0)
    add_bullet_item(doc, "成果: ", "社員用（所有者権限）と管理者用（会社マッチング権限） of DBセキュリティポリシーを設計し、他人が自分の出張日程/領収書を閲覧できない最適なデータモデルを完成。", 0)

    add_heading_2(doc, "3.3 [3週目] 高精度GPS位置ベース自動勤怠チェックイン/アウト実装")
    add_bullet_item(doc, "主要タスク: ", "位置情報取得および緯度経度三角測量Haversineアルゴリズム搭載。", 0)
    add_bullet_item(doc, "成果: ", "出張地の中心から半径50メートル以内でのみボタンが有効化される自動ジオフェンシングチェックインロジックとリアルタイムタイムラインダッシュボードインターフェースを連動完了。", 0)

    add_heading_2(doc, "3.4 [4週目] Gemini 3.5 AI日程調整および領収書OCR精算システム統合")
    add_bullet_item(doc, "主要タスク: ", "最新のインテリジェントAI適用による日程調整チャットボットおよび領収書OCRアシスタントの実装。", 0)
    add_bullet_item(doc, "成果: ", "gemini-3.5-flashモデル適用による対話型日程修正機能の最適化、および領収書テキスト解析を100%モジュール化。未開発のコールバック連結を完了し、システムのロックやフリーズ現象を解決。", 0)

    add_heading_2(doc, "3.5 [5週目] Wordレポート自動保存書き出し実装およびUX例外処理の最適化")
    add_bullet_item(doc, "主要タスク: ", "報告書Wordファイルダウンロード形式の設計およびシステムの回復性（Resilience）の補強。", 0)
    add_bullet_item(doc, "成果: ", "書き出しと同時にFirestore DB에 자동 저장되는 융합형 다운로드를 구현하였으며, 삭제 취소 먹통 모달 버그 및 비회원 권한 크래시를 전면 해결함.", 0)

    add_heading_1(doc, "4. 今後のロードマップおよび総合結論")
    p = add_custom_para(doc)
    add_run(p, "本O1BOスマート出張および勤怠ソリューションは、2026-1学期の開発過程を通じて、実務ビジネス現場に投入できるほど成熟した完成度に到達しました。今後の開発目標としては、")
    add_run(p, "①スマートフォンNFC物理デバイスを連動したGPS+NFCの二重セキュリティ検証体系の実装、②ネットワークが切断されたオフライン環境でもローカルキューにチェックインを一時保存するPWAの高度化", bold=True)
    add_run(p, "を目標とし、エンタープライズレベルの安定性を追加で確保する予定です。")

    doc.save(output_path)

def create_week1_doc(output_path):
    """File 2: 1週目_開発内容_日本語.docx"""
    doc = Document()
    setup_page(doc, "1週目 開発報告書")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 1週目 開発内容報告書\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "テーマ: React & Vite初期環境構築および多言語支援設計", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 開発概要および目標")
    p = add_custom_para(doc)
    add_run(p, "本1週目の開発では、最新のフロントエンドビルドアーキテクチャを導入して迅速かつ高性能なSPA（Single Page Application）ベースの構造を確立し、O1BOのUIコンポーネントの骨格と多言語グローバルパックを基本構成に定着させることを主要目標として進行しました。")

    add_heading_1(doc, "2. 詳細開発および技術的実装事項")
    
    add_heading_2(doc, "2.1 ViteおよびReact 18、TypeScriptフレームワークの融合")
    add_bullet_item(doc, "Viteバンドラー設定: ", "従来の重いWebpackに比べて100倍高速なHMR（Hot Module Replacement）速度を提供するVite 5.xおよびNodeバンドラーの結合。", 0)
    add_bullet_item(doc, "TypeScript厳格モードの適用: ", "データモデルの全領域に厳格な静的タイプチェック（Strict Mode）を宣言し、ランタイムのNullエラーを根本的に制御するためのtsconfig.jsonの構成。", 0)
    
    add_heading_2(doc, "2.2 Tailwind CSSを活用したレスポンシブUIおよび統合デザインシステム")
    add_bullet_item(doc, "レスポンシブグリ드システム: ", "デスクトップ管理者ダッシュボードとスマートフォン社員専用ウェブビューの柔軟な画面可変性のために、Tailwindのレスポンシブユーティリティクラスを導入。", 0)
    add_bullet_item(doc, "統合アイコンコンポーネント: ", "Lucide Reactベースの統合アイコンセット「components/Icons.tsx」を作成し、システム全体で軽量かつ洗練されたアイコンを単一モジュールとして再利用できるように構造化。", 0)

    add_heading_2(doc, "2.3 タブベースの仮想ルーティング(ViewState)および多言語支援システム(i18n)")
    add_bullet_item(doc, "ViewStateルーター: ", "重いブラウザルーターの代わりに、状態値であるViewState（HOME, TRIPS, NEW_TRIP, REPORTSなど）を導入し、遅延が一切ないSPA仮想ナビゲーションを構築。", 0)
    add_bullet_item(doc, "多言語統合設計: ", "韓国語（ko）と日本語（ja）をリアルタイムで相互に即座に切り替えられるように、App.tsx内に統合翻訳辞書をロードし、ユーザーの優先テーマをキャッシュ処理。", 0)

    add_heading_1(doc, "3. 開発成果および産出物")
    headers = ["産出ファイルパス", "主要構成要素および役割", "技術的意義"]
    rows = [
        ["/package.json", "Vite, React 18, Tailwind依存関係の定義", "プロジェクト主要ビルドライブラリの規定"],
        ["/App.tsx (初期型)", "ViewState制御ループおよび翻訳リソース", "統合画面遷移および多言語切り替えロジックの宣言"],
        ["/components/Icons.tsx", "Lucide Reactベースの統合ベクトルアイコンセット", "デザイン一貫性の確保およびアイコンモジュールの読み込み軽量化"],
        ["/tsconfig.json", "TypeScriptコンパイラおよびモジュール解釈規則", "タイプセーフなコーディング規律およびコンパイル環境の確立"]
    ]
    add_styled_table(doc, headers, rows)

    add_callout(doc, "1週目の開発結果、ロードおよび操作の遅延が極限まで制御された最適なフロントエンドモジュールの骨格が完成しました。これは今後の外部APIおよびデータベース通信レイヤーを載せるための頑丈な土台となります。", "1週目 要約")

    doc.save(output_path)

def create_week2_doc(output_path):
    """File 3: 2週目_開発内容_日本語.docx"""
    doc = Document()
    setup_page(doc, "2週目 開発報告書")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 2週目 開発内容報告書\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "テーマ: Firebase統合およびプライバシー保護型データ構造設計", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 開発概要および目標")
    p = add_custom_para(doc)
    add_run(p, "本2週目には、クラウドバックエンドインフラの構築を最優先の目標としました。")
    add_run(p, "サーバーレス（Serverless）アーキテクチャであるFirebase BaaS (Backend-as-a-Service)", bold=True)
    add_run(p, "を導入し、Authentication（ユーザー認証）とFirestore NoSQL DBを連動させ、管理者の権限統制と社員のプライバシー権限を厳格に相互隔離するDBルールとタイプ構造の設計を完了しました。")

    add_heading_1(doc, "2. 詳細開発および技術的実装事項")
    
    add_heading_2(doc, "2.1 Firebase AuthおよびFirestore連動インフラの完成")
    add_bullet_item(doc, "認証ゲートウェイ: ", "Firebase Google Social Sign-inを統合連動し、企業ユーザーの参入障壁を最小化。", 0)
    add_bullet_item(doc, "Firestore初期化: ", "クライアントがリアルタイム文書スナップショットリスナーを介して高速にデータを同期するようにfirebase.tsを設定。", 0)

    add_heading_2(doc, "2.2 데이터 도메인 타입 정의 및 6자리 회사 코드 아키텍처")
    add_bullet_item(doc, "厳格なタイプスキーマ (types.ts): ", "TypeScriptを介してUser, Trip, ItineraryItem, CheckInRecord, Expenseデータスキーマを高度に構造化。", 0)
    add_bullet_item(doc, "会社連動コード発行メカニズム: ", "管理者の加入時に即座に固有の6桁の大文字会社コード（例：'XY83A1'）が自動生成されるように設計。社員はホーム画面で管理者から発行された会社コードを入力することで、同一ドメイン内のグループとして論理的にバインドされる構造を設計。", 0)

    add_heading_2(doc, "2.3 データ隔離（Data Segregation）設計およびプライバシーセキュリティ体系")
    add_callout(doc, "O1BOの核となる価値: 管理者（雇用主）は社員の「勤怠情報（チェックイン/チェックアウト）」のみをモニタリングでき、社員の「詳細な出張日程（Itinerary）」、「個人メモ」、「支出内訳および領収書（Expenses）」には絶対にアクセスできません。", "プライバシーセグリゲーション原則", border_color_hex="319795")
    add_bullet_item(doc, "Firestoreセキュリティルール (firestore.rules) コーディング: ", "tripsおよびexpensesコレクションは、その文書を作成した本人（uid === resource.data.userId）のみが作成・閲覧・更新・削除できるように根本的に隔離するルールを指定。", 0)
    add_bullet_item(doc, "チェックイン情報の共有ルール: ", "checkInsコレクションに限ってのみ、本人またはそのレコードのcompanyCodeと連動した管理者アカウントのみが照会可能になるよう、二重のセキュリティチェック関数（isCompanyAdmin）を実装。", 0)

    add_heading_1(doc, "3. 開発成果 및 산출물")
    headers = ["開発ファイルパス", "設計されたスキーマ / 技術적 속성", "セキュリティ等級"]
    rows = [
        ["/firebase.ts", "Firebase SDK App初期化、AuthおよびDBインスタンスのエクスポート", "セキュリティ主要統制ライン"],
        ["/types.ts", "User, Trip, CheckInRecord, Expenseインターフェースの確立", "タイプセーフティの確保"],
        ["/firestore.rules", "isAuthenticated(), isCompanyAdmin()セキュリティルールの宣言", "バックエンド最終防御ライン (A等級)"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_week3_doc(output_path):
    """File 4: 3週目_開発内容_日本語.docx"""
    doc = Document()
    setup_page(doc, "3週目 開発報告書")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 3週目 開発内容報告書\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "テーマ: 高精度GPS位置ベース自動勤怠チェックイン/アウト実装", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 開発概要および目標")
    p = add_custom_para(doc)
    add_run(p, "本3週目には、出張管理に実質的なデータの定量的価値を付与する")
    add_run(p, "高精度GPSベースの自動出張検証モジュール", bold=True)
    add_run(p, "を設計しました。社員が出張現地に到着した際、不正な出張を防止するために、指定された出張地座標を基準とする特定の距離半径内でのみチェックインが有効化されるモジュールを作成し、管理者のリアルタイムタイムラインダッシュボード画面を構築しました。")

    add_heading_1(doc, "2. 詳細開発および技術적 구현 사항")
    
    add_heading_2(doc, "2.1 Geolocation API統合および高精度緯度経度座標測定")
    add_bullet_item(doc, "高精度ハードウェア通信: ", "ブラウザおよびデバイスのGPSセンサーに直接アクセスし、高精度（highAccuracy）モードで緯度・経度の座標値を取得するlocationService.tsを開発。", 0)
    add_bullet_item(doc, "地図可視化の連動: ", "Leafletオープンソースマップライブラリをバインディングし、社員が自身の現在位置と指定された出張目的地の空間的位置を直感的に確認できるようにインターフェースを結合。", 0)

    add_heading_2(doc, "2.2 Haversine（ハバーサイン）大円距離計算数式の導入")
    p = add_custom_para(doc)
    add_run(p, "社員の現在位置の座標 $P_1(\\phi_1, \\lambda_1)$ と目的地の座標 $P_2(\\phi_2, \\lambda_2)$ の間の球面距離を、地球の半径 $R=6371km$ を基準として精密に計算するハバーサイン数式をJavaScriptエンジンでコーディング：")
    add_callout(doc,
                "d = 2R * arcsin( sqrt( sin^2((lat2 - lat1)/2) + cos(lat1) * cos(lat2) * sin^2((lon2 - lon1)/2) ) )",
                "Haversine Formula", border_color_hex="2B6CB0")
    add_bullet_item(doc, "50mジオフェンシング (Geofencing) 境界: ", "演算された結果の距離が「50m以内」のときのみ有効化されるチェックインボタンのガードを実装。これに満たない場合はチェックインの試行自体を根本的に不可能に制御し、偽装出張を防止。", 0)

    add_heading_2(doc, "2.3 管理者ダッシュボードおよびリアルタイム勤怠タイムライン")
    add_bullet_item(doc, "リアルタイム管理用タイムライン: ", "所属社員が実行したチェックイン/チェックアウトの内訳をリアルタイムで取得し、時間順にレンダリングするダッシュボードを構築。", 0)
    add_bullet_item(doc, "出張時間の自動演算: ", "チェックイン時間とチェックアウト時間をリアルタイムでマッチングし、社員が現地で何時間実勤務を行ったかをチャートで表示するパイプラインを形成。", 0)

    add_heading_1(doc, "3. 開発成果および産出物")
    headers = ["開発モジュールファイル", "適用された技術要素", "動作効果"]
    rows = [
        ["/services/locationService.ts", "HTML5 Geolocation, Haversineアルゴリズム", "緯度/経度のリアルタイム測定および50m離隔距離の計算"],
        ["/App.tsx (管理者ダッシュボード)", "FirestoreリアルタイムSnapshots, Timeline UI", "社員の現地勤怠状態のリアルタイムマップおよび時間順モニタリング"],
        ["/types.ts (CheckInRecord)", "CheckInRecordタイプインターフェース明細", "チェックイン日時、チェックアウト日時、位置座標タイプの規格保証"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_week4_doc(output_path):
    """File 5: 4週目_開発内容_日本語.docx"""
    doc = Document()
    setup_page(doc, "4週目 開発報告書")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 4週目 開発内容報告書\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "テーマ: Gemini 3.5 AI日程調整および領収書OCR精算システム統合", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 開発概要および目標")
    p = add_custom_para(doc)
    add_run(p, "本4週目には、サービスの中で最も革新的な機能である")
    add_run(p, "Google Gemini AIインテリジェンスレイヤーの連動", bold=True)
    add_run(p, "を重点的に実施しました。従来の旧型・非推奨モデルを最新의 프론트엔드 통신 스키마에 맞게 쇄신하고, 사용자의 자연어 프롬프트를 분석하는 챗봇 일정 조율기, 영수증 이미지 OCR 처리기, 그리고 종합 출장 일보를 1초 만에 자동 작성해 주는 초지능형 오토 보고 레이어를 통합 완성하였습니다.")

    add_heading_1(doc, "2. 세부 개발 및 기술적 구현 사항")
    
    add_heading_2(doc, "2.1 旧モデル名の削除および最新Gemini 3.5 Flashモデルへの置き換え")
    add_bullet_item(doc, "Gemini APIモデルの更新: ", "従来の不完全またはサポート終了となった「gemini-3-flash-preview」レガシー参照構文を、完全に正式なバージョンである「gemini-3.5-flash」へ一斉に補強。", 0)
    add_bullet_item(doc, "Vite API Key安全装置: ", "配備およびバンドル時にAPIキーの参照が消失しないように、process.env.GEMINI_API_KEYおよびprocess.env.API_KEYの二重バインディングを宣言。", 0)

    add_heading_2(doc, "2.2 自然語AIビジネス日程自動調整および領収書OCRシステム")
    add_bullet_item(doc, "日程の対話型加工 (geminiService.ts): ", "「東京2泊3日ITカンファレンス参加の日程を組んで」とチャットボットに入力すると、AI가 정확한 시간대별 Itinerary JSON을 구성하여 캘린더에 로드하는 기술 구축。", 0)
    add_bullet_item(doc, "領収書画像解析OCR (Receipt OCR): ", "社員がスマートフォンのカメラで領収書を撮影してアップロードすると、AIが画像内のピクセルを直接分析して加盟店名、支出金額、決済日、支出項目カテゴリをリアルタイムで抽出してDBに自動的に記入するシステムを完成。", 0)

    add_heading_2(doc, "2.3 未実装の主要AIコールバック連結によるシステム停止(Freezing)の完全修復")
    add_callout(doc, "従来のコード上で「概要作成」および「日報自動作成」ボタンを押すだけでビューポート内部で深刻なエラーが誘発されたり、画面がフリーズしてしまっていた空の関数（Empty Callbacks）バグを根本的に解決しました。", "エラー解決主要報告", border_color_hex="1A365D")
    add_bullet_item(doc, "handleGenerateReportの実体化: ", "アクティブな出張のチェックイン記録、領収書支出リスト、詳細な日程を即座にスクレーピングして、一度に要約マークダウンレポートに統合・編集する非同期主要ロジックを完成。", 0)
    add_bullet_item(doc, "handleAiScheduleAction의 이식: ", "チャットベースの対話履歴から「明日午後2時にA社を追加」のようなコマンドを認識した際、既存の日程配列を自動スキャンして正確な時間順に日程アイテムを挿し込んで再整列するインテリジェントなビジネスアルゴリズムを完備。", 0)

    add_heading_1(doc, "3. 開発成果および産出物")
    headers = ["開発ファイルパス", "AI主要役割", "期待効果"]
    rows = [
        ["/services/geminiService.ts", "gemini-3.5-flash APIインターフェース設計", "自然語ベースの日程生成および領収書OCRの精密マッピング"],
        ["/App.tsx (AIコントローラー)", "handleGenerateReport, handleAiScheduleAction実装", "ボタンクリック時の画面ハングバグの完璧な修正および自動精算の実体化"],
        ["/types.ts", "Tripインターフェースにreport?: string;キャッシュ明細の補強", "日報情報の持続的なキャッシュ確保によりデータ通信遅延時間を最小化"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_week5_doc(output_path):
    """File 6: 5週目_開発内容_日本語.docx"""
    doc = Document()
    setup_page(doc, "5週目 開発報告書")
    
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO 5週目 開発内容報告書\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "テーマ: Wordレポート自動保存書き出し実装およびUX例外処理の最適化", size_pt=11, color_hex="4A5568")
    
    add_heading_1(doc, "1. 開発概要および目標")
    p = add_custom_para(doc)
    add_run(p, "本5週目には、O1BOサービスのインフラとしての実用性を最高潮に高める")
    add_run(p, "文書抽出の自動化およびフロントエンド品質強化 (UX/UI例外復旧)", bold=True)
    add_run(p, "を重点的に実施しました。AIが生成したレポートを企業報告用のMS Wordファイル（.doc/.docx）へダイレクトに変換するモジュールを組み込み、確認モーダルの脱出不可バグの解決、およびネットワークのオフライン/ゲストセッション時のDBアクセスランタイムエラー防御壁を構築しました。")

    add_heading_1(doc, "2. 詳細開発および技術的実装事項")
    
    add_heading_2(doc, "2.1 MS Word互換書式の反映ダウンロードモジュールおよび日本語エンコーディングの保証")
    add_bullet_item(doc, "XML互換書式の前処理: ", "MS Wordがプリンターレイアウト規格を即座に解析するようにXMLメタタグを移植し、韓国および日本オフィス向けに最適化された書式（Meiryo, Segoe UIなど）をスタイルシートに注入。", 0)
    add_bullet_item(doc, "UTF-8 BOM (Byte Order Mark) 注入: ", "日本語および漢字のエンコーディングが文字化けせずに完全に出力されるよう、ファイルヘッダーに '\\ufeff' バイトコードを物理的に結合してBlobダウンロードを実行。", 0)

    add_heading_2(doc, "2.2 Word書き出し時のFirestoreクラウドバックグラウンド自動保存連動")
    add_bullet_item(doc, "One-Click Completeフロー: ", "ユーザーが「Wordへ書き出し」を押した瞬間、ローカルデバイスへファイルがダウンロードされると同時に、Firestoreデータベースの当該出張レコード（'report' フィールド）へ最新の作成文章をバックグラウンドで安全に先（事前）保存。", 0)
    add_bullet_item(doc, "メインダッシュボードへの復帰およびトースト案内: ", "保存完了と同時に「日報ファイルが正常に保存され、Wordへ書き出しされました！」という成功フィードバックのトーストウィンドウを表示し、ユーザーのビューをメイン画面（Home Dashboard）へとスムーズに遷移（リダイレクト）させる動的なUXを実現。", 0)

    add_heading_2(doc, "2.3 削除確認モーダルへの閉じ込め（Stuck）現象およびキャンセルエラーの完全修復")
    add_bullet_item(doc, "モーダル脱出不可の原因: ", "従来のコードが削除確認ウィンドウのキャンセルおよび削除確認ボタンの両方にグローバルローディングフラグ（disabled={loading}）を強制的に結合していたため、バックグラウンドスタックオーバーフロー発生時にモーダルからキャンセルすら押せなくなり、永久にロックがかかる致命的な欠陥を識別。", 0)
    add_bullet_item(doc, "構造的な分離による解決: ", "キャンセルボタンからdisabled属性を完全に撤去してローディング中にも常時脱出可能にし、削除ボタンクリック時に非同期レンダリングスタックの遅延なく「即座にモーダルを閉じる」動作を先行させた後、非同期データベース接続をtry-finallyブロックでバックグラウンド処理することでデッドロック状態を完全に打破。", 0)

    add_heading_2(doc, "2.4 ゲスト(Guest)非会員環境におけるFirestoreセキュリティクラッシュ防御")
    add_bullet_item(doc, "楽観的アップデート (Optimistic Update) & Fallback: ", "認証セッションがないテスト（Anonymous）環境でもCRUD処理が正常に動作するよう、ローカルReact状態リスト（upcomingTrips, checkInsなど）およびlocalStorageバックアップ体系を構築し、DB権限エラーによる画面のブランクホワイトアウト現象を遮断。", 0)

    add_heading_1(doc, "3. 開発成果および産出물")
    headers = ["修正完了ファイル", "パッチされたソリューション技術", "セキュリティおよび性能改善"]
    rows = [
        ["/App.tsx (Wordエクスポート)", "handleExportToWord비동기 스레드 구축", "ワンクリックダウンロード＋Firebase同時セーブを実装"],
        ["/App.tsx (Confirmモーダル)", "disabledガード의 철폐 & try-finally 로딩 해제", "削除確認ウィンドウの永久フリーズバグを前面解決"],
        ["/App.tsx (DB트랜잭션)", "낙관적 UI 선행 반영 및 try-catch 감싸기", "ゲストモードにおけるFirestore権限エラーによる異常停止を前面遮断"]
    ]
    add_styled_table(doc, headers, rows)

    doc.save(output_path)

def create_project_intro_doc(output_path):
    """File 7: プロジェクト紹介および構成_日本語.docx"""
    doc = Document()
    doc_title = "プロジェクトガイドおよび構造分析書"
    setup_page(doc, doc_title)
    
    # Title
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "スマート出張管理および勤怠確認システム\n", size_pt=20, color_hex="1A365D", bold=True)
    add_run(p_title, "O1BOプロジェクト設計および構造分析書", size_pt=13, color_hex="4A5568")
    
    add_callout(doc, 
                "本文書は、スマート出張管理システム [O1BO]のアーキテクチャ、フォルダおよびソースコードの構成、徹底したプライバシー保護のためのデータ分離原則、そしてデータベースセキュリティルールを包括的に記述した総合白書です。", 
                "紹介 (About the Project)", border_color_hex="1A365D")
    
    add_heading_1(doc, "1. プロジェクトビジョンおよび企画目的")
    p = add_custom_para(doc)
    add_run(p, "伝統的な企業環境における出張処理は、非常に煩雑でエラーが頻発する行政的な消耗戦でした。")
    add_run(p, "O1BO(One-Stop Business Organizer) スマート出張システム", bold=True)
    add_run(p, "は、AIアシスタントおよび高精度ジオフェンシング技術を融合し、出張計画の樹立から経路確認、現場でのチェックイン勤怠検証、経費の自動OCR、そして自動日報レポート作成までのすべてのワークフローをワンストップで処理します。特に、社員の個人生活（詳細日程および領収書）は徹底的に保護し、会社は必要な最小限の勤怠データ（チェックインの有無）のみを透明に確認する共生型セキュリティソリューションを誇ります。")

    add_heading_1(doc, "2. システムアーキテクチャおよびフォルダ構造")
    p = add_custom_para(doc)
    add_run(p, "O1BOプロジェクトは、React 18 SPAを基盤とし、超高速バンドラーVite、静的タイプセーフティTypeScript、FirebaseサーバーレスクラウドDB、그리고 Google Gemini AI를 통합 결합한 최첨단 하이브리드 아키텍처로 구현되었습니다.")
    
    headers = ["フォルダ / 파일 이름", "핵심 담당 역할 및 기능", "비고"]
    rows = [
        ["/components/Icons.tsx", "Lucide Reactベースの統合ベクトルアイコンコレクション", "デザイン一貫性の確保"],
        ["/services/geminiService.ts", "Google Gemini AIベースのチャットボット日程生成、領収書OCR、マークダウン日報生成", "gemini-3.5-flashモデル適用"],
        ["/services/locationService.ts", "Geolocation APIおよびHaversine球面大円距離演算アルゴリズム", "50m誤差自動チェックイン検証"],
        ["/App.tsx", "メインアプリケーション状態（State）コントローラーおよび権限別UIレンダリング", "SPA仮想ルーティング担当"],
        ["/types.ts", "User, Trip, ItineraryItem, CheckInRecord, Expense데이터 스펙 선언", "TypeScriptタイプ規格の定義"],
        ["/firestore.rules", "バックエンドFirestoreデータベースの厳格なユーザー別アクセス制御", "プライバシー守護の最終障壁"]
    ]
    add_styled_table(doc, headers, rows)

    add_heading_1(doc, "3. プ라이버시 보호 및 보안 설계 모델")
    p = add_custom_para(doc)
    add_run(p, "O1BO는 사원의 인권과 정보 보안을 위해 ")
    add_run(p, "データ分離セグリゲーション(Data Segregation)", bold=True)
    add_run(p, " 原則を徹底して遵守します。管理者が所属する会社の社員であっても、社員の詳細な出張私的動線や経費の使用先、カード領収書の原本画像ファイルなどは、データベースアクセスの段階から雇用主（社長）アカウントの読み取り/照会が根本的に徹底して遮断されます。")
    
    add_heading_2(doc, "3.1 Firestoreバックエンドセキュリティルール(firestore.rules)の内部統制ライン")
    p = add_custom_para(doc)
    add_run(p, "フロントエンドのJavaScript迂回やハッキングツールを使用したDB強制照会を防御するため、Firestore Security Rules에 엄격한 인권 격리 알고리즘을 이식하였습니다.")
    add_bullet_item(doc, "Trips 및 Expenses 규칙: ", "allow read, write: if request.auth.uid == resource.data.userId;의 적용을 통해, 로그인한 소유자 외에는 관리자나 시스템 관리자조차 해당 레코드에 접근 불가능하도록 백엔드 최종 단계에서 즉시 Drop 처리합니다.", 0)
    add_bullet_item(doc, "CheckIns 규칙: ", "allow read: if request.auth.uid == resource.data.userId || isCompanyAdmin(resource.data.companyCode);を通じて、唯一勤怠（チェックイン/アウト時刻および場所名）データのみが社員本人および所属会社の管理者アカウントに相互連動して透明に照会されるよう設計完了。", 0)

    add_heading_1(doc, "4. 二重出張認証システム (NFC物理タギング) 技術ロードマップ")
    p = add_custom_para(doc)
    add_run(p, "今後アップデート予定の")
    add_run(p, "二重出張認証システム (GPS + NFC物理結合)", bold=True)
    add_run(p, "は、GPSベースの現行ジオフェンシングをさらに信頼できるように強化する予定です。")
    add_bullet_item(doc, "1段階: ", "社員が現場に到着し、スマートフォンアプリのGPSセンサー判別（50m）を経て手動で1次チェックイン/チェックアウトを実行します。", 0)
    add_bullet_item(doc, "2段階: ", "出張目的地のオフィスデスクなどに備え付けられたセキュリティ暗号化NFC物理タグステッカーにスマートフォンを密着タギングし、ハードウェア的な実際の訪問有無を最終2次エビデンス（Physical Anti-Fake）処理します。", 0)
    add_bullet_item(doc, "対外的波及効果: ", "GPS操作アプリケーション（Fake GPSなど）を根本的に無力化し、社員と企業の双方が法的に信頼できる実勤務データを確保することで、紛争のない勤怠エコシステムを完成させます。", 0)

    doc.save(output_path)

if __name__ == "__main__":
    out_dir = r"c:\Users\User\.gemini\antigravity-ide\scratch\01BO\개발내역"
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    print("O1BO Japanese Word Document Generation Script Initialized...")
    
    docs_to_create = [
        ("2026-1学期_進行内容_日本語.docx", create_semester_summary_doc),
        ("1週目_開発内容_日本語.docx", create_week1_doc),
        ("2週目_開発内容_日本語.docx", create_week2_doc),
        ("3週目_開発内容_日本語.docx", create_week3_doc),
        ("4週目_開発内容_日本語.docx", create_week4_doc),
        ("5週目_開発内容_日本語.docx", create_week5_doc),
        ("プロジェクト紹介および構成_日本語.docx", create_project_intro_doc)
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
