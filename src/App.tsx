import { useEffect, useState, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { JobList } from './components/JobList';
import { JobForm } from './components/JobForm';
import { JobDetail } from './components/JobDetail';
import { ActivityLog } from './components/ActivityLog';
import { CalendarView } from './components/CalendarView';
import { InterviewsPage } from './components/InterviewsPage';
import { InterviewForm } from './components/InterviewForm';
import {
  fetchJobs, createJob, updateJob, deleteJob, duplicateJob, updateJobStatus,
  fetchInterviews, createInterview, updateInterview, deleteInterview,
} from './lib/api';
import type { Job, JobStatus, Interview } from './types';
import { Plus, LayoutDashboard, List, Activity, CalendarDays, MessageSquare } from 'lucide-react';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [view, setView] = useState<'dashboard' | 'jobs' | 'interviews' | 'calendar' | 'activity'>('dashboard');
  const [formJob, setFormJob] = useState<Job | null | undefined>(undefined);
  const [formInterview, setFormInterview] = useState<Interview | null | undefined>(undefined);
  const [detailJobId, setDetailJobId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const j = await fetchJobs();
      setJobs(j);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadInterviews = useCallback(async () => {
    try {
      const i = await fetchInterviews();
      setInterviews(i);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await loadJobs();
    await loadInterviews();
  }, [loadJobs, loadInterviews]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleSaveJob = async (data: Partial<Job>) => {
    try {
      if (formJob) {
        await updateJob(formJob.id, data);
      } else {
        await createJob(data as Omit<Job, 'id' | 'created_at' | 'updated_at' | 'next_action'>);
      }
      setFormJob(undefined);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    try {
      await deleteJob(job.id);
      setDeleteConfirm(null);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (job: Job) => {
    try {
      await duplicateJob(job.id);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (job: Job, status: JobStatus) => {
    try {
      await updateJobStatus(job.id, status);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInterview = async (data: Partial<Interview>) => {
    try {
      await createInterview(data as Omit<Interview, 'id' | 'created_at' | 'updated_at'>);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateInterview = async (id: string, data: Partial<Interview>) => {
    try {
      await updateInterview(id, data);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInterview = async (id: string) => {
    try {
      await deleteInterview(id);
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems: { key: typeof view; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'jobs', label: 'Jobs', icon: List },
    { key: 'interviews', label: 'Interviews', icon: MessageSquare },
    { key: 'calendar', label: 'Calendar', icon: CalendarDays },
    { key: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-semibold text-gray-900">Job Search Tracker</h1>
            </div>
            <div className="flex items-center gap-2">
              <nav className="hidden sm:flex items-center gap-1 mr-2">
                {navItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <span className="flex items-center gap-1.5"><item.icon className="w-4 h-4" />{item.label}</span>
                  </button>
                ))}
              </nav>
              {view !== 'interviews' && (
                <button
                  onClick={() => setFormJob(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Job
                </button>
              )}
            </div>
          </div>
          <div className="sm:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${view === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Overview</h2>
              <Dashboard />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Recent Jobs</h2>
              <JobList
                jobs={jobs.slice(0, 5)}
                onEdit={setFormJob}
                onDelete={setDeleteConfirm}
                onDuplicate={handleDuplicate}
                onStatusChange={handleStatusChange}
                onSelect={j => setDetailJobId(j.id)}
              />
            </div>
          </div>
        )}

        {view === 'jobs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">All Jobs</h2>
              <span className="text-sm text-gray-500">{jobs.length} total</span>
            </div>
            <JobList
              jobs={jobs}
              onEdit={setFormJob}
              onDelete={setDeleteConfirm}
              onDuplicate={handleDuplicate}
              onStatusChange={handleStatusChange}
              onSelect={j => setDetailJobId(j.id)}
            />
          </div>
        )}

        {view === 'interviews' && (
          <InterviewsPage
            interviews={interviews}
            jobs={jobs}
            onRefresh={refreshAll}
            onSelectInterview={id => setFormInterview(interviews.find(i => i.id === id) || null)}
            onCreateInterview={handleCreateInterview}
            onUpdateInterview={handleUpdateInterview}
            onDeleteInterview={handleDeleteInterview}
          />
        )}

        {view === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Calendar</h2>
            </div>
            <CalendarView
              onSelectJob={id => setDetailJobId(id)}
              onSelectInterview={id => setFormInterview(interviews.find(i => i.id === id) || null)}
            />
          </div>
        )}

        {view === 'activity' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Global Activity Log</h2>
            <ActivityLog />
          </div>
        )}
      </main>

      {formJob !== undefined && (
        <JobForm job={formJob || null} onSave={handleSaveJob} onClose={() => setFormJob(undefined)} />
      )}

      {formInterview !== undefined && (
        <InterviewForm
          interview={formInterview || null}
          jobs={jobs}
          onSave={data => {
            if (formInterview) {
              handleUpdateInterview(formInterview.id, data);
            } else {
              handleCreateInterview(data);
            }
            setFormInterview(undefined);
          }}
          onClose={() => setFormInterview(undefined)}
        />
      )}

      {detailJobId && (
        <JobDetail jobId={detailJobId} onClose={() => setDetailJobId(null)} onEdit={j => { setDetailJobId(null); setFormJob(j); }} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Job</h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete "{deleteConfirm.title}" at {deleteConfirm.company_name}? This will also remove all linked tasks, contacts, and activity logs.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJob(deleteConfirm)}
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

export default App;
