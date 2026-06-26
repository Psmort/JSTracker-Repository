import { useState, useMemo } from 'react';
import type { Interview, Job } from '../types';
import { INTERVIEW_STATUS_COLORS } from '../types';
import { InterviewForm } from './InterviewForm';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, CheckCircle2, Star, AlertCircle } from 'lucide-react';

interface InterviewsPageProps {
  interviews: Interview[];
  jobs: Job[];
  onRefresh: () => void;
  onCreateInterview: (interview: Partial<Interview>) => void;
  onUpdateInterview: (id: string, interview: Partial<Interview>) => void;
  onDeleteInterview: (id: string) => void;
}

export function InterviewsPage({
  interviews,
  jobs,
  onRefresh,
  onCreateInterview,
  onUpdateInterview,
  onDeleteInterview,
}: InterviewsPageProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Job Interview' | 'Informational Interview'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');
  const [formInterview, setFormInterview] = useState<Interview | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...interviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        i =>
          i.company_name.toLowerCase().includes(q) ||
          i.contact_name.toLowerCase().includes(q) ||
          (i.job_title || '').toLowerCase().includes(q)
      );
    }
    if (filterType !== 'All') result = result.filter(i => i.type === filterType);
    if (filterStatus !== 'All') result = result.filter(i => i.status === filterStatus);
    return result.sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime());
  }, [interviews, search, filterType, filterStatus]);

  const today = new Date().toISOString().split('T')[0];

  const handleMarkCompleted = (interview: Interview) => {
    onUpdateInterview(interview.id, { status: 'Completed' });
    onRefresh();
  };

  const handleSave = (data: Partial<Interview>) => {
    if (formInterview) {
      onUpdateInterview(formInterview.id, data);
    } else {
      onCreateInterview(data);
    }
    setFormInterview(undefined);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Interviews</h2>
          <span className="text-sm text-gray-500">{filtered.length} total</span>
        </div>
        <button
          onClick={() => setFormInterview(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Interview
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company, contact, or job..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as typeof filterType)}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Job Interview">Job Interview</option>
              <option value="Informational Interview">Informational</option>
            </select>
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(interview => {
          const isPast = interview.interview_date < today;
          const needsReflection = interview.status === 'Completed' && !interview.reflection_completed && !interview.overall_rating;
          return (
            <div
              key={interview.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{interview.type}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${INTERVIEW_STATUS_COLORS[interview.status]}`}>
                      {interview.status}
                    </span>
                    {needsReflection && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                        <AlertCircle className="w-3 h-3" />
                        Reflection Needed
                      </span>
                    )}
                    {interview.reflection_completed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Reflection Complete
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {interview.job_title ? `${interview.job_title} at ` : ''}{interview.company_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                    <span>Contact: {interview.contact_name}</span>
                    <span>{interview.interview_date}{interview.interview_time ? ` at ${interview.interview_time}` : ''}</span>
                    {interview.interview_format && <span>{interview.interview_format}</span>}
                    {interview.follow_up_date && <span>Follow-up: {interview.follow_up_date}</span>}
                  </div>
                  {interview.overall_rating !== undefined && interview.overall_rating !== null && (
                    <div className="flex items-center gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < interview.overall_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {interview.status === 'Scheduled' && !isPast && (
                    <button
                      onClick={() => handleMarkCompleted(interview)}
                      className="px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => setFormInterview(interview)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(interview.id)}
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
            No interviews found. Add your first interview to get started.
          </div>
        )}
      </div>

      {formInterview !== undefined && (
        <InterviewForm
          interview={formInterview || null}
          jobs={jobs}
          onSave={handleSave}
          onClose={() => setFormInterview(undefined)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Interview</h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this interview? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteInterview(deleteId); setDeleteId(null); onRefresh(); }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
