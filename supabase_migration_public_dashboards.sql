-- Create public_dashboards table
CREATE TABLE IF NOT EXISTS public_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  dashboard_type TEXT NOT NULL DEFAULT 'traffic',
  spreadsheet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_public_dashboards_token ON public_dashboards(token);
CREATE INDEX IF NOT EXISTS idx_public_dashboards_user ON public_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_public_dashboards_active ON public_dashboards(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE public_dashboards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own shares
CREATE POLICY "Users can manage own shares"
  ON public_dashboards
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Anyone can read active shares by token (for public access)
CREATE POLICY "Public can read active shares"
  ON public_dashboards
  FOR SELECT
  USING (is_active = true);

-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_share_view_count(share_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public_dashboards
  SET 
    view_count = view_count + 1,
    last_viewed_at = NOW()
  WHERE token = share_token AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
