import { useEffect, useState } from 'react';
import { fetchActivityLog } from '../lib/api';
import type { ActivityLogEntry } from '../types';
import { Clock, ArrowRight } from 'lucide-react';

interface ActivityLogProps {
  jobId?: string;
}

export function ActivityLog({ jobId }: ActivityLogProps) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLog(jobId).then(d => {
      setEntries(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-400">Loading activity log...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-sm text-gray-400 py-2">No activity yet. Actions will be logged here automatically.</div>;
  }

  return (
    <div className="space-y-2">
      {entries.map(entry => (
        <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white">
          <div className="mt-0.5 shrink-0">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900">{entry.action_summary}</div>
            {entry.old_value && entry.new_value && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{entry.old_value}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">{entry.new_value}</span>
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(entry.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
