import { useState, useEffect } from 'react';
import type { Job, JobStatus } from '../types';
import { STATUS_ORDER } from '../types';
import { X } from 'lucide-react';

interface JobFormProps {
  job?: Job | null;
  onSave: (job: Partial<Job>) => void;
  onClose: () => void;
}

export function JobForm({ job, onSave, onClose }: JobFormProps) {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<JobStatus>('Saved');

  // Contact fields
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Date fields
  const [dateApplied, setDateApplied] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Interview reflection
  const [interviewNotes, setInterviewNotes] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatCouldImprove, setWhatCouldImprove] = useState('');
  const [followUpMessageSent, setFollowUpMessageSent] = useState(false);
  const [interviewRating, setInterviewRating] = useState<number | ''>('');

  const [activeSection, setActiveSection] = useState<'basic' | 'contact' | 'dates' | 'reflection'>('basic');

  const isEdit = !!job;

  const canShowReflection = (s: JobStatus) => s === 'Interviewing' || s === 'Offer' || s === 'Rejected';

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setCompanyName(job.company_name || '');
      setLocation(job.location || '');
      setJobLink(job.job_link || '');
      setSalary(job.salary || '');
      setDeadline(job.deadline || '');
      setNotes(job.notes || '');
      setStatus(job.status || 'Saved');

      setContactName(job.contact_name || '');
      setContactPhone(job.contact_phone || '');
      setContactEmail(job.contact_email || '');

      setDateApplied(job.date_applied || '');
      setInterviewDate(job.interview_date || '');
      setFollowUpDate(job.follow_up_date || '');

      setInterviewNotes(job.interview_notes || '');
      setQuestionsAsked(job.questions_asked || '');
      setWhatWentWell(job.what_went_well || '');
      setWhatCouldImprove(job.what_could_improve || '');
      setFollowUpMessageSent(job.follow_up_message_sent || false);
      setInterviewRating(job.interview_rating ?? '');
    } else {
      setTitle('');
      setCompanyName('');
      setLocation('');
      setJobLink('');
      setSalary('');
      setDeadline('');
      setNotes('');
      setStatus('Saved');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setDateApplied('');
      setInterviewDate('');
      setFollowUpDate('');
      setInterviewNotes('');
      setQuestionsAsked('');
      setWhatWentWell('');
      setWhatCouldImprove('');
      setFollowUpMessageSent(false);
      setInterviewRating('');
      setActiveSection('basic');
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stageColor = {
      Saved: 'gray',
      Applied: 'blue',
      Interviewing: 'yellow',
      Offer: 'green',
      Rejected: 'red',
    }[status] as string;

    onSave({
      title,
      company_name: companyName,
      location,
      job_link: jobLink,
      salary,
      deadline,
      notes,
      status,
      stage_color: stageColor,
      contact_name: contactName || undefined,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
      date_applied: dateApplied || undefined,
      interview_date: interviewDate || undefined,
      follow_up_date: followUpDate || undefined,
      interview_notes: interviewNotes || undefined,
      questions_asked: questionsAsked || undefined,
      what_went_well: whatWentWell || undefined,
      what_could_improve: whatCouldImprove || undefined,
      follow_up_message_sent: followUpMessageSent,
      interview_rating: interviewRating ? Number(interviewRating) : undefined,
    });
  };

  const tabs: { key: 'basic' | 'contact' | 'dates' | 'reflection'; label: string }[] = [
    { key: 'basic', label: 'Basic' },
    { key: 'contact', label: 'Contact' },
    { key: 'dates', label: 'Dates' },
  ];
  if (canShowReflection(status)) {
    tabs.push({ key: 'reflection', label: 'Interview Reflection' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Job' : 'Add Job'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-6 pt-3 border-b border-gray-100 shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeSection === tab.key ? 'text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto">
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Acme Inc"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Remote, NYC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. $120k-$150k"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Link</label>
                <input
                  value={jobLink}
                  onChange={e => setJobLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_ORDER.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sarah@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="555-123-4567"
                />
              </div>
            </div>
          )}

          {activeSection === 'dates' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Applied</label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={e => setDateApplied(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeSection === 'reflection' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Notes</label>
                <textarea
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="General notes about the interview..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Questions Asked</label>
                <textarea
                  value={questionsAsked}
                  onChange={e => setQuestionsAsked(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What questions were you asked?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What Went Well</label>
                <textarea
                  value={whatWentWell}
                  onChange={e => setWhatWentWell(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What did you do well?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What Could Be Improved</label>
                <textarea
                  value={whatCouldImprove}
                  onChange={e => setWhatCouldImprove(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What could you improve next time?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Message Sent?</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={followUpMessageSent}
                      onChange={e => setFollowUpMessageSent(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Rating (1-5)</label>
                  <select
                    value={interviewRating}
                    onChange={e => setInterviewRating(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not rated</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Below Average</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
