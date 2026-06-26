export type JobStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Job {
  id: string;
  title: string;
  company_name: string;
  location?: string;
  job_link?: string;
  salary?: string;
  deadline?: string;
  notes?: string;
  status: JobStatus;
  stage_color: string;
  next_action?: string;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  date_applied?: string;
  interview_date?: string;
  follow_up_date?: string;
  interview_notes?: string;
  questions_asked?: string;
  what_went_well?: string;
  what_could_improve?: string;
  follow_up_message_sent?: boolean;
  interview_rating?: number;
}

export interface Interview {
  id: string;
  type: 'Job Interview' | 'Informational Interview';
  linked_job_id?: string;
  job_title?: string;
  company_name: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  interview_date: string;
  interview_time?: string;
  interview_format?: string;
  location_or_meeting_link?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  questions_asked?: string;
  what_went_well?: string;
  what_could_improve?: string;
  next_steps?: string;
  follow_up_date?: string;
  thank_you_sent: boolean;
  reflection_completed: boolean;
  overall_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  job_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  job_id: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  job_id: string;
  action_type: string;
  action_summary: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface DashboardStats {
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
}

export interface CalendarEvent {
  id: string;
  title: string;
  company_name: string;
  date: string;
  type: 'interview' | 'informational' | 'deadline' | 'followup' | 'task';
  job_id?: string;
  interview_id?: string;
  task_title?: string;
  time?: string;
  contact_name?: string;
}

export const STATUS_COLORS: Record<JobStatus, string> = {
  Saved: 'bg-gray-100 text-gray-700 border-gray-300',
  Applied: 'bg-blue-100 text-blue-700 border-blue-300',
  Interviewing: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Offer: 'bg-green-100 text-green-700 border-green-300',
  Rejected: 'bg-red-100 text-red-700 border-red-300',
};

export const STATUS_ORDER: JobStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export const CALENDAR_COLORS: Record<CalendarEvent['type'], string> = {
  interview: 'bg-yellow-500 border-yellow-600',
  informational: 'bg-purple-500 border-purple-600',
  deadline: 'bg-red-500 border-red-600',
  followup: 'bg-blue-500 border-blue-600',
  task: 'bg-gray-500 border-gray-600',
};

export const CALENDAR_LABELS: Record<CalendarEvent['type'], string> = {
  interview: 'Interview',
  informational: 'Info Interview',
  deadline: 'Deadline',
  followup: 'Follow-up',
  task: 'Task',
};

export const INTERVIEW_STATUS_COLORS: Record<Interview['status'], string> = {
  Scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
  Completed: 'bg-green-100 text-green-700 border-green-300',
  Cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
};
