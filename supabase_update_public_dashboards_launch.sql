-- Add launch_id column to public_dashboards table
ALTER TABLE public_dashboards ADD COLUMN launch_id UUID REFERENCES launches(id) ON DELETE SET NULL;
