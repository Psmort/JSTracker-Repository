import { useState, useEffect } from 'react';
import type { Interview, Job } from '../types';
import { X } from 'lucide-react';

interface InterviewFormProps {
  interview?: Interview | null;
  jobs: Job[];
  onSave: (interview: Partial<Interview>) => void;
  onClose: () => void;
}

export function InterviewForm({ interview, jobs, onSave, onClose }: InterviewFormProps) {
  const [type, setType] = useState<'Job Interview' | 'Informational Interview'>('Job Interview');
  const [linkedJobId, setLinkedJobId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewFormat, setInterviewFormat] = useState('');
  const [locationOrMeetingLink, setLocationOrMeetingLink] = useState('');
  const [status, setStatus] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [activeSection, setActiveSection] = useState<'basic' | 'reflection'>('basic');

  const [reflectionNotes, setReflectionNotes] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatCouldImprove, setWhatCouldImprove] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [thankYouSent, setThankYouSent] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const [overallRating, setOverallRating] = useState<number | ''>('');

  const isEdit = !!interview;

  useEffect(() => {
    if (interview) {
      setType(interview.type);
      setLinkedJobId(interview.linked_job_id || '');
      setCompanyName(interview.company_name || '');
      setContactName(interview.contact_name || '');
      setContactEmail(interview.contact_email || '');
      setContactPhone(interview.contact_phone || '');
      setInterviewDate(interview.interview_date || '');
      setInterviewTime(interview.interview_time || '');
      setInterviewFormat(interview.interview_format || '');
      setLocationOrMeetingLink(interview.location_or_meeting_link || '');
      setStatus(interview.status || 'Scheduled');
      setNotes(interview.notes || '');
      setFollowUpDate(interview.follow_up_date || '');
      setReflectionNotes(interview.notes || '');
      setQuestionsAsked(interview.questions_asked || '');
      setWhatWentWell(interview.what_went_well || '');
      setWhatCouldImprove(interview.what_could_improve || '');
      setNextSteps(interview.next_steps || '');
      setThankYouSent(interview.thank_you_sent || false);
      setReflectionCompleted(interview.reflection_completed || false);
      setOverallRating(interview.overall_rating ?? '');
    } else {
      setType('Job Interview');
      setLinkedJobId('');
      setCompanyName('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setInterviewDate('');
      setInterviewTime('');
      setInterviewFormat('');
      setLocationOrMeetingLink('');
      setStatus('Scheduled');
      setNotes('');
      setFollowUpDate('');
      setReflectionNotes('');
      setQuestionsAsked('');
      setWhatWentWell('');
      setWhatCouldImprove('');
      setNextSteps('');
      setThankYouSent(false);
      setReflectionCompleted(false);
      setOverallRating('');
      setActiveSection('basic');
    }
  }, [interview]);

  useEffect(() => {
    if (linkedJobId && type === 'Job Interview') {
      const job = jobs.find(j => j.id === linkedJobId);
      if (job) {
        setCompanyName(job.company_name);
      }
    }
  }, [linkedJobId, type, jobs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedJob = linkedJobId ? jobs.find(j => j.id === linkedJobId) : null;
    onSave({
      type,
      linked_job_id: linkedJobId || undefined,
      job_title: selectedJob ? selectedJob.title : undefined,
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail || undefined,
      contact_phone: contactPhone || undefined,
      interview_date: interviewDate,
      interview_time: interviewTime || undefined,
      interview_format: interviewFormat || undefined,
      location_or_meeting_link: locationOrMeetingLink || undefined,
      status,
      notes: notes || undefined,
      questions_asked: questionsAsked || undefined,
      what_went_well: whatWentWell || undefined,
      what_could_improve: whatCouldImprove || undefined,
      next_steps: nextSteps || undefined,
      follow_up_date: followUpDate || undefined,
      thank_you_sent: thankYouSent,
      reflection_completed: reflectionCompleted,
      overall_rating: overallRating ? Number(overallRating) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Interview' : 'Add Interview'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-6 pt-3 border-b border-gray-100 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSection('basic')}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeSection === 'basic' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveSection('reflection')}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeSection === 'reflection' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Reflection
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto">
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as 'Job Interview' | 'Informational Interview')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Job Interview">Job Interview</option>
                  <option value="Informational Interview">Informational Interview</option>
                </select>
              </div>

              {type === 'Job Interview' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Job</label>
                  <select
                    value={linkedJobId}
                    onChange={e => setLinkedJobId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (optional)</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title} at {job.company_name}</option>
                    ))}
                  </select>
                </div>
              )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sarah Johnson"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={e => setInterviewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={interviewFormat}
                    onChange={e => setInterviewFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Phone">Phone</option>
                    <option value="Video">Video</option>
                    <option value="In Person">In Person</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'Scheduled' | 'Completed' | 'Cancelled')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Meeting Link</label>
                <input
                  value={locationOrMeetingLink}
                  onChange={e => setLocationOrMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Room 302 or https://zoom.us/..."
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pre-interview notes..."
                />
              </div>
            </div>
          )}

          {activeSection === 'reflection' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Notes</label>
                <textarea
                  value={reflectionNotes}
                  onChange={e => setReflectionNotes(e.target.value)}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
                <textarea
                  value={nextSteps}
                  onChange={e => setNextSteps(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are the next steps?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thank-you Sent?</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={thankYouSent}
                      onChange={e => setThankYouSent(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating (1-5)</label>
                  <select
                    value={overallRating}
                    onChange={e => setOverallRating(e.target.value ? Number(e.target.value) : '')}
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reflectionCompleted}
                  onChange={e => setReflectionCompleted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Reflection completed</span>
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
              {isEdit ? 'Save Changes' : 'Add Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
