/*
# Update Job Fields

1. Changes
- Add contact fields to `jobs`: contact_name, contact_phone, contact_email
- Add date fields to `jobs`: date_applied, interview_date, follow_up_date
- Add interview reflection fields to `jobs`: interview_notes, questions_asked, what_went_well, what_could_improve, follow_up_message_sent, interview_rating

2. Notes
- All new columns are optional (nullable) to preserve existing data.
- No destructive operations; safe to re-run.
*/

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS date_applied date,
  ADD COLUMN IF NOT EXISTS interview_date date,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS interview_notes text,
  ADD COLUMN IF NOT EXISTS questions_asked text,
  ADD COLUMN IF NOT EXISTS what_went_well text,
  ADD COLUMN IF NOT EXISTS what_could_improve text,
  ADD COLUMN IF NOT EXISTS follow_up_message_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS interview_rating integer;
