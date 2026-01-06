import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
  });

  useEffect(() => {
    const isSupported = 'Notification' in window;
    setState({
      permission: isSupported ? Notification.permission : 'denied',
      isSupported,
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá alertas de sync e OCR.',
        });
        return true;
      } else {
        toast({
          title: 'Permissão negada',
          description: 'Ative as notificações nas configurações do navegador.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!state.isSupported || state.permission !== 'granted') {
      // Fallback to toast if notifications not available
      toast({
        title,
        description: options?.body,
      });
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error sending notification:', error);
      // Fallback to toast
      toast({
        title,
        description: options?.body,
      });
    }
  }, [state.isSupported, state.permission]);

  const notifySyncComplete = useCallback((count: number, errors: number = 0) => {
    if (errors > 0) {
      sendNotification('Sincronização concluída com erros', {
        body: `${count - errors} foto(s) sincronizada(s), ${errors} erro(s).`,
        tag: 'sync-complete',
      });
    } else {
      sendNotification('Fotos sincronizadas', {
        body: `${count} foto(s) enviada(s) com sucesso.`,
        tag: 'sync-complete',
      });
    }
  }, [sendNotification]);

  const notifyOCRComplete = useCallback((photoName: string, confidence: number) => {
    const level = confidence >= 0.8 ? 'alta' : confidence >= 0.5 ? 'média' : 'baixa';
    sendNotification('OCR concluído', {
      body: `Foto processada com confiança ${level} (${Math.round(confidence * 100)}%).`,
      tag: 'ocr-complete',
    });
  }, [sendNotification]);

  const notifyOCRError = useCallback((photoName: string) => {
    sendNotification('Erro no OCR', {
      body: `Falha ao processar foto. Tente reprocessar.`,
      tag: 'ocr-error',
    });
  }, [sendNotification]);

  return {
    ...state,
    requestPermission,
    sendNotification,
    notifySyncComplete,
    notifyOCRComplete,
    notifyOCRError,
  };
}
