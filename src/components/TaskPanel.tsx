import { useEffect, useState } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../lib/api';
import type { Task } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';

interface TaskPanelProps {
  jobId: string;
}

export function TaskPanel({ jobId }: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDue, setNewDue] = useState('');

  const load = async () => {
    const t = await fetchTasks(jobId);
    setTasks(t);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask({ title: newTitle, description: newDesc, due_date: newDue || undefined, completed: false, job_id: jobId });
    setNewTitle('');
    setNewDesc('');
    setNewDue('');
    setAdding(false);
    await load();
  };

  const toggleComplete = async (task: Task) => {
    await updateTask(task.id, { completed: !task.completed });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    await load();
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-400">Loading tasks...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tasks</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          {adding ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
          <input
            required
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="ml-auto px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </form>
      )}

      {tasks.length === 0 && !adding && (
        <div className="text-sm text-gray-400 py-2">No tasks yet. Add a task to track your next steps.</div>
      )}

      <div className="space-y-2">
        {tasks.map(task => {
          const isOverdue = !task.completed && task.due_date && task.due_date < today;
          return (
            <div key={task.id} className={`flex items-start gap-2 p-3 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0 text-gray-400 hover:text-blue-600">
                {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</div>
                {task.description && <div className="text-xs text-gray-500 mt-0.5">{task.description}</div>}
                {task.due_date && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" />
                    {task.due_date} {isOverdue && '(Overdue)'}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
