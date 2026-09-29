import { Capacitor } from '@capacitor/core';
export const isNativeApp = () => Capacitor.isNativePlatform();
const key = 'o1bo_session_v1';
export async function nativeSessionToken(): Promise<string | undefined> {
  if (!isNativeApp()) return undefined;
  const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
  const keys = await SecureStoragePlugin.keys();
  if (!keys.value.includes(key)) return undefined;
  const raw = await SecureStoragePlugin.get({ key });
  let session: { token?: string; expiresAt?: number };
  try { session = JSON.parse(raw.value); } catch { await SecureStoragePlugin.remove({ key }); return undefined; }
  if (!session || typeof session.token !== 'string' || !/^[a-f0-9]{64}$/.test(session.token) || typeof session.expiresAt !== 'number' || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
    await SecureStoragePlugin.remove({ key }); return undefined;
  }
  return session.token;
}
export async function saveNativeSession(token: string, expiresAt: number): Promise<void> {
  if (!isNativeApp()) return;
  if (!/^[a-f0-9]{64}$/.test(token) || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) throw new Error('로그인 세션이 올바르지 않습니다.');
  const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
  await SecureStoragePlugin.set({ key, value: JSON.stringify({ token, expiresAt }) });
}
export async function clearNativeSession(): Promise<void> {
  if (!isNativeApp()) return;
  const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
  if ((await SecureStoragePlugin.keys()).value.includes(key)) await SecureStoragePlugin.remove({ key });
}
