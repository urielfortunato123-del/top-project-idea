import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { appLog } from '@/lib/appLog';
import { 
  addPendingPhoto, 
  getPendingPhotos, 
  updatePendingPhotoStatus, 
  deletePendingPhoto,
  PendingPhoto 
} from '@/lib/indexedDB';

export interface PhotoRecord {
  id: string;
  company_id: string | null;
  company_name: string | null;
  project_id: string | null;
  project_name: string | null;
  frente_servico: string | null;
  user_id: string;
  template_id: string | null;
  activity_text: string | null;
  device_timestamp: string;
  server_timestamp: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  file_url: string;
  file_path: string;
  status: string;
  show_stamp: boolean;
  created_at: string;
  ocr_status: string | null;
  ocr_confidence: number | null;
  ocr_raw_text: string | null;
  ocr_processed_text: string | null;
  companies?: { name: string };
  projects?: { name: string };
  templates?: { name: string; icon: string } | null;
}

// Notification sound using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('[Sound] Could not play notification sound:', error);
  }
}

export function usePhotoRecords() {
  const queryClient = useQueryClient();
  const isInitialLoad = useRef(true);
  const currentUserId = useRef<string | null>(null);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      currentUserId.current = data.user?.id || null;
    });
  }, []);

  const showNewPhotoNotification = useCallback((payload: any) => {
    // Don't show notification for own photos
    if (payload.new?.user_id === currentUserId.current) {
      return;
    }

    const projectName = payload.new?.project_name || 'Projeto';
    const frenteServico = payload.new?.frente_servico || '';
    
    // Play sound
    playNotificationSound();
    
    // Show toast with photo preview
    toast.success('📸 Nova foto recebida!', {
      description: `${projectName}${frenteServico ? ` - ${frenteServico}` : ''}`,
      duration: 5000,
      action: payload.new?.file_url ? {
        label: 'Ver',
        onClick: () => {
          window.open(payload.new.file_url, '_blank');
        },
      } : undefined,
    });
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('photo_records_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photo_records',
        },
        (payload) => {
          console.log('[Realtime] Photo records updated:', payload.eventType);
          
          // Show notification only for INSERT events after initial load
          if (payload.eventType === 'INSERT' && !isInitialLoad.current) {
            showNewPhotoNotification(payload);
          }
          
          // Invalidate and refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['photo_records'] });
        }
      )
      .subscribe();

    // Mark initial load as complete after a short delay
    const timeout = setTimeout(() => {
      isInitialLoad.current = false;
    }, 2000);

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [queryClient, showNewPhotoNotification]);

  return useQuery({
    queryKey: ['photo_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_records')
        .select(`
          *,
          companies(name),
          projects(name),
          templates(name, icon)
        `)
        .order('device_timestamp', { ascending: false });
      
      if (error) throw error;
      return data as PhotoRecord[];
    },
  });
}

export function usePendingPhotos() {
  return useQuery({
    queryKey: ['pending_photos'],
    queryFn: getPendingPhotos,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

interface UploadPhotoParams {
  companyId?: string;
  companySlug: string;
  companyName: string;
  projectId?: string;
  projectName: string;
  frenteServico: string;
  templateId: string | null;
  activityText: string | null;
  deviceTimestamp: Date;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  imageBlob: Blob;
  showStamp: boolean;
  userName: string;
  userId: string;
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadPhotoParams) => {
      appLog.info('[Upload] Iniciando upload', {
        blobSize: params.imageBlob?.size,
        blobType: params.imageBlob?.type,
      });

      if (!params.imageBlob || params.imageBlob.size === 0) {
        throw new Error('Imagem inválida ou vazia. Tente novamente.');
      }

      const timestamp = format(params.deviceTimestamp, 'yyyyMMdd_HHmmss');
      const ms = params.deviceTimestamp.getMilliseconds().toString().padStart(3, '0');
      const nonce = Math.random().toString(36).slice(2, 8);
      const dayFolder = format(params.deviceTimestamp, 'dd');
      const monthFolder = format(params.deviceTimestamp, 'yyyy-MM');
      
      // Sanitize folder names
      const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
      const companyFolder = sanitize(params.companyName);
      const projectFolder = sanitize(params.projectName);
      const frenteFolder = sanitize(params.frenteServico || 'geral');
      
      // Structure: Empresa/Obra/Frente/Mes/Dia/foto.jpg
      // Add ms+nonce to avoid collisions when taking multiple photos quickly.
      const filePath = `${companyFolder}/${projectFolder}/${frenteFolder}/${monthFolder}/${dayFolder}/IMG_${timestamp}_${ms}_${nonce}.jpg`;
      
      appLog.info('[Upload] Enviando para storage', { filePath });

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, params.imageBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        appLog.error('[Upload] Erro no storage', uploadError);
        throw new Error(`Falha no envio: ${uploadError.message}`);
      }

      appLog.info('[Upload] Storage OK, obtendo URL...');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      appLog.info('[Upload] Inserindo registro no banco...');

      // Insert record
      const { data, error } = await supabase
        .from('photo_records')
        .insert({
          company_id: params.companyId || null,
          company_name: params.companyName,
          project_id: params.projectId || null,
          project_name: params.projectName,
          frente_servico: params.frenteServico || null,
          user_id: params.userId,
          template_id: params.templateId,
          activity_text: params.activityText || null,
          device_timestamp: params.deviceTimestamp.toISOString(),
          latitude: params.latitude,
          longitude: params.longitude,
          accuracy: params.accuracy,
          file_url: urlData.publicUrl,
          file_path: filePath,
          show_stamp: params.showStamp,
          ocr_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        appLog.error('[Upload] Erro no banco', error);
        throw new Error(`Falha ao salvar registro: ${error.message}`);
      }
      
      appLog.info('[Upload] Sucesso', { id: data.id });
      
      // Trigger OCR processing automatically (fire and forget)
      triggerOCRProcessing(data.id, urlData.publicUrl, params.templateId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo_records'] });
    },
  });
}

// Fire-and-forget OCR processing
async function triggerOCRProcessing(photoRecordId: string, imageUrl: string, templateId: string | null) {
  try {
    console.log('[OCR] Iniciando processamento automático para:', photoRecordId);
    
    // Map template_id to template_type
    let templateType = 'civil_geral';
    if (templateId) {
      const { data: template } = await supabase
        .from('templates')
        .select('name')
        .eq('id', templateId)
        .single();
      
      if (template) {
        // Map template name to type
        const nameToType: Record<string, string> = {
          'Civil Geral': 'civil_geral',
          'Pavimentação': 'pavimentacao',
          'Drenagem': 'drenagem',
          'Terraplenagem': 'terraplenagem',
          'Concreto/Estruturas': 'concreto',
          'Elétrica/Iluminação': 'eletrica',
          'Sinalização': 'sinalizacao',
        };
        templateType = nameToType[template.name] || 'civil_geral';
      }
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-photo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ photoRecordId, imageUrl, templateType }),
      }
    );

    if (!response.ok) {
      console.error('[OCR] Erro no processamento:', await response.text());
    } else {
      const result = await response.json();
      console.log('[OCR] Processamento concluído:', result);
    }
  } catch (error) {
    console.error('[OCR] Erro ao disparar processamento:', error);
  }
}

export function useSyncPendingPhotos() {
  const queryClient = useQueryClient();
  const uploadPhoto = useUploadPhoto();

  return useMutation({
    mutationFn: async (userId: string) => {
      const pending = await getPendingPhotos();
      const toSync = pending.filter(p => p.status === 'pending' || p.status === 'error');
      
      const results: { id: string; success: boolean; error?: string }[] = [];

      for (const photo of toSync) {
        try {
          await updatePendingPhotoStatus(photo.id, 'uploading');
          
          // Get company slug if companyId exists
          let companySlug = 'manual';
          if (photo.companyId) {
            const { data: company } = await supabase
              .from('companies')
              .select('slug')
              .eq('id', photo.companyId)
              .maybeSingle();
            
            if (company) {
              companySlug = company.slug;
            }
          }

          // Get user name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

          // Upload triggers OCR automatically now
          await uploadPhoto.mutateAsync({
            companyId: photo.companyId,
            companySlug: companySlug,
            companyName: photo.companyName,
            projectId: photo.projectId,
            projectName: photo.projectName,
            frenteServico: photo.frenteServico || '',
            templateId: photo.templateId,
            activityText: photo.activityText,
            deviceTimestamp: new Date(photo.deviceTimestamp),
            latitude: photo.latitude,
            longitude: photo.longitude,
            accuracy: photo.accuracy,
            imageBlob: photo.imageBlob,
            showStamp: photo.showStamp,
            userName: profile?.full_name || 'unknown',
            userId,
          });

          await deletePendingPhoto(photo.id);
          results.push({ id: photo.id, success: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro desconhecido';
          await updatePendingPhotoStatus(photo.id, 'error', message);
          results.push({ id: photo.id, success: false, error: message });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_photos'] });
      queryClient.invalidateQueries({ queryKey: ['photo_records'] });
    },
  });
}

export function useSavePendingPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: PendingPhoto) => {
      await addPendingPhoto(photo);
      return photo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_photos'] });
    },
  });
}