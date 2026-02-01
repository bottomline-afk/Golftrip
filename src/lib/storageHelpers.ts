import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadBasePhoto(
  tripId: string,
  playerId: string,
  blob: Blob
): Promise<string> {
  const storageRef = ref(storage, `avatars/${tripId}/${playerId}/base.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadCustomAvatar(
  tripId: string,
  playerId: string,
  blob: Blob
): Promise<string> {
  const storageRef = ref(storage, `avatars/${tripId}/${playerId}/custom.webp`);
  await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
  return getDownloadURL(storageRef);
}
