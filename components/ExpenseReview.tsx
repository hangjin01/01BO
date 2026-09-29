import React from 'react';
import type { Lang } from '../types';

export interface ExpenseDraft {
  tripId: string;
  merchant: string;
  amount: string;
  date: string;
  category: string;
  currency: string;
  preview?: string;
}
export function ExpenseReview({ draft, setDraft, onSave, onCancel, busy, language }: {
  draft: ExpenseDraft; setDraft: (draft: ExpenseDraft) => void; onSave: () => void;
  onCancel: () => void; busy: boolean; language: Lang;
}) {
  const ja = language === 'ja';
  return <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="expense-review-title" className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto space-y-4">
      <h2 id="expense-review-title" className="font-bold text-lg">{ja ? '経費の確認' : '경비 확인 및 수정'}</h2>
      <p className="text-sm text-gray-500">{ja ? '内容を確認してから保存してください。現在は日本円に対応しています。' : '금액과 날짜를 확인한 뒤 저장해 주세요. 현재 일본 엔화 경비를 지원합니다.'}</p>
      {draft.preview && <img src={draft.preview} alt={ja ? '領収書' : '영수증'} className="max-h-40 mx-auto object-contain" />}
      <form onSubmit={event => { event.preventDefault(); onSave(); }} className="space-y-3">
        <label className="block text-sm">{ja ? '店舗名' : '가맹점'}<input required value={draft.merchant} onChange={e => setDraft({ ...draft, merchant: e.target.value })} className="block w-full border rounded p-2 text-gray-900" /></label>
        <label className="block text-sm">{ja ? '金額 (JPY)' : '금액 (JPY)'}<input required type="number" min="0" step="1" value={draft.amount} onChange={e => setDraft({ ...draft, amount: e.target.value })} className="block w-full border rounded p-2 text-gray-900" /></label>
        <label className="block text-sm">{ja ? '日付' : '날짜'}<input required type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} className="block w-full border rounded p-2 text-gray-900" /></label>
        <label className="block text-sm">{ja ? '分類' : '분류'}<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="block w-full border rounded p-2 text-gray-900">
          <option value="Meals">{ja ? '食費' : '식비'}</option><option value="Transport">{ja ? '交通費' : '교통비'}</option><option value="Hotel">{ja ? '宿泊費' : '숙박비'}</option><option value="Other">{ja ? 'その他' : '기타'}</option>
        </select></label>
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={onCancel}>{ja ? 'キャンセル' : '취소'}</button><button type="submit" disabled={busy} className="bg-orange-500 text-white px-5 py-2 rounded-lg disabled:opacity-50">{busy ? (ja ? '保存中…' : '저장 중…') : (ja ? '保存' : '저장')}</button></div>
      </form>
    </section>
  </div>;
}
