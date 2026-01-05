-- Tabela de cache OCR baseada em hash da imagem
CREATE TABLE public.ocr_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_hash TEXT NOT NULL UNIQUE,
  ocr_raw_text TEXT,
  ocr_processed_text TEXT,
  ocr_confidence NUMERIC,
  extracted_entities JSONB,
  template_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Índice para busca rápida por hash
CREATE INDEX idx_ocr_cache_hash ON public.ocr_cache(image_hash);

-- Índice para limpeza de cache expirado
CREATE INDEX idx_ocr_cache_expires ON public.ocr_cache(expires_at);

-- RLS
ALTER TABLE public.ocr_cache ENABLE ROW LEVEL SECURITY;

-- Política: service role pode tudo (edge functions)
CREATE POLICY "Service role full access" ON public.ocr_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Função para limpar cache expirado (pode ser chamada periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_ocr_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ocr_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;