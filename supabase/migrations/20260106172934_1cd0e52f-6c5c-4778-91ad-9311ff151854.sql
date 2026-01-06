-- Enable REPLICA IDENTITY FULL for complete row data in realtime updates
ALTER TABLE public.photo_records REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.photo_records;