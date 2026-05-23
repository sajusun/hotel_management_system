import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import Modal from './Modal';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; roles: string[] }) => void;
  roles: string[]; // list of available role names
  defaultValues?: { name: string; email: string; roles: string[] };
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Too short'),
  email: yup.string().required('Email is required').email('Invalid email'),
  roles: yup.array().of(yup.string()).min(1, 'Select at least one role'),
});

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, roles, defaultValues }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues || { name: '', email: '', roles: [] },
  });

  const submitHandler = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (e) {
      toast.error('Operation failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={defaultValues ? 'Edit User' : 'Add User'}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full border rounded px-2 py-1"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-red-600 mt-1" role="alert">{errors.name.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full border rounded px-2 py-1"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-600 mt-1" role="alert">{errors.email.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="roles" className="block mb-1 font-medium">Roles</label>
          <select
            id="roles"
            multiple
            {...register('roles')}
            className="w-full border rounded px-2 py-1 h-32"
            aria-invalid={!!errors.roles}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.roles && (
            <p className="text-red-600 mt-1" role="alert">{errors.roles.message}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
