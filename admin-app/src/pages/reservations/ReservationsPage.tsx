import { useEffect, useState } from 'react';
import { Search, Plus, XCircle, CheckCircle2, User, Key, DollarSign, CalendarDays } from 'lucide-react';
import api from '../../lib/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Pagination from '../../components/Pagination';
import type { LaravelPaginated } from '../../types/pagination';
import type { Guest } from '../guests/GuestsPage';

type RoomType = {
  id: number;
  name: string;
  base_rate: number;
  capacity: number;
};

type Room = {
  id: number;
  number: string;
  floor: number;
  status: string;
  notes: string | null;
  room_type?: RoomType;
};

type Reservation = {
  id: number;
  reference: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  nightly_rate: number;
  estimated_total: number;
  special_requests: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  room?: Room | null;
  guest?: Guest | null;
  created_at: string;
};

export default function ReservationsPage() {
  const [data, setData] = useState<LaravelPaginated<Reservation> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Wizard Modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // Search parameters for availability
  const [searchParams, setSearchParams] = useState({
    check_in_date: '',
    check_out_date: '',
    room_type_id: '',
    guests_count: 1,
  });
  const [searchingRooms, setSearchingRooms] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Guest search / create state
  const [guestSearch, setGuestSearch] = useState('');
  const [guestResults, setGuestResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [newGuestData, setNewGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: '',
  });

  // Final booking request states
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Selected reservation for details view
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch reservations
  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (status) params.set('status', status);
      const res = await api.get<LaravelPaginated<Reservation>>(`/api/v1/reservations?${params.toString()}`);
      setData(res.data);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, status]);

  // Load Room Types for wizard dropdown
  useEffect(() => {
    if (wizardOpen && roomTypes.length === 0) {
      api.get<{ data: RoomType[] }>('/api/v1/room-types')
        .then((res) => setRoomTypes(res.data.data))
        .catch(() => {});
    }
  }, [wizardOpen]);

  // Search rooms
  const handleSearchRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingRooms(true);
    setSelectedRoom(null);
    try {
      const params = new URLSearchParams();
      params.set('check_in_date', searchParams.check_in_date);
      params.set('check_out_date', searchParams.check_out_date);
      if (searchParams.room_type_id) params.set('room_type_id', searchParams.room_type_id);
      params.set('guests_count', String(searchParams.guests_count));

      const res = await api.get<{ data: Room[] }>(`/api/v1/availability?${params.toString()}`);
      setAvailableRooms(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch available rooms.');
    } finally {
      setSearchingRooms(false);
    }
  };

  // Search guests
  useEffect(() => {
    if (!guestSearch) {
      setGuestResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get<LaravelPaginated<Guest>>(`/api/v1/guests?q=${encodeURIComponent(guestSearch)}`);
        setGuestResults(res.data.data);
      } catch {
        // ignore
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [guestSearch]);

  // Create Guest Inline
  const handleCreateGuestInline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<{ data: Guest }>('/api/v1/guests', newGuestData);
      setSelectedGuest(res.data.data);
      setShowAddGuestForm(false);
      setGuestSearch('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create guest.');
    }
  };

  // Book Reservation
  const handleBookReservation = async () => {
    if (!selectedRoom || !selectedGuest) return;
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/api/v1/reservations', {
        room_id: selectedRoom.id,
        guest_id: selectedGuest.id,
        check_in_date: searchParams.check_in_date,
        check_out_date: searchParams.check_out_date,
        guests_count: searchParams.guests_count,
        special_requests: specialRequests,
      });
      setWizardOpen(false);
      // Reset wizard
      setWizardStep(1);
      setSelectedRoom(null);
      setSelectedGuest(null);
      setSpecialRequests('');
      setPage(1);
      fetchReservations();
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Actions on individual reservations
  const handleCancelReservation = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.post(`/api/v1/reservations/${id}/cancel`);
      fetchReservations();
      setDetailsOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const handleCheckIn = async (id: number) => {
    if (!confirm('Perform check-in for this reservation?')) return;
    try {
      await api.post(`/api/v1/reservations/${id}/check-in`);
      fetchReservations();
      setDetailsOpen(false);
      alert('Guest checked-in successfully! A stay has been started.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to check-in.');
    }
  };

  // Wizard Open Trigger
  const handleOpenWizard = () => {
    setWizardStep(1);
    setSelectedRoom(null);
    setSelectedGuest(null);
    setSearchParams({
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      room_type_id: '',
      guests_count: 1,
    });
    setAvailableRooms([]);
    setWizardOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage guest bookings, search room availability, and handle check-ins.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenWizard}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Book Reservation
        </button>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

      {/* Filter and Search controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
          <span className="text-slate-500">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="bg-transparent font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Reservation List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">All Reservations</div>
          {data?.meta && (
            <div className="text-xs text-slate-500">
              Total <span className="font-medium text-slate-700">{data.meta.total}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading bookings...</div>
        ) : data?.data?.length ? (
          <div>
            <div className="hidden lg:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Ref</th>
                    <th className="text-left font-medium px-5 py-3">Guest</th>
                    <th className="text-left font-medium px-5 py-3">Room</th>
                    <th className="text-left font-medium px-5 py-3">Check In</th>
                    <th className="text-left font-medium px-5 py-3">Check Out</th>
                    <th className="text-left font-medium px-5 py-3">Total Est.</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                    <th className="text-right font-medium px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((res) => {
                    const statusColors = {
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                      completed: 'bg-slate-50 text-slate-600 border-slate-200',
                    }[res.status];

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3 font-semibold text-slate-900 font-mono">#{res.reference}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{res.guest?.full_name || '—'}</td>
                        <td className="px-5 py-3 text-slate-700">Room {res.room?.number || '—'} ({res.room?.room_type?.name || '—'})</td>
                        <td className="px-5 py-3 text-slate-700">{res.check_in_date}</td>
                        <td className="px-5 py-3 text-slate-700">{res.check_out_date}</td>
                        <td className="px-5 py-3 text-slate-900 font-semibold">${res.estimated_total}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRes(res);
                              setDetailsOpen(true);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {data.data.map((res) => {
                const statusColors = {
                  pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  completed: 'bg-slate-50 text-slate-600 border-slate-200',
                }[res.status];

                return (
                  <div key={res.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Guest: {res.guest?.full_name || '—'}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">Ref: #{res.reference}</div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Room {res.room?.number || '—'} ({res.room?.room_type?.name || '—'})</div>
                      <div>Dates: {res.check_in_date} to {res.check_out_date}</div>
                      <div className="font-semibold text-slate-900 mt-1">Est. Total: ${res.estimated_total}</div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRes(res);
                          setDetailsOpen(true);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
                      >
                        Manage Booking
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-slate-200">
              <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">No reservations found.</div>
        )}
      </div>

      {/* Reservation Details Drawer/Modal */}
      <Modal
        open={detailsOpen}
        title={selectedRes ? `Reservation: #${selectedRes.reference}` : ''}
        onClose={() => setDetailsOpen(false)}
      >
        {selectedRes && (
          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" /> Guest Details
              </h3>
              <div className="text-sm text-slate-700 grid grid-cols-2 gap-y-2">
                <div>Name: <span className="font-medium text-slate-900">{selectedRes.guest?.full_name}</span></div>
                <div>Email: <span className="font-medium text-slate-900">{selectedRes.guest?.email}</span></div>
                <div>Phone: <span className="font-medium text-slate-900">{selectedRes.guest?.phone || '—'}</span></div>
                <div>Document: <span className="font-medium text-slate-900 font-mono">{selectedRes.guest?.document_number || '—'}</span></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-500" /> Room & Booking Info
              </h3>
              <div className="text-sm text-slate-700 grid grid-cols-2 gap-y-2">
                <div>Room: <span className="font-medium text-slate-900">#{selectedRes.room?.number}</span></div>
                <div>Floor: <span className="font-medium text-slate-900">{selectedRes.room?.floor}</span></div>
                <div>Room Type: <span className="font-medium text-slate-900">{selectedRes.room?.room_type?.name}</span></div>
                <div>Guests Count: <span className="font-medium text-slate-900">{selectedRes.guests_count}</span></div>
                <div>Check-in: <span className="font-medium text-slate-900">{selectedRes.check_in_date}</span></div>
                <div>Check-out: <span className="font-medium text-slate-900">{selectedRes.check_out_date}</span></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" /> Billing Estimation
              </h3>
              <div className="text-sm text-slate-700 grid grid-cols-2 gap-y-2">
                <div>Nightly Rate: <span className="font-semibold text-slate-900">${selectedRes.nightly_rate}</span></div>
                <div>Estimated Total: <span className="font-semibold text-indigo-600">${selectedRes.estimated_total}</span></div>
              </div>
            </div>

            {selectedRes.special_requests && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-1.5">
                <div className="text-xs font-semibold text-amber-800">Special Requests</div>
                <div className="text-sm text-amber-900 italic">{selectedRes.special_requests}</div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400">
                Created: {new Date(selectedRes.created_at).toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                >
                  Close
                </button>
                {selectedRes.status === 'confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCancelReservation(selectedRes.id)}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCheckIn(selectedRes.id)}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Check In Guest
                    </button>
                  </>
                )}
                {selectedRes.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancelReservation(selectedRes.id)}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Book Reservation Wizard Modal */}
      <Modal
        open={wizardOpen}
        title={`New Reservation: Step ${wizardStep} of 3`}
        onClose={() => setWizardOpen(false)}
      >
        <div className="space-y-5">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-100 pb-3">
            <span className={wizardStep >= 1 ? 'text-indigo-600 font-bold' : ''}>1. Room Availability</span>
            <span className="text-slate-300">/</span>
            <span className={wizardStep >= 2 ? 'text-indigo-600 font-bold' : ''}>2. Guest Information</span>
            <span className="text-slate-300">/</span>
            <span className={wizardStep >= 3 ? 'text-indigo-600 font-bold' : ''}>3. Review & Book</span>
          </div>

          {/* STEP 1: Search Availability */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <form onSubmit={handleSearchRooms} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Check In Date">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={searchParams.check_in_date}
                    onChange={(e) => setSearchParams({ ...searchParams, check_in_date: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </FormField>
                <FormField label="Check Out Date">
                  <input
                    type="date"
                    required
                    min={searchParams.check_in_date || new Date().toISOString().split('T')[0]}
                    value={searchParams.check_out_date}
                    onChange={(e) => setSearchParams({ ...searchParams, check_out_date: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </FormField>
                <FormField label="Room Type">
                  <select
                    value={searchParams.room_type_id}
                    onChange={(e) => setSearchParams({ ...searchParams, room_type_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  >
                    <option value="">All Types</option>
                    {roomTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Max {t.capacity} guests - ${t.base_rate}/night)
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Guests Count">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={searchParams.guests_count}
                    onChange={(e) => setSearchParams({ ...searchParams, guests_count: parseInt(e.target.value) || 1 })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </FormField>
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={searchingRooms}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
                  >
                    <CalendarDays className="w-4 h-4" />
                    {searchingRooms ? 'Searching Rooms...' : 'Search Availability'}
                  </button>
                </div>
              </form>

              {/* Availability Results */}
              {availableRooms.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Available Room</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      return (
                        <button
                          type="button"
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-sm font-bold text-slate-800">Room #{room.number}</div>
                          <div className="text-[11px] text-slate-500 mt-1">Floor {room.floor} • Cap: {room.room_type?.capacity}</div>
                          <div className="text-xs font-semibold text-indigo-600 mt-2">${room.room_type?.base_rate}/night</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-150">
                  No rooms found matching your dates and criteria. Click "Search Availability".
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!selectedRoom}
                  onClick={() => setWizardStep(2)}
                  className="h-10 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  Next: Guest Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Choose or Create Guest */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              {!showAddGuestForm ? (
                <div className="space-y-4">
                  <FormField label="Search Existing Guest" hint="Type email, name, or phone">
                    <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-lg border border-slate-200">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-900 focus:outline-none"
                      />
                    </div>
                  </FormField>

                  {/* Guest Dropdown list */}
                  {guestResults.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto divide-y divide-slate-150">
                      {guestResults.map((guest) => (
                        <button
                          type="button"
                          key={guest.id}
                          onClick={() => {
                            setSelectedGuest(guest);
                            setGuestSearch('');
                            setGuestResults([]);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800">{guest.full_name}</span>
                          <span className="text-slate-400">{guest.email}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedGuest && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                      <div className="text-sm">
                        Selected Guest: <span className="font-bold text-emerald-800">{selectedGuest.full_name}</span> ({selectedGuest.email})
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedGuest(null)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">Or guest not in list? </span>
                    <button
                      type="button"
                      onClick={() => setShowAddGuestForm(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Create new guest profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateGuestInline} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-semibold text-slate-700">Quick Create Guest</span>
                    <button
                      type="button"
                      onClick={() => setShowAddGuestForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Back to Search
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="First Name">
                      <input
                        type="text"
                        required
                        value={newGuestData.first_name}
                        onChange={(e) => setNewGuestData({ ...newGuestData, first_name: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </FormField>
                    <FormField label="Last Name">
                      <input
                        type="text"
                        required
                        value={newGuestData.last_name}
                        onChange={(e) => setNewGuestData({ ...newGuestData, last_name: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </FormField>
                  </div>
                  <FormField label="Email">
                    <input
                      type="email"
                      required
                      value={newGuestData.email}
                      onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </FormField>
                  <FormField label="Phone">
                    <input
                      type="text"
                      value={newGuestData.phone}
                      onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </FormField>
                  <FormField label="Document Number">
                    <input
                      type="text"
                      value={newGuestData.document_number}
                      onChange={(e) => setNewGuestData({ ...newGuestData, document_number: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                    />
                  </FormField>
                  <button
                    type="submit"
                    className="w-full h-9 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all mt-2"
                  >
                    Save & Choose Guest
                  </button>
                </form>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedGuest}
                  onClick={() => setWizardStep(3)}
                  className="h-10 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  Next: Final Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review and Book */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              {bookingError && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{bookingError}</div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 divide-y divide-slate-250 text-sm space-y-3">
                <div className="pb-2">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Guest</div>
                  <div className="font-semibold text-slate-900">{selectedGuest?.full_name}</div>
                  <div className="text-xs text-slate-500">{selectedGuest?.email}</div>
                </div>

                <div className="py-2.5">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Room Details</div>
                  <div className="font-semibold text-slate-900">Room #{selectedRoom?.number} ({selectedRoom?.room_type?.name})</div>
                  <div className="text-xs text-slate-500">Floor {selectedRoom?.floor} • Capacity: {selectedRoom?.room_type?.capacity} guests</div>
                </div>

                <div className="py-2.5">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Dates & Guests</div>
                  <div className="font-semibold text-slate-900">{searchParams.check_in_date} to {searchParams.check_out_date}</div>
                  <div className="text-xs text-slate-500">{searchParams.guests_count} Guests</div>
                </div>

                <div className="pt-2.5">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Rate Estimate</div>
                  <div className="font-semibold text-slate-900">${selectedRoom?.room_type?.base_rate}/night</div>
                </div>
              </div>

              <FormField label="Special Requests / Custom Notes">
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. late check-in, dietary restrictions, airport shuttle..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </FormField>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={bookingLoading}
                  onClick={handleBookReservation}
                  className="h-10 px-5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold transition-all shadow-sm"
                >
                  {bookingLoading ? 'Confirming...' : 'Book Reservation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
