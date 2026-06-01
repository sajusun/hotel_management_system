import { useState, useEffect } from 'react';
import { BedDouble, CalendarCheck, DollarSign, Activity } from 'lucide-react';
import { getDashboardStats } from '../api/dashboard';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardData {
  stats: {
    total_rooms: number;
    available_rooms: number;
    active_guests: number;
    total_bookings: number;
    revenue_today: number;
  };
  recent_bookings: any[];
  room_statuses: { status: string; value: number }[];
  revenue_chart: { name: string; revenue: number }[];
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#6b7280'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = data ? [
    { title: 'Total Revenue', value: `$${data.stats.revenue_today}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+12%' },
    { title: 'Occupancy Rate', value: `${data.stats.total_rooms ? Math.round(((data.stats.total_rooms - data.stats.available_rooms) / data.stats.total_rooms) * 100) : 0}%`, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+5%' },
    { title: 'Available Rooms', value: data.stats.available_rooms.toString(), icon: BedDouble, color: 'text-green-600', bg: 'bg-green-100', trend: 'Stable' },
    { title: 'Total Bookings', value: data.stats.total_bookings.toString(), icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+24%' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <Skeleton height={40} width={40} circle className="mb-4" />
               <Skeleton width="60%" height={16} className="mb-2" />
               <Skeleton width="40%" height={24} />
            </div>
          ))
        ) : (
          statCards.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-600 font-medium">{stat.trend}</span>
                <span className="text-slate-500 ml-2">vs last week</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Overview</h2>
          <div className="flex-1 min-h-[300px]">
            {loading ? <Skeleton height="100%" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenue_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Room Status Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Room Status</h2>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {loading ? <Skeleton circle width={200} height={200} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.room_statuses || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="status"
                  >
                    {(data?.room_statuses || []).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {loading ? (
             <div className="p-6">
                <Skeleton count={5} height={40} className="mb-2" />
             </div>
          ) : data?.recent_bookings && data.recent_bookings.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Guest</th>
                  <th scope="col" className="px-6 py-4">Room</th>
                  <th scope="col" className="px-6 py-4">Check In</th>
                  <th scope="col" className="px-6 py-4">Check Out</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_bookings.map((booking: any) => (
                  <tr key={booking.id} className="bg-white border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {booking.guest?.first_name} {booking.guest?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      {booking.room?.room_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No recent bookings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

