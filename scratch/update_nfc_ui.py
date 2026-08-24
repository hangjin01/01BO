import os

filepath = 'App.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. NFC Check-out Button wrapping
target_nfc_block = """                                                                                      {/* NFC Check-out Button */}
                                                                                      {!isNfcCheckedOut ? (
                                                                                          <button 
                                                                                              onClick={() => handleCheckOut(item.id)}
                                                                                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-all shadow-sm"
                                                                                          >
                                                                                              ⚡ {t.btn_nfc_checkout || 'NFC 체크아웃'}
                                                                                          </button>
                                                                                      ) : (
                                                                                          <div className="flex-1 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400 text-center text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                                                                              <span>⚡</span> {t.status_nfc_checked_out || 'NFC 완료'}
                                                                                          </div>
                                                                                      )}"""

replacement_nfc_block = """                                                                                      {/* NFC Check-out Button */}
                                                                                      {isNfcCheckoutEnabled && (
                                                                                          !isNfcCheckedOut ? (
                                                                                              <button 
                                                                                                  onClick={() => handleCheckOut(item.id)}
                                                                                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-all shadow-sm"
                                                                                              >
                                                                                                  ⚡ {t.btn_nfc_checkout || 'NFC 체크아웃'}
                                                                                              </button>
                                                                                          ) : (
                                                                                              <div className="flex-1 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400 text-center text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                                                                                  <span>⚡</span> {t.status_nfc_checked_out || 'NFC 완료'}
                                                                                              </div>
                                                                                          )
                                                                                      )}"""

# 2. Completion Text wrapping
target_text_block = """                                                                                      <span>🎉</span> {language === 'ja' ? 'チェックアウト完了' : '체크아웃 완료 (2중 검증)'}"""

replacement_text_block = """                                                                                      <span>🎉</span> {language === 'ja' 
                                                                                          ? (isNfcCheckoutEnabled ? 'チェックアウト完了 (2重検証)' : 'チェックアウト完了') 
                                                                                          : (isNfcCheckoutEnabled ? '체크아웃 완료 (2중 검증)' : '체크아웃 완료')}"""

if target_nfc_block in content:
    content = content.replace(target_nfc_block, replacement_nfc_block)
    print("NFC block replaced successfully.")
else:
    print("NFC block NOT found!")

if target_text_block in content:
    content = content.replace(target_text_block, replacement_text_block)
    print("Text block replaced successfully.")
else:
    print("Text block NOT found!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
