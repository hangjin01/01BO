// 취소/화면 전환 후 도착한 비동기 결과로 방문을 저장하지 않도록 단계마다 실행 유효성을 확인한다.
import type { LocationFix } from './locationService';

export type NfcStage = 'scanning' | 'verifying' | 'saving';
export async function verifyNfcVisit<T>(steps: {
  read: () => Promise<string>;
  locate: () => Promise<LocationFix>;
  validate: (fix: LocationFix) => void;
  challenge: () => Promise<string>;
  save: (tag: string, fix: LocationFix, challenge: string) => Promise<T>;
  current: () => boolean;
  stage: (stage: NfcStage) => void;
}): Promise<T | undefined> {
  if (!steps.current()) return;
  steps.stage('scanning');
  const tag = await steps.read();
  if (!steps.current()) return;
  steps.stage('verifying');
  const fix = await steps.locate();
  if (!steps.current()) return;
  steps.validate(fix);
  // Start the short server validity window after the user has touched the tag.
  const challenge = await steps.challenge();
  if (!steps.current()) return;
  steps.stage('saving');
  return steps.save(tag, fix, challenge);
}
