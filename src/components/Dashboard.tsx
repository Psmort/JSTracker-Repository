import { useEffect, useState } from 'react';
import { getDashboardStats } from '../lib/api';
import type { DashboardStats } from '../types';
import { Phone, CalendarDays, CalendarClock, CalendarCheck, AlertTriangle } from 'lucide-react';

function PieChart({ stats }: { stats: DashboardStats }) {
  const data = [
    { label: 'Saved', value: stats.totalSaved, color: '#6b7280' },
    { label: 'Applied', value: stats.totalApplied, color: '#3b82f6' },
    { label: 'Interviewing', value: stats.totalInterviewing, color: '#eab308' },
    { label: 'Offer', value: stats.totalOffer, color: '#22c55e' },
    { label: 'Rejected', value: stats.totalRejected, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No jobs yet
      </div>
    );
  }

  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((d, i) => {
            const arc = (d.value / total) * circumference;
            const dash = `${arc} ${circumference - arc}`;
            const circle = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += arc;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">Total Jobs</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-center">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-1.5 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
            <span className="text-gray-600">{d.label}</span>
            <span className="font-semibold text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(s => {
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse">
          <div className="h-48 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Upcoming Interviews',
      value: stats.upcomingInterviews,
      icon: Phone,
      color: 'bg-yellow-50 text-yellow-700',
      iconBg: 'bg-yellow-100',
      urgent: stats.upcomingInterviews > 0,
      urgentColor: 'text-yellow-700',
    },
    {
      label: 'Follow-ups Due',
      value: stats.followUpsDueThisWeek,
      icon: CalendarDays,
      color: 'bg-blue-50 text-blue-700',
      iconBg: 'bg-blue-100',
      urgent: stats.followUpsDueThisWeek > 0,
      urgentColor: 'text-blue-700',
    },
    {
      label: 'Overdue Follow-ups',
      value: stats.overdueFollowUps,
      icon: CalendarClock,
      color: stats.overdueFollowUps > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600',
      iconBg: stats.overdueFollowUps > 0 ? 'bg-red-100' : 'bg-gray-100',
      urgent: stats.overdueFollowUps > 0,
      urgentColor: 'text-red-700',
    },
    {
      label: 'Deadlines This Week',
      value: stats.deadlinesThisWeek,
      icon: CalendarCheck,
      color: stats.deadlinesThisWeek > 0 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600',
      iconBg: stats.deadlinesThisWeek > 0 ? 'bg-orange-100' : 'bg-gray-100',
      urgent: stats.deadlinesThisWeek > 0,
      urgentColor: 'text-orange-700',
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: stats.overdueTasks > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600',
      iconBg: stats.overdueTasks > 0 ? 'bg-red-100' : 'bg-gray-100',
      urgent: stats.overdueTasks > 0,
      urgentColor: 'text-red-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Job Pipeline Overview</h3>
        <PieChart stats={stats} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${card.urgent ? 'ring-1 ring-offset-1' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</span>
              <div className={`${card.iconBg} p-1.5 rounded-md`}>
                <card.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`text-xl font-bold ${card.urgent ? card.urgentColor : 'text-gray-900'}`}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
