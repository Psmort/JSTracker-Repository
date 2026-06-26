import { useMemo, useState } from 'react';
import type { Job, JobStatus } from '../types';
import { STATUS_COLORS, STATUS_ORDER } from '../types';
import { Search, SlidersHorizontal, ArrowUpDown, Trash2, Copy, Pencil, ChevronDown, Calendar, MapPin, ExternalLink, Phone, Mail, User } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onStatusChange: (job: Job, status: JobStatus) => void;
  onSelect: (job: Job) => void;
}

export function JobList({ jobs, onEdit, onDelete, onDuplicate, onStatusChange, onSelect }: JobListProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'deadline'>('date');
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...jobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') {
      result = result.filter(j => j.status === filterStatus);
    }
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }
    return result;
  }, [jobs, search, filterStatus, sortBy]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as JobStatus | 'All')}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'deadline')}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort: Date Added</option>
              <option value="deadline">Sort: Deadline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(job => {
          const today = new Date().toISOString().split('T')[0];
          const isDeadlineOverdue = job.deadline && job.deadline < today;
          const isFollowUpOverdue = job.follow_up_date && job.follow_up_date < today;
          const isInterviewUpcoming = job.interview_date && job.interview_date >= today;

          const upcomingLabel = isInterviewUpcoming
            ? { text: 'Upcoming Interview', date: job.interview_date, color: 'text-yellow-700 bg-yellow-50' }
            : isFollowUpOverdue
            ? { text: 'Follow Up Overdue', date: job.follow_up_date, color: 'text-red-700 bg-red-50' }
            : job.follow_up_date && job.follow_up_date >= today
            ? { text: 'Follow Up', date: job.follow_up_date, color: 'text-blue-700 bg-blue-50' }
            : isDeadlineOverdue
            ? { text: 'Deadline Overdue', date: job.deadline, color: 'text-red-700 bg-red-50' }
            : job.deadline && job.deadline >= today
            ? { text: 'Application Deadline', date: job.deadline, color: 'text-orange-700 bg-orange-50' }
            : null;

          return (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(job)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
                      {job.status}
                    </span>
                    {upcomingLabel && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${upcomingLabel.color}`}>
                        <Calendar className="w-3 h-3" />
                        {upcomingLabel.text} {upcomingLabel.date && `(${upcomingLabel.date})`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 flex-wrap">
                    <span className="font-medium text-gray-700">{job.company_name}</span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="text-gray-600">{job.salary}</span>
                    )}
                  </div>
                  {job.next_action && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Next action:</span> {job.next_action}
                    </div>
                  )}
                  {job.contact_name && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {job.contact_name}
                      </span>
                      {job.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {job.contact_email}
                        </span>
                      )}
                      {job.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {job.contact_phone}
                        </span>
                      )}
                    </div>
                  )}
                  {job.job_link && (
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Job Posting
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative">
                    <button
                      onClick={e => { e.stopPropagation(); setStatusDropdown(statusDropdown === job.id ? null : job.id); }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {statusDropdown === job.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                        {STATUS_ORDER.map(s => (
                          <button
                            key={s}
                            onClick={e => { e.stopPropagation(); onStatusChange(job, s); setStatusDropdown(null); }}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onEdit(job); }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDuplicate(job); }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(job); }}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No jobs found. Add your first job to get started.
          </div>
        )}
      </div>
    </div>
  );
}
