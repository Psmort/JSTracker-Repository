import type { Job, Contact, Task, ActivityLogEntry, JobStatus, CalendarEvent, Interview } from '../types';

// --- localStorage helpers ---
const LS_KEYS = {
  jobs: 'jst_jobs',
  interviews: 'jst_interviews',
  contacts: 'jst_contacts',
  tasks: 'jst_tasks',
  activity: 'jst_activity',
};

function getLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowISO() {
  return new Date().toISOString();
}

// --- Jobs ---
export async function fetchJobs(): Promise<Job[]> {
  const data = getLS<Job>(LS_KEYS.jobs);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const data = getLS<Job>(LS_KEYS.jobs);
  return data.find(j => j.id === id) || null;
}

export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'next_action'>): Promise<Job> {
  const newJob: Job = {
    ...(job as unknown as Job),
    id: genId(),
    created_at: nowISO(),
    updated_at: nowISO(),
    next_action: undefined,
  };
  const data = getLS<Job>(LS_KEYS.jobs);
  data.push(newJob);
  setLS(LS_KEYS.jobs, data);
  await logActivity(newJob.id, 'job_created', `Created job: ${newJob.title} at ${newJob.company_name}`, null, null);
  return newJob;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job> {
  const data = getLS<Job>(LS_KEYS.jobs);
  const idx = data.findIndex(j => j.id === id);
  if (idx === -1) throw new Error('Job not found');
  const updated = { ...data[idx], ...updates, updated_at: nowISO() };
  data[idx] = updated;
  setLS(LS_KEYS.jobs, data);
  return updated;
}

export async function updateJobStatus(id: string, newStatus: JobStatus): Promise<Job> {
  const old = await fetchJobById(id);
  if (!old) throw new Error('Job not found');
  const updated = await updateJob(id, { status: newStatus });
  await logActivity(id, 'status_change', `Status changed from ${old.status} to ${newStatus}`, old.status, newStatus);
  return updated;
}

export async function deleteJob(id: string): Promise<void> {
  let data = getLS<Job>(LS_KEYS.jobs);
  data = data.filter(j => j.id !== id);
  setLS(LS_KEYS.jobs, data);
  // Also clean up related contacts, tasks, activity
  let contacts = getLS<Contact>(LS_KEYS.contacts);
  contacts = contacts.filter(c => c.job_id !== id);
  setLS(LS_KEYS.contacts, contacts);
  let tasks = getLS<Task>(LS_KEYS.tasks);
  tasks = tasks.filter(t => t.job_id !== id);
  setLS(LS_KEYS.tasks, tasks);
  let interviews = getLS<Interview>(LS_KEYS.interviews);
  interviews = interviews.map(i => (i.linked_job_id === id ? { ...i, linked_job_id: undefined } : i));
  setLS(LS_KEYS.interviews, interviews);
  let activity = getLS<ActivityLogEntry>(LS_KEYS.activity);
  activity = activity.filter(a => a.job_id !== id);
  setLS(LS_KEYS.activity, activity);
}

export async function duplicateJob(id: string): Promise<Job> {
  const job = await fetchJobById(id);
  if (!job) throw new Error('Job not found');
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(job)) {
    if (['id', 'created_at', 'updated_at', 'next_action'].includes(k)) continue;
    copy[k] = v;
  }
  const created = await createJob(copy as Omit<Job, 'id' | 'created_at' | 'updated_at' | 'next_action'>);
  return created;
}

// --- Interviews ---
export async function fetchInterviews(): Promise<Interview[]> {
  const data = getLS<Interview>(LS_KEYS.interviews);
  return data.sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime());
}

export async function fetchInterviewsByJobId(jobId: string): Promise<Interview[]> {
  const data = getLS<Interview>(LS_KEYS.interviews);
  return data.filter(i => i.linked_job_id === jobId).sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime());
}

export async function createInterview(interview: Omit<Interview, 'id' | 'created_at' | 'updated_at'>): Promise<Interview> {
  const newInterview: Interview = {
    ...(interview as unknown as Interview),
    id: genId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const data = getLS<Interview>(LS_KEYS.interviews);
  data.push(newInterview);
  setLS(LS_KEYS.interviews, data);
  return newInterview;
}

export async function updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
  const data = getLS<Interview>(LS_KEYS.interviews);
  const idx = data.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Interview not found');
  const updated = { ...data[idx], ...updates, updated_at: nowISO() };
  data[idx] = updated;
  setLS(LS_KEYS.interviews, data);
  return updated;
}

export async function deleteInterview(id: string): Promise<void> {
  let data = getLS<Interview>(LS_KEYS.interviews);
  data = data.filter(i => i.id !== id);
  setLS(LS_KEYS.interviews, data);
}

// --- Contacts ---
export async function fetchContacts(jobId?: string): Promise<Contact[]> {
  let data = getLS<Contact>(LS_KEYS.contacts);
  if (jobId) data = data.filter(c => c.job_id === jobId);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
  const newContact: Contact = {
    ...(contact as unknown as Contact),
    id: genId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const data = getLS<Contact>(LS_KEYS.contacts);
  data.push(newContact);
  setLS(LS_KEYS.contacts, data);
  if (contact.job_id) {
    await logActivity(contact.job_id, 'task_created', `Created contact: ${newContact.name}`, null, null);
  }
  return newContact;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const data = getLS<Contact>(LS_KEYS.contacts);
  const idx = data.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Contact not found');
  const updated = { ...data[idx], ...updates, updated_at: nowISO() };
  data[idx] = updated;
  setLS(LS_KEYS.contacts, data);
  return updated;
}

export async function deleteContact(id: string): Promise<void> {
  let data = getLS<Contact>(LS_KEYS.contacts);
  data = data.filter(c => c.id !== id);
  setLS(LS_KEYS.contacts, data);
}

// --- Tasks ---
export async function fetchTasks(jobId?: string): Promise<Task[]> {
  let data = getLS<Task>(LS_KEYS.tasks);
  if (jobId) data = data.filter(t => t.job_id === jobId);
  return data.sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const newTask: Task = {
    ...(task as unknown as Task),
    id: genId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const data = getLS<Task>(LS_KEYS.tasks);
  data.push(newTask);
  setLS(LS_KEYS.tasks, data);
  if (task.job_id) {
    await logActivity(task.job_id, 'task_created', `Created task: ${newTask.title}`, null, null);
  }
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const data = getLS<Task>(LS_KEYS.tasks);
  const idx = data.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Task not found');
  const updated = { ...data[idx], ...updates, updated_at: nowISO() };
  data[idx] = updated;
  setLS(LS_KEYS.tasks, data);
  if (updates.completed && updated.job_id) {
    await logActivity(updated.job_id, 'task_completed', `Completed task: ${updated.title}`, 'incomplete', 'completed');
  }
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  let data = getLS<Task>(LS_KEYS.tasks);
  data = data.filter(t => t.id !== id);
  setLS(LS_KEYS.tasks, data);
}

// --- Activity Log ---
export async function fetchActivityLog(jobId?: string): Promise<ActivityLogEntry[]> {
  let data = getLS<ActivityLogEntry>(LS_KEYS.activity);
  if (jobId) data = data.filter(a => a.job_id === jobId);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function logActivity(
  jobId: string,
  actionType: string,
  summary: string,
  oldValue: string | null,
  newValue: string | null
): Promise<ActivityLogEntry> {
  const entry: ActivityLogEntry = {
    id: genId(),
    job_id: jobId,
    action_type: actionType,
    action_summary: summary,
    old_value: oldValue || undefined,
    new_value: newValue || undefined,
    created_at: nowISO(),
  };
  const data = getLS<ActivityLogEntry>(LS_KEYS.activity);
  data.push(entry);
  setLS(LS_KEYS.activity, data);
  return entry;
}

// --- Calendar ---
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const jobs = await fetchJobs();
  const tasks = await fetchTasks();
  const interviews = await fetchInterviews();

  const events: CalendarEvent[] = [];

  for (const j of jobs) {
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

  for (const t of tasks) {
    if (!t.completed && t.due_date) {
      events.push({ id: `task-${t.id}`, title: t.title, company_name: '', date: t.due_date, type: 'task', job_id: t.job_id, task_title: t.title });
    }
  }

  for (const i of interviews) {
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

// --- Dashboard stats ---
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
  const jobs = await fetchJobs();
  const tasks = await fetchTasks();
  const interviews = await fetchInterviews();

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

  for (const j of jobs) {
    if (j.status === 'Saved') stats.totalSaved++;
    if (j.status === 'Applied') stats.totalApplied++;
    if (j.status === 'Interviewing') stats.totalInterviewing++;
    if (j.status === 'Offer') stats.totalOffer++;
    if (j.status === 'Rejected') stats.totalRejected++;
  }

  for (const t of tasks) {
    if (t.completed) continue;
    if (t.due_date && t.due_date < todayStr) stats.overdueTasks++;
    else if (t.due_date && t.due_date >= todayStr) stats.upcomingTasks++;
    else stats.upcomingTasks++;
  }

  for (const i of interviews) {
    if (i.status === 'Scheduled' && i.interview_date >= todayStr) stats.upcomingInterviews++;
    if (i.follow_up_date) {
      if (i.follow_up_date < todayStr && !i.thank_you_sent) stats.overdueFollowUps++;
      else if (i.follow_up_date <= weekEndStr) stats.followUpsDueThisWeek++;
    }
  }

  for (const j of jobs) {
    if (j.follow_up_date) {
      if (j.follow_up_date <= weekEndStr) {
        stats.followUpsDueThisWeek++;
      }
    }
    if (j.deadline && j.deadline >= todayStr && j.deadline <= weekEndStr) stats.deadlinesThisWeek++;
  }

  return stats;
}
