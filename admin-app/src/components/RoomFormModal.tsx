import { useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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

// Validation schema using Yup
const schema = yup.object().shape({
  number: yup.string().required('Room number is required'),
  floor: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .typeError('Floor must be a number'),
  room_type_id: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .typeError('Room type must be a number'),
  status: yup.string().required('Status is required'),
  notes: yup.string().nullable(),
});

export default function RoomFormModal({ open, onClose, onSuccess, room, roomTypes }: Props) {
  const isEdit = Boolean(room);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      number: String(room?.number ?? ''),
      floor: room?.floor ?? null,
      room_type_id: room?.room_type?.id ?? null,
      status: room?.status ?? 'available',
      notes: room?.notes ?? '',
    },
  });

  // Reset form when modal opens or when editing a different room
  useEffect(() => {
    if (open) {
      reset({
        number: String(room?.number ?? ''),
        floor: room?.floor ?? null,
        room_type_id: room?.room_type?.id ?? null,
        status: room?.status ?? 'available',
        notes: room?.notes ?? '',
      });
    }
  }, [open, room, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      number: data.number,
      floor: data.floor,
      room_type_id: data.room_type_id,
      status: data.status,
      notes: data.notes || null,
    } as any;
    try {
      if (isEdit && room) {
        await api.patch(`/api/v1/rooms/${room.id}`, payload);
      } else {
        await api.post('/api/v1/rooms', payload);
      }
      toast.success('Room saved successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to save room');
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Edit Room' : 'Create New Room'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-labelledby={isEdit ? 'Edit Room' : 'Create New Room'}>
        {/* Room Number */}
        <FormField label="Room Number">
          <input
            {...register('number')}
            required
            className="w-full h-10 px-3 rounded border border-slate-200"
            aria-invalid={errors.number ? 'true' : 'false'}
          />
          {errors.number && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.number.message as string}
            </p>
          )}
        </FormField>

        {/* Floor */}
        <FormField label="Floor (optional)">
          <input
            type="number"
            {...register('floor')}
            className="w-full h-10 px-3 rounded border border-slate-200"
            placeholder="Leave empty if not applicable"
            aria-invalid={errors.floor ? 'true' : 'false'}
          />
          {errors.floor && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.floor.message as string}
            </p>
          )}
        </FormField>

        {/* Room Type */}
        <FormField label="Room Type">
          <select
            {...register('room_type_id')}
            className="w-full h-10 px-3 rounded border border-slate-200 bg-white"
            aria-invalid={errors.room_type_id ? 'true' : 'false'}
          >
            <option value="">-- Select type (optional) --</option>
            {Array.isArray(roomTypes) &&
              roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          {errors.room_type_id && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.room_type_id.message as string}
            </p>
          )}
        </FormField>

        {/* Status */}
        <FormField label="Status">
          <select
            {...register('status')}
            required
            className="w-full h-10 px-3 rounded border border-slate-200 bg-white"
            aria-invalid={errors.status ? 'true' : 'false'}
          >
            <option value="available">available</option>
            <option value="occupied">occupied</option>
            <option value="reserved">reserved</option>
            <option value="maintenance">maintenance</option>
            <option value="cleaning">cleaning</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.status.message as string}
            </p>
          )}
        </FormField>

        {/* Notes */}
        <FormField label="Notes (optional)">
          <textarea
            {...register('notes')}
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
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
