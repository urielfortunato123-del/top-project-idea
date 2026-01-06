-- Add columns for manual company and project names
ALTER TABLE public.photo_records 
ADD COLUMN company_name TEXT,
ADD COLUMN project_name TEXT;

-- Make foreign keys nullable (they already reference nullable columns, but ensure company_id and project_id can be null)
ALTER TABLE public.photo_records 
ALTER COLUMN company_id DROP NOT NULL,
ALTER COLUMN project_id DROP NOT NULL;