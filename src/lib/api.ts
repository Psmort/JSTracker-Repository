import { supabase } from './supabase';
import type { Job, Contact, Task, ActivityLogEntry, JobStatus, CalendarEvent, Interview } from '../types';

// Jobs
export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Job[];
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Job | null;
}

export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'next_action'>): Promise<Job> {
  const { data, error } = await supabase.from('jobs').insert(job).select().single();
  if (error) throw error;
  await logActivity(data.id, 'job_created', `Created job: ${job.title} at ${job.company_name}`, null, null);
  return data as Job;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job> {
  const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Job;
}

export async function updateJobStatus(id: string, newStatus: JobStatus): Promise<Job> {
  const old = await fetchJobById(id);
  if (!old) throw new Error('Job not found');
  const { data, error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id).select().single();
  if (error) throw error;
  await logActivity(id, 'status_change', `Status changed from ${old.status} to ${newStatus}`, old.status, newStatus);
  return data as Job;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateJob(id: string): Promise<Job> {
  const job = await fetchJobById(id);
  if (!job) throw new Error('Job not found');
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(job)) {
    if (['id', 'created_at', 'updated_at', 'next_action'].includes(k)) continue;
    copy[k] = v;
  }
  copy.title = `${job.title} (Copy)`;
  copy.status = 'Saved' as JobStatus;
  copy.stage_color = 'gray';
  const { data, error } = await supabase.from('jobs').insert(copy).select().single();
  if (error) throw error;
  await logActivity(data.id, 'job_created', `Duplicated job from ${job.title}`, null, null);
  return data as Job;
}

// Interviews
export async function fetchInterviews(): Promise<Interview[]> {
  const { data, error } = await supabase.from('interviews').select('*').order('interview_date', { ascending: true });
  if (error) throw error;
  return (data || []) as Interview[];
}

export async function fetchInterviewsByJobId(jobId: string): Promise<Interview[]> {
  const { data, error } = await supabase.from('interviews').select('*').eq('linked_job_id', jobId).order('interview_date', { ascending: true });
  if (error) throw error;
  return (data || []) as Interview[];
}

export async function createInterview(interview: Omit<Interview, 'id' | 'created_at' | 'updated_at'>): Promise<Interview> {
  const { data, error } = await supabase.from('interviews').insert(interview).select().single();
  if (error) throw error;
  return data as Interview;
}

export async function updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
  const { data, error } = await supabase.from('interviews').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Interview;
}

export async function deleteInterview(id: string): Promise<void> {
  const { error } = await supabase.from('interviews').delete().eq('id', id);
  if (error) throw error;
}

// Contacts
export async function fetchContacts(jobId?: string): Promise<Contact[]> {
  let q = supabase.from('contacts').select('*').order('created_at', { ascending: false });
  if (jobId) q = q.eq('job_id', jobId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as Contact[];
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
  const { data, error } = await supabase.from('contacts').insert(contact).select().single();
  if (error) throw error;
  return data as Contact;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

// Tasks
export async function fetchTasks(jobId?: string): Promise<Task[]> {
  let q = supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false });
  if (jobId) q = q.eq('job_id', jobId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as Task[];
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw error;
  if (task.job_id) {
    await logActivity(task.job_id, 'task_created', `Created task: ${task.title}`, null, null);
  }
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  if (updates.completed && data.job_id) {
    await logActivity(data.job_id, 'task_completed', `Completed task: ${data.title}`, 'incomplete', 'completed');
  }
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// Activity Log
export async function fetchActivityLog(jobId?: string): Promise<ActivityLogEntry[]> {
  let q = supabase.from('activity_log').select('*').order('created_at', { ascending: false });
  if (jobId) q = q.eq('job_id', jobId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as ActivityLogEntry[];
}

export async function logActivity(
  jobId: string,
  actionType: string,
  summary: string,
  oldValue: string | null,
  newValue: string | null
): Promise<ActivityLogEntry> {
  const { data, error } = await supabase
    .from('activity_log')
    .insert({ job_id: jobId, action_type: actionType, action_summary: summary, old_value: oldValue, new_value: newValue })
    .select()
    .single();
  if (error) throw error;
  return data as ActivityLogEntry;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data: jobs, error: jobsError } = await supabase.from('jobs').select('id, title, company_name, deadline, interview_date, follow_up_date');
  if (jobsError) throw jobsError;
  const { data: tasks, error: tasksError } = await supabase.from('tasks').select('id, title, due_date, job_id, completed');
  if (tasksError) throw tasksError;
  const { data: interviews, error: interviewsError } = await supabase.from('interviews').select('id, type, job_title, company_name, interview_date, interview_time, status, linked_job_id, contact_name');
  if (interviewsError) throw interviewsError;

  const events: CalendarEvent[] = [];

  for (const j of jobs || []) {
    if (j.interview_date) {
      events.push({ id: `interview-${j.id}`, title: j.title, company_name: j.company_name, date: j.interview_date, type: 'interview', job_id: j.id });
    }
    if (j.deadline) {
      events.push({ id: `deadline-${j.id}`, title: j.title, company_name: j.company_name, date: j.deadline, type: 'deadline', job_id: j.id });
    }
    if (j.follow_up_date) {
      events.push({ id: `followup-${j.id}`, title: j.title, company_name: j.company_name, date: j.follow_up_date, type: 'followup', job_id: j.id });
    }
  }

  for (const t of tasks || []) {
    if (!t.completed && t.due_date) {
      events.push({ id: `task-${t.id}`, title: t.title, company_name: '', date: t.due_date, type: 'task', job_id: t.job_id, task_title: t.title });
    }
  }

  for (const i of interviews || []) {
    const eventType = i.type === 'Job Interview' ? 'interview' : 'informational';
    events.push({
      id: `interview-obj-${i.id}`,
      title: i.job_title || i.type,
      company_name: i.company_name,
      date: i.interview_date,
      type: eventType,
      interview_id: i.id,
      job_id: i.linked_job_id,
      time: i.interview_time,
      contact_name: i.contact_name,
    });
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Dashboard stats
export async function getDashboardStats(): Promise<{
  totalSaved: number;
  totalApplied: number;
  totalInterviewing: number;
  totalOffer: number;
  totalRejected: number;
  upcomingTasks: number;
  overdueTasks: number;
  upcomingInterviews: number;
  followUpsDueThisWeek: number;
  overdueFollowUps: number;
  deadlinesThisWeek: number;
}> {
  const { data: jobs, error: jobsError } = await supabase.from('jobs').select('status, interview_date, follow_up_date, deadline');
  if (jobsError) throw jobsError;
  const { data: tasks, error: tasksError } = await supabase.from('tasks').select('due_date, completed');
  if (tasksError) throw tasksError;
  const { data: interviews, error: interviewsError } = await supabase.from('interviews').select('interview_date, status, follow_up_date, thank_you_sent');
  if (interviewsError) throw interviewsError;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const stats = {
    totalSaved: 0,
    totalApplied: 0,
    totalInterviewing: 0,
    totalOffer: 0,
    totalRejected: 0,
    upcomingTasks: 0,
    overdueTasks: 0,
    upcomingInterviews: 0,
    followUpsDueThisWeek: 0,
    overdueFollowUps: 0,
    deadlinesThisWeek: 0,
  };

  for (const j of jobs || []) {
    if (j.status === 'Saved') stats.totalSaved++;
    if (j.status === 'Applied') stats.totalApplied++;
    if (j.status === 'Interviewing') stats.totalInterviewing++;
    if (j.status === 'Offer') stats.totalOffer++;
    if (j.status === 'Rejected') stats.totalRejected++;
  }

  for (const t of tasks || []) {
    if (t.completed) continue;
    if (t.due_date && t.due_date < todayStr) stats.overdueTasks++;
    else if (t.due_date && t.due_date >= todayStr) stats.upcomingTasks++;
    else stats.upcomingTasks++;
  }

  for (const i of interviews || []) {
    if (i.status === 'Scheduled' && i.interview_date >= todayStr) stats.upcomingInterviews++;
    if (i.follow_up_date) {
      if (i.follow_up_date < todayStr && !i.thank_you_sent) stats.overdueFollowUps++;
      else if (i.follow_up_date <= weekEndStr) stats.followUpsDueThisWeek++;
    }
  }

  for (const j of jobs || []) {
    if (j.follow_up_date) {
      if (j.follow_up_date < todayStr && !stats.overdueFollowUps) {
        // Already counted above via interviews
      } else if (j.follow_up_date <= weekEndStr) {
        stats.followUpsDueThisWeek++;
      }
    }
    if (j.deadline && j.deadline >= todayStr && j.deadline <= weekEndStr) stats.deadlinesThisWeek++;
  }

  return stats;
}
