import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Keep photo bytes local until the existing receipt OCR flow sends them.
export async function pickReceiptPhoto(source: 'camera' | 'gallery'): Promise<File | null> {
  const options = { quality: 85, targetWidth: 2000, targetHeight: 2000, correctOrientation: true, includeMetadata: false };
  const photo = source === 'camera'
    ? await Camera.takePhoto({ ...options, saveToGallery: false })
    : (await Camera.chooseFromGallery({ ...options, allowMultipleSelection: false })).results[0];
  if (!photo) return null;
  const path = photo.webPath || (photo.uri ? Capacitor.convertFileSrc(photo.uri) : null);
  if (!path) throw new Error('영수증 사진을 열지 못했습니다. 다시 선택해 주세요.');
  const response = await fetch(path);
  if (!response.ok) throw new Error('영수증 사진을 읽지 못했습니다.');
  const blob = await response.blob();
  if (!blob.size) throw new Error('비어 있는 사진입니다. 다시 선택해 주세요.');
  return new File([blob], 'receipt', { type: blob.type });
}
