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
    set_run_styles(run_title, name="Meiryo", size_pt=9.5, color_hex=border_color_hex, bold=True)
    run_text = p.add_run(text)
    set_run_styles(run_text, name="Meiryo", size_pt=9.5, color_hex="4A5568", italic=True)
    
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
        set_run_styles(run_bold, name="Meiryo", size_pt=10, color_hex="2D3748", bold=True)
        
    run_text = p.add_run(text)
    set_run_styles(run_text, name="Meiryo", size_pt=10, color_hex="2D3748")
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
        hrun = hp.add_run(f"O1BO スマート出張管理システム | {doc_title}")
        set_run_styles(hrun, name="Meiryo", size_pt=8.5, color_hex="718096")
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Confidential — O1BO バックエンド連動 & 拡張開発ガイド")
        set_run_styles(frun, name="Meiryo", size_pt=8, color_hex="A0AEC0", italic=True)

def generate_guide():
    doc = Document()
    doc_title = "バックエンド連動および今後の開発ガイド"
    setup_page(doc, doc_title)
    
    # Title
    p_title = add_custom_para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_run(p_title, "O1BO バックエンド連動および今後の追加開発ガイド白書\n", size_pt=18, color_hex="1A365D", bold=True)
    add_run(p_title, "BaaSインフラ設定および2重NFC物理チェックイン＆PWAオフラインキャッシュ設計法", size_pt=11, color_hex="4A5568")
    
    add_callout(doc, 
                "本文書は、O1BOスマート出張管理アプリケーションを新規バックエンド（Firebase）プロジェクトへ連動する手順と、今後革新的に拡張導入するGPS+NFC二重勤怠認証およびPWAベースのオフライン保存・バックグラウンド同期システムの実装方法を詳細なサンプルコードとともに提供します。", 
                "紹介 (About the Guide)", border_color_hex="1A365D")
    
    add_heading_1(doc, "1. バックエンド (Firebase BaaS) 連動およびマイグレーションガイド")
    p = add_custom_para(doc)
    add_run(p, "O1BOは、サーバーを直接構築せずにバックエンドをAPI形式で借りて使用する")
    add_run(p, "BaaS (Backend-as-a-Service) パラダイムの最高峰であるFirebase", bold=True)
    add_run(p, "を基盤として稼働します。新しいFirebaseコンソールを作成し、フロントエンドプロジェクトをマッピングする段階は以下の通りです。")

    add_heading_2(doc, "1.1 Firebaseプロジェクトおよびアプリの設定")
    add_bullet_item(doc, "プロジェクト作成: ", "Google Firebase Console (https://console.firebase.google.com/) にアクセスし、「プロジェクトを追加」をクリックして、プロジェクト名を「O1BO-App」などで登録します。", 0)
    add_bullet_item(doc, "ウェブアプリ (Web App) 登録: ", "プロジェクトの概要画面でウェブ（Web）アイコン（</>）を押してアプリを追加登録し、発行されたfirebaseConfig JSONオブジェクトを取得します。", 0)
    add_bullet_item(doc, "Googleソーシャルログインの有効化: ", "Firebase Buildメニューの「Authentication」に入り、開始するをクリックして、Sign-in methodタブで「Google」プロバイダーを有効（Enable）にします。", 0)

    add_heading_2(doc, "1.2 ローカル環境変数 (.env) の構成およびfirebase.tsへの適用")
    p = add_custom_para(doc)
    add_run(p, "プロジェクトのルートディレクトリにある「.env.example」ファイルを参考にして、実際の秘密キーとエンドポイント情報が含まれる「.env」ファイルを新規作成します。この変数はViteバンドラーの属性によりフロントエンドへロードされます：")
    
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

    add_heading_2(doc, "1.3 バックエンドFirestoreセキュリティルール (firestore.rules) の手動設定")
    p = add_custom_para(doc)
    add_run(p, "Firestore Databaseを有効化（アジアリージョン設定を推奨）した後、プライバシー保護の防壁であるfirestore.rulesファイルの規則をコンソールの「Rules」タブにコピーして貼り付け、公開（Publish）します。このルールはサーバーレスアーキテクチャの唯一のバックエンド守護ラインです：")
    
    rules_code = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ヘルパー: ユーザーが有効にログインされた状態か検査
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // ヘルパー: 現在のログインユーザーが当該会社コードの管理者(社長)か検査
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
      // 個人的な日程リストは、所有した本人(userId)のみCRUD可能 (雇用主も閲覧不可)
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    match /checkIns/{checkInId} {
      // 勤怠データは、本人または該当会社の管理者(雇用主)のみ照会可能
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

    add_heading_1(doc, "2. 今後の追加機能の実装設計: 二重勤怠認証 (Web NFC API)")
    p = add_custom_para(doc)
    add_run(p, "GPS位置偽装プログラム（Fake GPSなど）を使用した不正出張・打刻行為を根本的に遮断するため、モバイルウェブブラウザで")
    add_run(p, "物理NFCタグチップステッカーに密着タギングしたときにのみ最終チェックインが承認される二重勤怠検証システム", bold=True)
    add_run(p, "を設計します。")

    add_heading_2(doc, "2.1 Web NFC (NDEFReader) アーキテクチャおよび連動原理")
    add_bullet_item(doc, "動作フロー: ", "ユーザーがチェックインボタンを押すとGPS距離を1次測定し、50m半径内に入った場合にNFCタギング指示ポップアップが有効化されます。スマートフォンの背面を現地のNFCチップステッカーに接触させると、固有の認証トークンを受信して2次の物理検証を完了します。", 0)
    add_bullet_item(doc, "サポート範囲: ", "ハードウェア的にNFCリーダーが搭載されたAndroidデバイスのChromeブラウザ、iOS SafariのPWAウェブビュー環境などで即座に動作可能です。", 0)

    add_heading_2(doc, "2.2 NFCタグ読み取りの核心実装Javascriptサンプルコード")
    nfc_code = """// Reactコンポーネント内でのNFC読み取り実装スニペット
const handleNfcVerification = async (tripId) => {
  if (!('NDEFReader' in window)) {
    alert("このブラウザはNFC物理認識をサポートしていません。最新のChromeモバイルを推奨します。");
    return false;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.scan(); // NFC受信モードの有効化
    console.log("NFCスキャナーが待機中です。デバイスをタグに近づけてください。");

    return new Promise((resolve, reject) => {
      ndef.addEventListener("reading", async ({ message, serialNumber }) => {
        // NFC内に保存された固有の会社暗号化トークンの解析
        const decoder = new TextDecoder();
        let validTokenFound = false;

        for (const record of message.records) {
          const text = decoder.decode(record.data);
          // O1BO専用の特殊認証コード検証 (サーバーハッシュと比較)
          if (text === "O1BO_OFFICE_VERIFIED_TOKEN") {
            validTokenFound = true;
          }
        }

        if (validTokenFound) {
          console.log("物理NFCタグ 2次認証成功! シリアル:", serialNumber);
          resolve({ serial: serialNumber, verified: true });
        } else {
          alert("一致しない無効なNFCカードです。");
          resolve({ verified: false });
        }
      });

      ndef.addEventListener("readingerror", () => {
        alert("NFCタグ読み取り中にエラーが発生しました。もう一度お試しください。");
        reject(new Error("NFC Reading Error"));
      });
    });
  } catch (error) {
    console.error("NFCスキャニングエラー:", error);
    return { verified: false, error };
  }
};"""
    add_code_block(doc, nfc_code)

    add_heading_1(doc, "3. 今後の追加機能の実装設計: オフラインキャッシュ (PWA)")
    p = add_custom_para(doc)
    add_run(p, "出張地域が山間部であったり、地下ビルの内部などのためにモバイルインターネット網が不安定な場合でも正常に操作できるよう、")
    add_run(p, "PWA (Progressive Web App) オフラインモード", bold=True)
    add_run(p, "を導入します。これはサービスワーカー（Service Worker）とIndexedDBブラウザローカルデータベースを調和させて稼働させます。")

    add_heading_2(doc, "3.1 Vite PWAプラグイン設定ガイド")
    add_bullet_item(doc, "プラグインのインストール: ", "npm install -D vite-plugin-pwa コマンドを実行し、vite.config.tsを構成してmanifest.jsonおよびオフラインprecachingルールを付与します。", 0)
    add_bullet_item(doc, "IndexedDBバックアップ: ", "ユーザーがオフライン状態のときに「チェックイン/チェックアウト」を試むと、Firebase SDKがエラーを吐く代わりに、ローカルのIndexedDBに該当トランザクションをキュー（Queue）として一時的に積載します。", 0)

    add_heading_2(doc, "3.2 PWAバックグラウンド同期 (Background Sync API) サンプルコード")
    p = add_custom_para(doc)
    add_run(p, "ネットワークが再びオンライン（'online' イベント検知）に変更された直後、サービスワーカーがIndexedDB의 큐를 읽어 Firestore 백엔드로 일괄 전송(Batch commit) 처리하는 백그라운드 싱크 모듈 스니펫입니다:")
    
    pwa_code = """// service-worker.js (Vite PWA バックグラウンド同期スニペット)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Viteプリキャッシュルーティング初期化
precacheAndRoute(self.__WB_MANIFEST);

// バックグラウンド同期プラグインの定義
// ネットワーク切断により失敗したPOST/PUT要求を自動的にリトライします
const bgSyncPlugin = new BackgroundSyncPlugin('checkInSyncQueue', {
  maxRetentionTime: 24 * 60, // 最大24時間保存してリトライ
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shift())) {
      try {
        const checkInData = await entry.request.clone().json();
        // Firestore REST APIを呼び出してバックグラウンドで動的にチェックイン状態を記録
        await fetch('https://firestore.googleapis.com/v1/projects/o1bo-app/databases/(default)/documents/checkIns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${checkInData.authToken}`
          },
          body: JSON.stringify(checkInData.payload)
        });
        console.log("オフラインチェックイン記録がバックグラウンドで正常にクラウドへ同期されました!");
      } catch (error) {
        console.error("同期リトライ失敗。キューに再登録します。", error);
        await queue.unshift(entry);
        throw error;
      }
    }
  }
});

// チェックインAPIルーターにバックグラウンド同期プラグインを装備
registerRoute(
  /\/databases\/\(default\)\/documents\/checkIns/,
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);"""
    add_code_block(doc, pwa_code)

    add_heading_1(doc, "4. 結論および磁気的結合体系の構築")
    p = add_custom_para(doc)
    add_run(p, "本開発ガイド白書に明記されたFirebaseマイ그レーションポリシー, Web NFC 물리 암호 토큰 인증, 그리고 PWA 백그라운드 오프라인 동기화 모듈을 차례로 연쇄 구현함으로써, O1BO는 비단 단순 모바일 웹 클라이언트를 넘어 어떠한 현장 통신 장애 속에서도 기기의 하드웨어를 직접 활용해 절대적인 신뢰도를 갖추는 ")
    add_run(p, "エン터プライズレベルの勤怠管理プラットフォーム", bold=True)
    add_run(p, "への完璧な成長を保証されることになります。")

    # Save documents
    out_dir = r"c:\Users\User\.gemini\antigravity-ide\scratch\01BO\개발내역"
    doc.save(os.path.join(out_dir, "バックエンド連動および今後の開発ガイド_日本語.docx"))
    print("SUCCESS BACKEND GUIDE JA")

if __name__ == "__main__":
    generate_guide()
