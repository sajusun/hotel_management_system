import { Users, BedDouble, CalendarCheck } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Rooms', value: '120', icon: BedDouble, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Guests', value: '45', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Today Check-ins', value: '12', icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-500">No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
}
