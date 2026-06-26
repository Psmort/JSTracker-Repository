import { useEffect, useMemo, useState } from 'react';
import { getCalendarEvents } from '../lib/api';
import type { CalendarEvent } from '../types';
import { CALENDAR_COLORS, CALENDAR_LABELS } from '../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarViewProps {
  onSelectJob: (jobId: string) => void;
  onSelectInterview: (interviewId: string) => void;
}

export function CalendarView({ onSelectJob, onSelectInterview }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    getCalendarEvents().then(e => {
      setEvents(e);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const todayStr = new Date().toISOString().split('T')[0];

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedDayEvents = selectedDay !== null
    ? (eventsByDay[`${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`] || [])
    : [];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500"></span>Interview</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>Info Interview</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>Deadline</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>Follow-up</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-500"></span>Task</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px]"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsByDay[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[80px] md:min-h-[100px] rounded-lg border p-1.5 text-left transition-colors flex flex-col gap-1 ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : isToday ? 'border-blue-300 bg-blue-50/50' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</span>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className={`w-2 h-2 rounded-full ${CALENDAR_COLORS[e.type].split(' ')[0]}`}></div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-gray-500 leading-none">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay !== null && selectedDayEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Events on {currentDate.toLocaleString('default', { month: 'long' })} {selectedDay}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          {selectedDayEvents.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className={`w-3 h-3 rounded-full ${CALENDAR_COLORS[e.type].split(' ')[0]} shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {e.type === 'task' ? `Task: ${e.task_title || e.title}` : `${CALENDAR_LABELS[e.type]}: ${e.title}`}
                </div>
                {e.company_name && (
                  <div className="text-xs text-gray-500">{e.company_name}</div>
                )}
                {e.contact_name && (
                  <div className="text-xs text-gray-500">Contact: {e.contact_name}</div>
                )}
                <div className="text-xs text-gray-400 mt-0.5">{e.date}{e.time ? ` at ${e.time}` : ''}</div>
              </div>
              {e.job_id && (
                <button
                  onClick={() => onSelectJob(e.job_id!)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
                >
                  Open Job
                </button>
              )}
              {e.interview_id && (
                <button
                  onClick={() => onSelectInterview(e.interview_id!)}
                  className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shrink-0"
                >
                  Open Interview
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
