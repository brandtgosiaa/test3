-- Create cases table for storing sprawy
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  coordinator_id TEXT,
  coordinator_name TEXT,
  related_person_name TEXT,
  related_person_phone TEXT,
  operational_note TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (allow all operations for MVP)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth required for MVP)
CREATE POLICY "Allow all operations on cases" ON public.cases
  FOR ALL
  USING (true)
  WITH CHECK (true);
