-- Force PostgREST to reload the schema cache
-- Run this after adding new columns to ensure they are recognized
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'launches' 
AND column_name = 'total_lead_goal';
