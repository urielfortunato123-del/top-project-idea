import { openDB, IDBPDatabase } from 'idb';

export interface PendingPhoto {
  id: string;
  companyId: string;
  companyName: string;
  projectId: string;
  projectName: string;
  frenteServico: string;
  templateId: string | null;
  templateName: string | null;
  activityText: string | null;
  deviceTimestamp: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  imageBlob: Blob;
  showStamp: boolean;
  status: 'pending' | 'uploading' | 'error';
  errorMessage?: string;
  createdAt: string;
}

const DB_NAME = 'obraphoto-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_photos';

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status');
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });

  return dbInstance;
}

export async function addPendingPhoto(photo: PendingPhoto): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, photo);
}

export async function getPendingPhotos(): Promise<PendingPhoto[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function getPendingPhotoById(id: string): Promise<PendingPhoto | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function updatePendingPhotoStatus(
  id: string,
  status: PendingPhoto['status'],
  errorMessage?: string
): Promise<void> {
  const db = await getDB();
  const photo = await db.get(STORE_NAME, id);
  if (photo) {
    photo.status = status;
    photo.errorMessage = errorMessage;
    await db.put(STORE_NAME, photo);
  }
}

export async function deletePendingPhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.filter(p => p.status === 'pending' || p.status === 'error').length;
}

export async function clearAllPending(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}