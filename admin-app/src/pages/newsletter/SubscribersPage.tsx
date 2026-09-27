import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/axios';
import Pagination from '../../components/Pagination';
import FormField from '../../components/FormField';
import type { LaravelPaginated } from '../../types/pagination';

type Subscriber = {
  id: number;
  email: string;
  created_at: string;
};

export default function SubscribersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<LaravelPaginated<Subscriber> | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (q.trim()) params.set('q', q.trim());
    return params.toString();
  }, [page, perPage, q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<LaravelPaginated<Subscriber>>(`/api/v1/newsletter/subscribers?${query}`);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('Failed to load subscribers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Subscribers</h1>
          <p className="text-sm text-slate-500 mt-1">Email list collected from your website.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[520px]">
          <FormField label="Search">
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="Search by email…"
            />
          </FormField>
          <FormField label="Per page">
            <select
              value={perPage}
              onChange={(e) => {
                setPage(1);
                setPerPage(Number(e.target.value));
              }}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">List</div>
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
                    <th className="text-left font-medium px-5 py-3">Email</th>
                    <th className="text-left font-medium px-5 py-3">Subscribed at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900">{s.email}</td>
                      <td className="px-5 py-3 text-slate-600">{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {data.data.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="text-sm font-semibold text-slate-900 break-all">{s.email}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(s.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-200">
              {data && data.meta && (
                <Pagination
                  page={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </div>

          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">No subscribers yet.</div>
        )}
      </div>
    </div>
  );
}

