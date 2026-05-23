import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { createRole } from '../../api/users';
import Modal from './Modal';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

type FormValues = {
  name: string;
};

const schema = yup.object().shape({
  name: yup.string().required('Role name is required').min(3, 'Minimum 3 characters'),
});

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void; // callback to refresh role list
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createRole(data.name);
      toast.success('Role created');
      onCreated();
      onClose();
    } catch (e) {
      toast.error('Failed to create role');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Role">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="role-name" className="block mb-1 font-medium">
            Role Name
          </label>
          <input
            id="role-name"
            type="text"
            {...register('name')}
            className="w-full border rounded px-2 py-1"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-red-600 mt-1" role="alert">
              {errors.name.message}
            </p>
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
            {isSubmitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;
