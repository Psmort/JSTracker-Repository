/*
# Job Search Tracker Schema

1. New Tables
- `jobs` - Main job/opportunity records mimicking Flowlu CRM Opportunities
  - `id` (uuid, primary key)
  - `title` (text, job title)
  - `company_name` (text)
  - `location` (text)
  - `job_link` (text)
  - `salary` (text)
  - `deadline` (date)
  - `notes` (text)
  - `status` (text, one of: Saved, Applied, Interviewing, Offer, Rejected)
  - `stage_color` (text)
  - `next_action` (text, computed from nearest incomplete task)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `contacts` - Linked contacts mimicking Flowlu CRM Contacts
  - `id` (uuid, primary key)
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `company` (text)
  - `notes` (text)
  - `job_id` (uuid, references jobs)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `tasks` - Linked tasks mimicking Flowlu Tasks
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `due_date` (date)
  - `completed` (boolean)
  - `job_id` (uuid, references jobs)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `activity_log` - Record of all changes and actions
  - `id` (uuid, primary key)
  - `job_id` (uuid, references jobs)
  - `action_type` (text, e.g. status_change, task_completed, job_created, job_updated, job_deleted)
  - `action_summary` (text)
  - `old_value` (text)
  - `new_value` (text)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all 4 tables.
- Single-tenant app (no auth), so policies allow anon + authenticated full access.
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_name text NOT NULL,
  location text,
  job_link text,
  salary text,
  deadline date,
  notes text,
  status text NOT NULL DEFAULT 'Saved',
  stage_color text NOT NULL DEFAULT 'gray',
  next_action text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  notes text,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_summary text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Jobs policies
DROP POLICY IF EXISTS "anon_select_jobs" ON jobs;
CREATE POLICY "anon_select_jobs" ON jobs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_jobs" ON jobs;
CREATE POLICY "anon_insert_jobs" ON jobs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_jobs" ON jobs;
CREATE POLICY "anon_update_jobs" ON jobs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_jobs" ON jobs;
CREATE POLICY "anon_delete_jobs" ON jobs FOR DELETE TO anon, authenticated USING (true);

-- Contacts policies
DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE TO anon, authenticated USING (true);

-- Tasks policies
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE TO anon, authenticated USING (true);

-- Activity log policies
DROP POLICY IF EXISTS "anon_select_activity_log" ON activity_log;
CREATE POLICY "anon_select_activity_log" ON activity_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activity_log" ON activity_log;
CREATE POLICY "anon_insert_activity_log" ON activity_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_activity_log" ON activity_log;
CREATE POLICY "anon_update_activity_log" ON activity_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activity_log" ON activity_log;
CREATE POLICY "anon_delete_activity_log" ON activity_log FOR DELETE TO anon, authenticated USING (true);
