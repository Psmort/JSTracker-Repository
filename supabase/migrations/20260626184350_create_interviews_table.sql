/*
# Create Interviews Table

1. New Table
- `interviews` - Dedicated interview records for job interviews and informational interviews
  - `id` (uuid, primary key)
  - `type` (text, either "Job Interview" or "Informational Interview")
  - `linked_job_id` (uuid, optional, references jobs)
  - `job_title` (text, optional, cached from linked job)
  - `company_name` (text, not null)
  - `contact_name` (text, not null)
  - `contact_email` (text)
  - `contact_phone` (text)
  - `interview_date` (date, not null)
  - `interview_time` (text)
  - `interview_format` (text, e.g. Phone, Video, In Person, Other)
  - `location_or_meeting_link` (text)
  - `status` (text, e.g. Scheduled, Completed, Cancelled)
  - `notes` (text)
  - `questions_asked` (text)
  - `what_went_well` (text)
  - `what_could_improve` (text)
  - `next_steps` (text)
  - `follow_up_date` (date)
  - `thank_you_sent` (boolean, default false)
  - `reflection_completed` (boolean, default false)
  - `overall_rating` (integer, 1-5)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `interviews`.
- Single-tenant app (no auth), policies allow anon + authenticated full access.
*/

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'Job Interview',
  linked_job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  job_title text,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text,
  contact_phone text,
  interview_date date NOT NULL,
  interview_time text,
  interview_format text,
  location_or_meeting_link text,
  status text NOT NULL DEFAULT 'Scheduled',
  notes text,
  questions_asked text,
  what_went_well text,
  what_could_improve text,
  next_steps text,
  follow_up_date date,
  thank_you_sent boolean NOT NULL DEFAULT false,
  reflection_completed boolean NOT NULL DEFAULT false,
  overall_rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_interviews" ON interviews;
CREATE POLICY "anon_select_interviews" ON interviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_interviews" ON interviews;
CREATE POLICY "anon_insert_interviews" ON interviews FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_interviews" ON interviews;
CREATE POLICY "anon_update_interviews" ON interviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_interviews" ON interviews;
CREATE POLICY "anon_delete_interviews" ON interviews FOR DELETE TO anon, authenticated USING (true);
