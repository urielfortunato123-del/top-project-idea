import { useState, useEffect, useCallback } from 'react';
import { PhotoRecord, SyncStatus } from '@/types/photo';

const STORAGE_KEY = 'obraphoto_queue';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<PhotoRecord[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setQueue(JSON.parse(saved));
    }
  }, []);

  // Save queue to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = useCallback((photo: PhotoRecord) => {
    setQueue(prev => [...prev, photo]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePhotoStatus = useCallback((id: string, status: PhotoRecord['status'], errorMessage?: string) => {
    setQueue(prev => prev.map(p => 
      p.id === id ? { ...p, status, errorMessage } : p
    ));
  }, []);

  const syncQueue = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    const pendingPhotos = queue.filter(p => p.status === 'pending' || p.status === 'error');

    for (const photo of pendingPhotos) {
      try {
        updatePhotoStatus(photo.id, 'syncing');
        
        // Simulate upload
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // 90% success rate simulation
            if (Math.random() > 0.1) {
              resolve(true);
            } else {
              reject(new Error('Network error'));
            }
          }, 1000 + Math.random() * 1000);
        });

        updatePhotoStatus(photo.id, 'synced');
      } catch (error) {
        updatePhotoStatus(photo.id, 'error', 'Falha no envio. Tente novamente.');
      }
    }

    setIsSyncing(false);
  }, [queue, isOnline, isSyncing, updatePhotoStatus]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queue.some(p => p.status === 'pending')) {
      syncQueue();
    }
  }, [isOnline, queue, syncQueue]);

  const getSyncStatus = useCallback((): SyncStatus => {
    return {
      pending: queue.filter(p => p.status === 'pending').length,
      syncing: queue.filter(p => p.status === 'syncing').length,
      synced: queue.filter(p => p.status === 'synced').length,
      error: queue.filter(p => p.status === 'error').length,
      lastSync: queue.find(p => p.status === 'synced')?.serverTimestamp,
    };
  }, [queue]);

  return {
    queue,
    isOnline,
    isSyncing,
    addToQueue,
    removeFromQueue,
    updatePhotoStatus,
    syncQueue,
    getSyncStatus,
  };
}