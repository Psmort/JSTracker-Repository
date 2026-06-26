import { useEffect, useState } from 'react';
import { fetchJobById, fetchInterviewsByJobId } from '../lib/api';
import type { Job, Interview } from '../types';
import { STATUS_COLORS, INTERVIEW_STATUS_COLORS } from '../types';
import { TaskPanel } from './TaskPanel';
import { ContactPanel } from './ContactPanel';
import { ActivityLog } from './ActivityLog';
import { X, MapPin, Link2, DollarSign, FileText, Phone, Mail, User, Star, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface JobDetailProps {
  jobId: string;
  onClose: () => void;
  onEdit: (job: Job) => void;
}

export function JobDetail({ jobId, onClose, onEdit }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'contacts' | 'interviews' | 'reflection' | 'activity'>('overview');

  useEffect(() => {
    (async () => {
      try {
        const j = await fetchJobById(jobId);
        const i = await fetchInterviewsByJobId(jobId);
        setJob(j);
        setInterviews(i);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const today = new Date().toISOString().split('T')[0];
  const isInterviewPast = job.interview_date && job.interview_date < today;
  const needsReflection = isInterviewPast && job.status === 'Interviewing' &&
    !(job.interview_notes || job.questions_asked || job.what_went_well || job.interview_rating);
  const canShowReflection = job.status === 'Interviewing' || job.status === 'Offer' || job.status === 'Rejected';

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'contacts', label: 'Contacts' },
  ];
  if (interviews.length > 0) {
    tabs.push({ key: 'interviews', label: 'Interviews' });
  }
  if (canShowReflection) {
    tabs.push({ key: 'reflection', label: 'Reflection' });
  }
  tabs.push({ key: 'activity', label: 'Activity' });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(job)} className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              Edit
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-6 border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'text-blue-700 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{job.company_name}</span>
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salary}</span>}
                {job.job_link && (
                  <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Link2 className="w-3.5 h-3.5" />Job Link
                  </a>
                )}
              </div>

              {(job.deadline || job.date_applied || job.interview_date || job.follow_up_date) && (
                <div className="grid grid-cols-2 gap-3">
                  {job.date_applied && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Date Applied</div>
                      <div className="text-sm font-medium text-gray-900">{job.date_applied}</div>
                    </div>
                  )}
                  {job.interview_date && (
                    <div className={`rounded-lg p-3 ${job.interview_date < today ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Interview Date</div>
                      <div className={`text-sm font-medium ${job.interview_date < today ? 'text-yellow-700' : 'text-gray-900'}`}>{job.interview_date}</div>
                    </div>
                  )}
                  {job.follow_up_date && (
                    <div className={`rounded-lg p-3 ${job.follow_up_date < today ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Follow-up Date</div>
                      <div className={`text-sm font-medium ${job.follow_up_date < today ? 'text-red-700' : 'text-gray-900'}`}>{job.follow_up_date}</div>
                    </div>
                  )}
                  {job.deadline && (
                    <div className={`rounded-lg p-3 ${job.deadline < today ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Application Deadline</div>
                      <div className={`text-sm font-medium ${job.deadline < today ? 'text-red-700' : 'text-gray-900'}`}>{job.deadline}</div>
                    </div>
                  )}
                </div>
              )}

              {job.contact_name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">Contact</div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gray-400" />{job.contact_name}</span>
                    {job.contact_email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{job.contact_email}</span>}
                    {job.contact_phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{job.contact_phone}</span>}
                  </div>
                </div>
              )}

              {job.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                    <FileText className="w-3.5 h-3.5" /> Notes
                  </div>
                  {job.notes}
                </div>
              )}

              {needsReflection && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Add interview reflection</div>
                    <div className="text-xs text-yellow-700 mt-0.5">Your interview was on {job.interview_date}. Capture your thoughts while they are fresh.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && <TaskPanel jobId={jobId} />}
          {activeTab === 'contacts' && <ContactPanel jobId={jobId} />}
          {activeTab === 'interviews' && (
            <div className="space-y-3">
              {interviews.map(interview => (
                <div key={interview.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{interview.type}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${INTERVIEW_STATUS_COLORS[interview.status]}`}>
                        {interview.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">{interview.job_title || interview.company_name}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{interview.interview_date}{interview.interview_time ? ` at ${interview.interview_time}` : ''}</span>
                      <span>{interview.interview_format}</span>
                      <span>Contact: {interview.contact_name}</span>
                    </div>
                    {interview.overall_rating !== undefined && interview.overall_rating !== null && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < interview.overall_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reflection' && (
            <div className="space-y-4">
              {job.interview_rating !== undefined && job.interview_rating !== null && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < job.interview_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{job.interview_rating} / 5</span>
                </div>
              )}
              {job.interview_notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">Interview Notes</div>
                  <div className="text-sm text-gray-700">{job.interview_notes}</div>
                </div>
              )}
              {job.questionsAsked && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">Questions Asked</div>
                  <div className="text-sm text-gray-700">{job.questions_asked}</div>
                </div>
              )}
              {job.what_went_well && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">What Went Well</div>
                  <div className="text-sm text-gray-700">{job.what_went_well}</div>
                </div>
              )}
              {job.what_could_improve && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">What Could Be Improved</div>
                  <div className="text-sm text-gray-700">{job.what_could_improve}</div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className={`w-5 h-5 ${job.follow_up_message_sent ? 'text-green-600' : 'text-gray-300'}`} />
                Follow-up message {job.follow_up_message_sent ? 'sent' : 'not sent'}
              </div>
              {!job.interview_notes && !job.interview_rating && (
                <div className="text-sm text-gray-400 text-center py-4">No reflection recorded yet. Click Edit to add one.</div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <ActivityLog jobId={jobId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
