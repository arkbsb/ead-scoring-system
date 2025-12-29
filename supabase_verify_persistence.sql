-- Fix: Remove updated_at from the query since it doesn't exist
SELECT id, name, total_lead_goal, created_at
FROM launches
WHERE id = '11058c3b-a61b-4499-a758-0f701cdf0795';

-- Check all columns that actually exist in the launches table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'launches'
ORDER BY ordinal_position;
