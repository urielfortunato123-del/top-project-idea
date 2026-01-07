-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own photos" ON public.photo_records;

-- Create a new INSERT policy that allows null project_id
CREATE POLICY "Users can insert own photos" 
ON public.photo_records 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND (
    project_id IS NULL 
    OR has_project_access(auth.uid(), project_id)
  )
);