import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/axios';
import Pagination from '../../components/Pagination';
import type { LaravelPaginated } from '../../types/pagination';

type RoomType = {
  id: number;
  name?: string;
};

type Room = {
  id: number;
  number: string | number;
  floor: number | null;
  status: string;
  notes: string | null;
  room_type?: RoomType | null;
};

const STATUSES = ['available', 'occupied', 'reserved', 'maintenance', 'cleaning'] as const;

export default function RoomsPage() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<LaravelPaginated<Room> | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (status) params.set('status', status);
    return params.toString();
  }, [page, perPage, status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<LaravelPaginated<Room>>(`/api/v1/rooms?${query}`);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('Failed to load rooms');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const updateStatus = async (roomId: number, newStatus: string) => {
    const prev = data;
    if (prev) {
      setData({
        ...prev,
        data: prev.data.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r)),
      });
    }
    try {
      await api.patch(`/api/v1/rooms/${roomId}/status`, { status: newStatus });
    } catch {
      setData(prev);
      setError('Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms</h1>
          <p className="text-sm text-slate-500 mt-1">Manage room status and view inventory.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Per page</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPage(1);
                setPerPage(Number(e.target.value));
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Room List</div>
          {data?.meta && (
            <div className="text-xs text-slate-500">
              Total <span className="font-medium text-slate-700">{data.meta.total}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : data?.data?.length ? (
          <div>
            <div className="hidden md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Room</th>
                    <th className="text-left font-medium px-5 py-3">Floor</th>
                    <th className="text-left font-medium px-5 py-3">Type</th>
                    <th className="text-left font-medium px-5 py-3">Notes</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900">#{room.number}</td>
                      <td className="px-5 py-3 text-slate-700">{room.floor ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-700">{room.room_type?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{room.notes ?? '—'}</td>
                      <td className="px-5 py-3">
                        <select
                          value={room.status}
                          onChange={(e) => updateStatus(room.id, e.target.value)}
                          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {data.data.map((room) => (
                <div key={room.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Room #{room.number}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Floor {room.floor ?? '—'} • {room.room_type?.name ?? '—'}
                      </div>
                    </div>
                    <select
                      value={room.status}
                      onChange={(e) => updateStatus(room.id, e.target.value)}
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {room.notes && <div className="text-xs text-slate-600 mt-2">{room.notes}</div>}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-200">
              <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">No rooms found.</div>
        )}
      </div>
    </div>
  );
}

