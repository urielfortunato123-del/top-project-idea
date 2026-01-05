-- Add OCR and processing columns to photo_records
ALTER TABLE public.photo_records
ADD COLUMN IF NOT EXISTS ocr_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ocr_raw_text text,
ADD COLUMN IF NOT EXISTS ocr_processed_text text,
ADD COLUMN IF NOT EXISTS ocr_confidence numeric(5,2),
ADD COLUMN IF NOT EXISTS processing_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS processing_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS processing_error text;

-- Create table for extracted entities from OCR
CREATE TABLE public.extracted_entities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_record_id uuid NOT NULL REFERENCES public.photo_records(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_value text NOT NULL,
  confidence_score numeric(5,2) NOT NULL DEFAULT 0,
  confidence_level text NOT NULL DEFAULT 'red',
  ai_suggestion text,
  is_validated boolean DEFAULT false,
  validated_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on extracted_entities
ALTER TABLE public.extracted_entities ENABLE ROW LEVEL SECURITY;

-- RLS policies for extracted_entities
CREATE POLICY "Users can view entities for their photos or admin can view all"
ON public.extracted_entities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.photo_records pr
    WHERE pr.id = photo_record_id
    AND (pr.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "System can insert entities"
ON public.extracted_entities FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their entities or admin can update all"
ON public.extracted_entities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.photo_records pr
    WHERE pr.id = photo_record_id
    AND (pr.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Create table for template configurations
CREATE TABLE public.template_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  config_key text NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(template_id, config_key)
);

-- Enable RLS on template_configs
ALTER TABLE public.template_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for template_configs
CREATE POLICY "All users can view template configs"
ON public.template_configs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage template configs"
ON public.template_configs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table for OCR processing reports
CREATE TABLE public.ocr_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_record_id uuid NOT NULL REFERENCES public.photo_records(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.templates(id),
  report_type text NOT NULL DEFAULT 'structured',
  report_data jsonb NOT NULL DEFAULT '{}',
  overall_confidence numeric(5,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  file_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ocr_reports
ALTER TABLE public.ocr_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for ocr_reports
CREATE POLICY "Users can view their reports or admin can view all"
ON public.ocr_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.photo_records pr
    WHERE pr.id = photo_record_id
    AND (pr.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "System can insert reports"
ON public.ocr_reports FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their reports or admin can update all"
ON public.ocr_reports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.photo_records pr
    WHERE pr.id = photo_record_id
    AND (pr.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Insert default template configurations for civil construction templates
INSERT INTO public.templates (name, icon, description) VALUES
  ('Pavimentação', '🛣️', 'Template para obras de pavimentação asfáltica'),
  ('Drenagem', '🌊', 'Template para obras de drenagem e saneamento'),
  ('Terraplenagem', '🏗️', 'Template para obras de terraplenagem'),
  ('Concreto/Estruturas', '🏛️', 'Template para estruturas de concreto'),
  ('Elétrica/Iluminação', '💡', 'Template para instalações elétricas'),
  ('Sinalização', '🚧', 'Template para sinalização viária')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for new tables
CREATE TRIGGER update_extracted_entities_updated_at
BEFORE UPDATE ON public.extracted_entities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_configs_updated_at
BEFORE UPDATE ON public.template_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_reports_updated_at
BEFORE UPDATE ON public.ocr_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();