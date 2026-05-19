import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/axios';
import FormField from '../../components/FormField';

type SiteSettings = {
  name: string;
  title?: string | null;
  description?: string | null;
  tagline?: string | null;
  seo_keywords?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;

  owner_name?: string | null;
  owner_email?: string | null;
  owner_phone?: string | null;

  support_email?: string | null;
  support_phone?: string | null;
  support_hours?: string | null;
  support_url?: string | null;

  newsletter_enabled?: boolean;
  newsletter_from_name?: string | null;
  newsletter_from_email?: string | null;
  newsletter_reply_to_email?: string | null;
  newsletter_footer_text?: string | null;
  newsletter_manage_url?: string | null;
};

const emptySettings: SiteSettings = {
  name: '',
  title: '',
  description: '',
  tagline: '',
  seo_keywords: '',
  logo_url: '',
  favicon_url: '',
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  support_email: '',
  support_phone: '',
  support_hours: '',
  support_url: '',

  newsletter_enabled: false,
  newsletter_from_name: '',
  newsletter_from_email: '',
  newsletter_reply_to_email: '',
  newsletter_footer_text: '',
  newsletter_manage_url: '',
};

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);

  const onChange = (key: keyof SiteSettings, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const payload = useMemo(() => {
    const clean = { ...settings };
    // keep empty strings as null-ish on server side by trimming; backend merges defaults anyway
    return Object.fromEntries(
      Object.entries(clean).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ) as SiteSettings;
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<{ data: SiteSettings }>('/api/v1/settings/site');
        if (!cancelled) {
          setSettings({ ...emptySettings, ...(res.data.data || {}) });
        }
      } catch {
        if (!cancelled) setError('Failed to load site settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put<{ data: SiteSettings }>('/api/v1/settings/site', payload);
      setSettings({ ...emptySettings, ...(res.data.data || {}) });
      setMessage('Saved successfully');
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        typeof (e as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message as string)
          : 'Save failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-slate-900">Site Settings</div>
            <div className="text-sm text-slate-500 mt-1">Branding, SEO, owner and support information.</div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {message && <div className="mt-4 p-3 rounded-lg border border-green-200 bg-green-50 text-sm text-green-700">{message}</div>}
        {error && <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-900">Brand</div>
            <FormField label="Site Name" hint="Required">
              <input
                value={settings.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="Your site name"
              />
            </FormField>
            <FormField label="Title">
              <input
                value={settings.title || ''}
                onChange={(e) => onChange('title', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="Browser title / default page title"
              />
            </FormField>
            <FormField label="Tagline">
              <input
                value={settings.tagline || ''}
                onChange={(e) => onChange('tagline', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="Short tagline"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                value={settings.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                className="min-h-[96px] w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="SEO description"
              />
            </FormField>
            <FormField label="SEO Keywords" hint="Comma separated">
              <input
                value={settings.seo_keywords || ''}
                onChange={(e) => onChange('seo_keywords', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="hotel, booking, rooms"
              />
            </FormField>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-900">Assets</div>
            <FormField label="Logo URL">
              <input
                value={settings.logo_url || ''}
                onChange={(e) => onChange('logo_url', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="https://…"
              />
            </FormField>
            <FormField label="Favicon URL">
              <input
                value={settings.favicon_url || ''}
                onChange={(e) => onChange('favicon_url', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="https://…"
              />
            </FormField>

            <div className="pt-2 border-t border-slate-100" />
            <div className="text-sm font-semibold text-slate-900">Owner</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Owner Name">
                <input
                  value={settings.owner_name || ''}
                  onChange={(e) => onChange('owner_name', e.target.value)}
                  className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </FormField>
              <FormField label="Owner Email">
                <input
                  value={settings.owner_email || ''}
                  onChange={(e) => onChange('owner_email', e.target.value)}
                  className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </FormField>
            </div>
            <FormField label="Owner Phone">
              <input
                value={settings.owner_phone || ''}
                onChange={(e) => onChange('owner_phone', e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="text-lg font-semibold text-slate-900">Support Center</div>
        <div className="text-sm text-slate-500 mt-1">Public support contacts and portal links.</div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField label="Support Email">
            <input
              value={settings.support_email || ''}
              onChange={(e) => onChange('support_email', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>
          <FormField label="Support Phone">
            <input
              value={settings.support_phone || ''}
              onChange={(e) => onChange('support_phone', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>
          <FormField label="Support Hours">
            <input
              value={settings.support_hours || ''}
              onChange={(e) => onChange('support_hours', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="Sat–Thu 10:00–18:00"
            />
          </FormField>
          <FormField label="Support Portal URL">
            <input
              value={settings.support_url || ''}
              onChange={(e) => onChange('support_url', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="https://support.…"
            />
          </FormField>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-lg font-semibold text-slate-900">Email Subscription</div>
            <div className="text-sm text-slate-500 mt-1">Newsletter and promotions (subscriber emails).</div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none">
            <input
              type="checkbox"
              checked={Boolean(settings.newsletter_enabled)}
              onChange={(e) => setSettings((s) => ({ ...s, newsletter_enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300"
            />
            Enabled
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField label="From Name">
            <input
              value={settings.newsletter_from_name || ''}
              onChange={(e) => onChange('newsletter_from_name', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="HMS Support"
            />
          </FormField>
          <FormField label="From Email">
            <input
              value={settings.newsletter_from_email || ''}
              onChange={(e) => onChange('newsletter_from_email', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="news@yourdomain.com"
            />
          </FormField>
          <FormField label="Reply-To Email">
            <input
              value={settings.newsletter_reply_to_email || ''}
              onChange={(e) => onChange('newsletter_reply_to_email', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="support@yourdomain.com"
            />
          </FormField>
          <FormField label="Manage Subscription URL" hint="Optional">
            <input
              value={settings.newsletter_manage_url || ''}
              onChange={(e) => onChange('newsletter_manage_url', e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-slate-200 bg-white text-sm"
              placeholder="https://yourdomain.com/newsletter"
            />
          </FormField>
          <div className="lg:col-span-2">
            <FormField label="Footer Text" hint="Optional">
              <textarea
                value={settings.newsletter_footer_text || ''}
                onChange={(e) => onChange('newsletter_footer_text', e.target.value)}
                className="min-h-[96px] w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                placeholder="You received this email because you subscribed to…"
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
}
