-- Migration: add_announcements

CREATE TABLE announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by text
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to read (since team members just use a generic auth but we can also just allow 'public' or true for read since it's meant to be broadcast)
CREATE POLICY "Enable read access for all users" ON announcements
  FOR SELECT USING (true);



-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
