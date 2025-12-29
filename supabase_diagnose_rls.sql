-- Check RLS policies on launches table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'launches';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'launches';

-- Try a direct update to test (replace with your actual launch ID)
UPDATE launches
SET total_lead_goal = 5000
WHERE id = '11058c3b-a61b-4499-a758-0f701cdf0795';

-- Verify the update worked
SELECT id, name, total_lead_goal
FROM launches
WHERE id = '11058c3b-a61b-4499-a758-0f701cdf0795';
