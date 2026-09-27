import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import FormField from '../../components/FormField';

type Message = {
  id: number;
  direction: 'in' | 'out';
  from_email: string | null;
  to_email: string | null;
  subject: string | null;
  body: string | null;
  provider: string | null;
  provider_message_id: string | null;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
};

type Thread = {
  id: number;
  subject: string | null;
  status: 'open' | 'pending' | 'closed';
  customer_email: string | null;
  customer_name: string | null;
  last_message_at: string | null;
  created_at: string;
  messages: Message[];
};

export default function SupportThreadPage() {
  const { id } = useParams();
  const conversationId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<Thread | null>(null);
  const [status, setStatus] = useState<Thread['status']>('open');
  const [reply, setReply] = useState('');

  const subjectLabel = useMemo(() => thread?.subject || `Conversation #${conversationId}`, [thread?.subject, conversationId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ data: Thread }>(`/api/v1/support/conversations/${conversationId}`);
      setThread(res.data.data);
      setStatus(res.data.data.status);
    } catch {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    // Avoid direct setState inside effect body lint rule by scheduling the async work.
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [conversationId, load]);

  const updateStatus = async (next: Thread['status']) => {
    if (!thread) return;
    setSaving(true);
    setError('');
    setStatus(next);
    try {
      await api.patch(`/api/v1/support/conversations/${conversationId}/status`, { status: next });
      setThread({ ...thread, status: next });
    } catch {
      setStatus(thread.status);
      setError('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !thread) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/api/v1/support/conversations/${conversationId}/reply`, {
        message: reply.trim(),
      });
      setReply('');
      await load();
    } catch {
      setError('Failed to send reply');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-500">Loading…</div>;
  if (!thread) return <div className="text-sm text-slate-500">{error || 'Not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/support" className="text-sm text-slate-600 hover:text-slate-900">
              ← Back
            </Link>
            <span
              className={[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
                thread.status === 'open'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : thread.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200',
              ].join(' ')}
            >
              {thread.status}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2 truncate">{subjectLabel}</h1>
          <div className="text-sm text-slate-500 mt-1 break-all">
            {thread.customer_name ? `${thread.customer_name} • ` : ''}
            {thread.customer_email || '—'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value as Thread['status'])}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            disabled={saving}
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-900">Messages</div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {thread.messages.length ? (
            thread.messages.map((m) => (
              <div
                key={m.id}
                className={[
                  'max-w-[900px] rounded-2xl border px-4 py-3',
                  m.direction === 'out'
                    ? 'ml-auto bg-indigo-50 border-indigo-100'
                    : 'mr-auto bg-slate-50 border-slate-200',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">{m.direction === 'out' ? 'Admin' : 'Customer'}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="break-all">{m.direction === 'out' ? m.to_email || '—' : m.from_email || '—'}</span>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
                </div>
                {m.body && <div className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">{m.body}</div>}
                {m.provider && (
                  <div className="text-[11px] text-slate-500 mt-2">
                    Provider: <span className="font-medium">{m.provider}</span>
                    {m.provider_message_id ? (
                      <>
                        <span className="mx-2 text-slate-300">•</span>
                        ID: <span className="font-medium">{m.provider_message_id}</span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">No messages yet.</div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3">
            <FormField label="Reply">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[110px] w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="Type your reply…"
              />
            </FormField>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={sendReply}
                disabled={saving || !reply.trim()}
                className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
            <div className="text-xs text-slate-500">
              Note: reply এখন DB তে log হয়; real email sending + inbound reply webhook পরে add করব.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
