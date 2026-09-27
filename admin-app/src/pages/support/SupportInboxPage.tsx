import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import Pagination from '../../components/Pagination';
import FormField from '../../components/FormField';
import type { LaravelPaginated } from '../../types/pagination';

type Conversation = {
  id: number;
  subject: string | null;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  last_message_at: string | null;
  created_at: string;
};

export default function SupportInboxPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<LaravelPaginated<Conversation> | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    return params.toString();
  }, [page, perPage, q, status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<LaravelPaginated<Conversation>>(`/api/v1/support/conversations?${query}`);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('Failed to load conversations');
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
          <h1 className="text-2xl font-semibold text-slate-900">Support Inbox</h1>
          <p className="text-sm text-slate-500 mt-1">Handle customer messages and room booking issues.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[720px]">
          <FormField label="Search">
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="Subject, email, name…"
            />
          </FormField>
          <FormField label="Status">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
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
          <div className="text-sm font-semibold text-slate-900">Conversations</div>
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
                    <th className="text-left font-medium px-5 py-3">Subject</th>
                    <th className="text-left font-medium px-5 py-3">Customer</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                    <th className="text-left font-medium px-5 py-3">Last activity</th>
                    <th className="text-right font-medium px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {c.subject || <span className="text-slate-500">No subject</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-slate-900">{c.customer_name || <span className="text-slate-500">—</span>}</div>
                        <div className="text-xs text-slate-500 break-all">{c.customer_email || '—'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={[
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
                            c.status === 'open'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : c.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200',
                          ].join(' ')}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {new Date(c.last_message_at || c.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/dashboard/support/${c.id}`}
                          className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {data.data.map((c) => (
                <Link key={c.id} to={`/dashboard/support/${c.id}`} className="block p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{c.subject || 'No subject'}</div>
                      <div className="text-xs text-slate-500 mt-1 break-all">{c.customer_email || '—'}</div>
                    </div>
                    <span
                      className={[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0',
                        c.status === 'open'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : c.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200',
                      ].join(' ')}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">{new Date(c.last_message_at || c.created_at).toLocaleString()}</div>
                </Link>
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
          <div className="p-6 text-sm text-slate-500">No conversations.</div>
        )}
      </div>
    </div>
  );
}
