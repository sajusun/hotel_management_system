import { useState, useEffect, FormEvent } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import api from '../lib/axios';

type Room = {
  id: number;
  number: string | number;
  floor: number | null;
  status: string;
  notes: string | null;
  room_type?: { id: number; name: string } | null;
};

type RoomType = {
  id: number;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // callback to refresh list
  room?: Room | null; // if provided, modal works in edit mode
  roomTypes: RoomType[]; // list of available room types
};

export default function RoomFormModal({ open, onClose, onSuccess, room, roomTypes }: Props) {
  const isEdit = !!room;
  const [number, setNumber] = useState<string | number>(room?.number ?? '');
  const [floor, setFloor] = useState<number | ''>(room?.floor ?? '');
  const [typeId, setTypeId] = useState<number | ''>(room?.room_type?.id ?? '');
  const [status, setStatus] = useState<string>(room?.status ?? 'available');
  const [notes, setNotes] = useState<string>(room?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or when editing a different room
  useEffect(() => {
    if (open) {
      setNumber(room?.number ?? '');
      setFloor(room?.floor ?? '');
      setTypeId(room?.room_type?.id ?? '');
      setStatus(room?.status ?? 'available');
      setNotes(room?.notes ?? '');
      setError('');
    }
  }, [open, room]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      number,
      floor: floor === '' ? null : floor,
      room_type_id: typeId === '' ? null : typeId,
      status,
      notes: notes || null,
    } as any;
    try {
      if (isEdit && room) {
        await api.patch(`/api/v1/rooms/${room.id}`, payload);
      } else {
        await api.post('/api/v1/rooms', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Edit Room' : 'Create New Room'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <FormField label="Room Number">
          <input
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full h-10 px-3 rounded border border-slate-200"
          />
        </FormField>
        <FormField label="Floor (optional)">
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-10 px-3 rounded border border-slate-200"
            placeholder="Leave empty if not applicable"
          />
        </FormField>
        <FormField label="Room Type">
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-10 px-3 rounded border border-slate-200 bg-white"
          >
            <option value="">-- Select type (optional) --</option>
            {Array.isArray(roomTypes) ? roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              )) : null}
          </select>
        </FormField>
        <FormField label="Status">
          <select
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-10 px-3 rounded border border-slate-200 bg-white"
          >
            <option value="available">available</option>
            <option value="occupied">occupied</option>
            <option value="reserved">reserved</option>
            <option value="maintenance">maintenance</option>
            <option value="cleaning">cleaning</option>
          </select>
        </FormField>
        <FormField label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded border border-slate-200"
          />
        </FormField>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
