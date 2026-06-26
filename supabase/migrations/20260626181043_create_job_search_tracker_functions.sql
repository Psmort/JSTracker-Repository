/*
# Job Search Tracker Functions and Triggers

1. Functions
- `update_job_next_action(job_id uuid)` - Recalculates the next_action field for a job based on the nearest incomplete task.
- `auto_log_activity()` - Trigger function to log changes automatically.

2. Triggers
- `update_job_next_action_trigger` on tasks - Calls update_job_next_action after insert, update, or delete on tasks.
*/

CREATE OR REPLACE FUNCTION update_job_next_action(p_job_id uuid)
RETURNS void AS $$
DECLARE
  next_task_title text;
  next_task_date date;
BEGIN
  SELECT title, due_date
  INTO next_task_title, next_task_date
  FROM tasks
  WHERE job_id = p_job_id AND completed = false
  ORDER BY due_date ASC NULLS LAST, created_at ASC
  LIMIT 1;

  IF next_task_title IS NOT NULL THEN
    UPDATE jobs
    SET next_action = next_task_title || COALESCE(' (' || next_task_date || ')', '')
    WHERE id = p_job_id;
  ELSE
    UPDATE jobs
    SET next_action = NULL
    WHERE id = p_job_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_update_next_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_job_next_action(OLD.job_id);
    RETURN OLD;
  ELSE
    PERFORM update_job_next_action(NEW.job_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_job_next_action_trigger ON tasks;
CREATE TRIGGER update_job_next_action_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION auto_update_next_action();
