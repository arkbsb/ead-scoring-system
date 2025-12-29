-- Add traffic_mapping column to user_settings if it doesn't exist
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS traffic_mapping JSONB;

-- Add traffic_mapping and launch_id columns to public_dashboards if they don't exist
ALTER TABLE public_dashboards ADD COLUMN IF NOT EXISTS traffic_mapping JSONB;
ALTER TABLE public_dashboards ADD COLUMN IF NOT EXISTS launch_id UUID REFERENCES launches(id) ON DELETE SET NULL;

-- Enable public access to read the new columns (RLS policy already allows SELECT for active shares)
-- No changes needed to RLS if "Public can read active shares" is already active.
