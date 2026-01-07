import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  needsRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
}

export function useServiceWorker(): ServiceWorkerState {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);

          // Listen for new service worker installing
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  setNeedsRefresh(true);
                } else if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
                  // Content is cached for offline use
                  setOfflineReady(true);
                }
              });
            }
          });

          // Check if there's already a waiting service worker
          if (reg.waiting) {
            setNeedsRefresh(true);
          }
        }

        // Listen for controller change (when SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerSW();

    // Check for updates periodically (every 5 minutes)
    const intervalId = setInterval(() => {
      if (registration) {
        registration.update().catch(console.error);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [registration]);

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting service worker to take control
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  return {
    needsRefresh,
    offlineReady,
    updateServiceWorker,
  };
}
