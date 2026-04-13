-- Ratings table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, ip_hash)
);

-- Contributions table
CREATE TABLE contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id TEXT NOT NULL,
  title TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  youtube_url TEXT,
  summary TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Anyone can insert ratings" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can update ratings" ON ratings FOR UPDATE USING (true);

-- Contributions policies
CREATE POLICY "Anyone can submit contributions" ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public reads approved or admin reads all" ON contributions FOR SELECT USING (
  status = 'approved' OR auth.role() = 'authenticated'
);
CREATE POLICY "Admin updates contributions" ON contributions FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- Indexes
CREATE INDEX idx_ratings_episode ON ratings(episode_id);
CREATE INDEX idx_contributions_status ON contributions(status);
