import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, UserPlus, ChevronLeft, ChevronRight, AlertTriangle, Users } from 'lucide-react';
import { getUsers, deleteUser, getRoles, createUser, updateUser } from '../../api/users';
import UserFormModal from '../../components/UserFormModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  created_at: string;
  image?: string;
}

// ── Inline confirmation dialog ──────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, userName, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Delete User</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete <span className="font-medium text-slate-700">"{userName}"</span>?
              <br />This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Role badge ───────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700',
  help_desk: 'bg-amber-100 text-amber-700',
};

const RoleBadge: React.FC<{ name: string }> = ({ name }) => {
  const color = ROLE_COLORS[name.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {name}
    </span>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(page, perPage), getRoles()]);
      const paginated = usersRes.data;
      setUsers(Array.isArray(paginated) ? paginated : (paginated.data ?? []));
      setTotal(paginated.total ?? 0);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data?.data ?? []));
    } catch {
      toast.error('Failed to load users or roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, perPage]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      // If last item on page, go back
      if (users.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchData();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // ── Create / Edit ─────────────────────────────────────────────────────────
  const handleSubmit = async (data: { name: string; email: string; password?: string; roleIds: number[] }) => {
    try {
      const roleNames = data.roleIds
        .map((id) => roles.find((r) => r.id === id)?.name)
        .filter(Boolean) as string[];

      if (editUser) {
        await updateUser(editUser.id, { name: data.name, email: data.email, roles: roleNames });
        toast.success('User updated successfully');
      } else {
        await createUser({ name: data.name, email: data.email, password: data.password, roles: roleNames });
        toast.success('User created successfully');
      }
      setModalOpen(false);
      setEditUser(null);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Operation failed';
      toast.error(msg);
      throw err; // keep modal open
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const perPageOptions = [10, 25, 50, 100];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">
              {total > 0 ? `${total} user${total !== 1 ? 's' : ''} total` : 'Manage system users and roles'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditUser(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {users.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="perPage" className="text-xs text-slate-500">Rows:</label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton height={18} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users className="w-10 h-10" />
                      <p className="font-medium">No users found</p>
                      <p className="text-xs">Click "Add User" to create the first one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-1">

                        <img
                          src={user.image}
                          alt={user.name.charAt(0).toUpperCase()}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border"
                        />
                        {user.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0
                          ? <span className="text-slate-400 text-xs">No roles</span>
                          : user.roles.map((r) => <RoleBadge key={r.id} name={r.name} />)
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditUser(user); setModalOpen(true); }}
                          title="Edit user"
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Delete user"
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition
                      ${page === p
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                  >
                    {p}
                  </button>
                )
              )
            }
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        onSubmit={handleSubmit}
        roles={roles}
        initialData={editUser
          ? { name: editUser.name, email: editUser.email, roleIds: editUser.roles.map((r) => r.id) }
          : undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        userName={deleteTarget?.name ?? ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default UsersPage;
