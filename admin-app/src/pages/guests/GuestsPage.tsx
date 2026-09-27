import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Phone, Mail } from 'lucide-react';
import api from '../../lib/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Pagination from '../../components/Pagination';
import type { LaravelPaginated } from '../../types/pagination';

export type Guest = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  document_number: string | null;
  notes: string | null;
  created_at: string;
};

export default function GuestsPage() {
  const [data, setData] = useState<LaravelPaginated<Guest> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch guests
  const fetchGuests = async (currentPage: number, query: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      if (query) params.set('q', query);
      const res = await api.get<LaravelPaginated<Guest>>(`/api/v1/guests?${params.toString()}`);
      setData(res.data);
    } catch {
      setError('Failed to load guests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGuests(page, search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      document_number: '',
      notes: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone || '',
      document_number: guest.document_number || '',
      notes: guest.notes || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (editingGuest) {
        await api.put(`/api/v1/guests/${editingGuest.id}`, formData);
      } else {
        await api.post('/api/v1/guests', formData);
      }
      setModalOpen(false);
      fetchGuests(page, search);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('An error occurred. Please verify your inputs.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guests</h1>
          <p className="text-sm text-slate-500 mt-1">Manage guest records and view contact information.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Guest
        </button>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Guest List</div>
          {data?.meta && (
            <div className="text-xs text-slate-500">
              Total <span className="font-medium text-slate-700">{data.meta.total}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading guests...</div>
        ) : data?.data?.length ? (
          <div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Name</th>
                    <th className="text-left font-medium px-5 py-3">Email</th>
                    <th className="text-left font-medium px-5 py-3">Phone</th>
                    <th className="text-left font-medium px-5 py-3">Doc Number</th>
                    <th className="text-left font-medium px-5 py-3">Notes</th>
                    <th className="text-right font-medium px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((guest) => (
                    <tr key={guest.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-semibold text-slate-900">{guest.full_name}</td>
                      <td className="px-5 py-3 text-slate-700">{guest.email}</td>
                      <td className="px-5 py-3 text-slate-700">{guest.phone || '—'}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono">{guest.document_number || '—'}</td>
                      <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{guest.notes || '—'}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(guest)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center"
                          title="Edit Guest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {data.data.map((guest) => (
                <div key={guest.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{guest.full_name}</div>
                      {guest.document_number && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">Doc: {guest.document_number}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(guest)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{guest.email}</span>
                    </div>
                    {guest.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                  </div>
                  {guest.notes && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      {guest.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-200">
              <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">No guests found.</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        title={editingGuest ? 'Edit Guest' : 'Add Guest'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name">
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              />
            </FormField>
          </div>

          <FormField label="Email Address">
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>

          <FormField label="Phone Number">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>

          <FormField label="Document Number (Passport / ID)">
            <input
              type="text"
              value={formData.document_number}
              onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-mono"
            />
          </FormField>

          <FormField label="Notes / Comments">
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingGuest ? 'Save Changes' : 'Create Guest'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
