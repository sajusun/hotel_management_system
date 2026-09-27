import { useEffect, useState } from 'react';
import Modal from './Modal';

interface Role {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  roleIds: number[];
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; password?: string; roleIds: number[] }) => Promise<void>;
  roles: Role[];
  initialData?: { name: string; email: string; roleIds: number[] };
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, roles, initialData }) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    roleIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        password: '',
        roleIds: initialData?.roleIds ?? [],
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required.';
    if (!isEdit && form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (isEdit && form.password && form.password.length < 8) errs.password = 'New password must be at least 8 characters.';
    if (form.roleIds.length === 0) errs.roleIds = 'Select at least one role.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleRole = (id: number) => {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(id)
        ? prev.roleIds.filter((r) => r !== id)
        : [...prev.roleIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        roleIds: form.roleIds,
        ...(form.password ? { password: form.password } : {}),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={isEdit ? 'Edit User' : 'Add New User'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="u-name" className="block text-sm font-medium text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="u-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition
              ${errors.name ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-400'}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="u-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="u-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition
              ${errors.email ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-400'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="u-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password {isEdit ? <span className="text-slate-400 font-normal">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
          </label>
          <input
            id="u-password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition
              ${errors.password ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-400'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Roles <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roles.length === 0 && (
              <p className="text-slate-400 text-sm col-span-2">No roles available.</p>
            )}
            {roles.map((role) => (
              <label
                key={role.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition
                  ${form.roleIds.includes(role.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={form.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
          {errors.roleIds && <p className="text-red-500 text-xs mt-1">{errors.roleIds}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {submitting ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
