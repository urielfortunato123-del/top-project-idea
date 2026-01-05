import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export interface PhotoWithError {
  id: string;
  file_url: string;
  template_id: string | null;
  ocr_status: string;
  processing_error: string | null;
  device_timestamp: string;
  companies?: { name: string };
  projects?: { name: string };
}

export function usePhotosWithOCRErrors() {
  return useQuery({
    queryKey: ['photos_with_ocr_errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_records')
        .select(`
          id,
          file_url,
          template_id,
          ocr_status,
          processing_error,
          device_timestamp,
          companies(name),
          projects(name)
        `)
        .eq('ocr_status', 'error')
        .order('device_timestamp', { ascending: false });
      
      if (error) throw error;
      return data as PhotoWithError[];
    },
  });
}

interface BatchProcessResult {
  photoId: string;
  success: boolean;
  error?: string;
}

export function useBatchReprocessOCR() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const mutation = useMutation({
    mutationFn: async (photoIds: string[]) => {
      setProgress({ current: 0, total: photoIds.length });
      const results: BatchProcessResult[] = [];

      // Get photo details for processing
      const { data: photos, error } = await supabase
        .from('photo_records')
        .select('id, file_url, template_id')
        .in('id', photoIds);

      if (error) throw error;
      if (!photos) return results;

      // Map template_id to template_type
      const templateMap: Record<string, string> = {};
      const templateIds = photos.filter(p => p.template_id).map(p => p.template_id!);
      
      if (templateIds.length > 0) {
        const { data: templates } = await supabase
          .from('templates')
          .select('id, name')
          .in('id', templateIds);
        
        if (templates) {
          const nameToType: Record<string, string> = {
            'Civil Geral': 'civil_geral',
            'Pavimentação': 'pavimentacao',
            'Drenagem': 'drenagem',
            'Terraplenagem': 'terraplenagem',
            'Concreto/Estruturas': 'concreto',
            'Elétrica/Iluminação': 'eletrica',
            'Sinalização': 'sinalizacao',
          };
          templates.forEach(t => {
            templateMap[t.id] = nameToType[t.name] || 'civil_geral';
          });
        }
      }

      // Process photos sequentially to avoid rate limits
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setProgress({ current: i + 1, total: photos.length });

        try {
          const templateType = photo.template_id 
            ? templateMap[photo.template_id] || 'civil_geral'
            : 'civil_geral';

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-photo`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ 
                photoRecordId: photo.id, 
                imageUrl: photo.file_url, 
                templateType 
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            results.push({ 
              photoId: photo.id, 
              success: false, 
              error: errorData.error || 'Erro no processamento' 
            });
          } else {
            results.push({ photoId: photo.id, success: true });
          }
        } catch (err) {
          results.push({ 
            photoId: photo.id, 
            success: false, 
            error: err instanceof Error ? err.message : 'Erro desconhecido' 
          });
        }

        // Small delay between requests to avoid overwhelming the API
        if (i < photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo_records'] });
      queryClient.invalidateQueries({ queryKey: ['photos_with_ocr_errors'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
    },
    onSettled: () => {
      setProgress({ current: 0, total: 0 });
    },
  });

  return { ...mutation, progress };
}
