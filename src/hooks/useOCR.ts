import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExtractedEntity {
  id: string;
  photo_record_id: string;
  entity_type: string;
  entity_value: string;
  confidence_score: number;
  confidence_level: 'green' | 'yellow' | 'red';
  ai_suggestion: string | null;
  is_validated: boolean;
  validated_value: string | null;
  created_at: string;
}

export interface OCRReport {
  id: string;
  photo_record_id: string;
  template_id: string | null;
  report_type: string;
  report_data: any;
  overall_confidence: number;
  status: string;
  file_url: string | null;
  created_at: string;
}

export function useProcessPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoRecordId, imageUrl, templateType }: { 
      photoRecordId: string; 
      imageUrl: string; 
      templateType?: string;
    }) => {
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
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar foto');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photo_records'] });
      queryClient.invalidateQueries({ queryKey: ['extracted_entities', variables.photoRecordId] });
      queryClient.invalidateQueries({ queryKey: ['ocr_report', variables.photoRecordId] });
    },
  });
}

export function useExtractedEntities(photoRecordId: string) {
  return useQuery({
    queryKey: ['extracted_entities', photoRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extracted_entities')
        .select('*')
        .eq('photo_record_id', photoRecordId)
        .order('confidence_score', { ascending: false });
      
      if (error) throw error;
      return data as ExtractedEntity[];
    },
    enabled: !!photoRecordId,
  });
}

export function useOCRReport(photoRecordId: string) {
  return useQuery({
    queryKey: ['ocr_report', photoRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocr_reports')
        .select('*')
        .eq('photo_record_id', photoRecordId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as OCRReport | null;
    },
    enabled: !!photoRecordId,
  });
}

export function useValidateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityId, validatedValue }: { entityId: string; validatedValue: string }) => {
      const { data, error } = await supabase
        .from('extracted_entities')
        .update({ 
          is_validated: true, 
          validated_value: validatedValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['extracted_entities', data.photo_record_id] });
    },
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async ({ photoRecordId, format = 'json' }: { photoRecordId: string; format?: 'json' | 'html' | 'markdown' }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ photoRecordId, format }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar relatório');
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }
      return response.text();
    },
  });
}

// Template types for the UI
export const TEMPLATE_TYPES = [
  { value: 'civil_geral', label: 'Civil Geral', icon: '🏗️' },
  { value: 'pavimentacao', label: 'Pavimentação', icon: '🛣️' },
  { value: 'drenagem', label: 'Drenagem', icon: '🌊' },
  { value: 'terraplenagem', label: 'Terraplenagem', icon: '⛰️' },
  { value: 'concreto', label: 'Concreto/Estruturas', icon: '🏛️' },
  { value: 'eletrica', label: 'Elétrica/Iluminação', icon: '💡' },
  { value: 'sinalizacao', label: 'Sinalização', icon: '🚧' },
] as const;

export type TemplateType = typeof TEMPLATE_TYPES[number]['value'];
