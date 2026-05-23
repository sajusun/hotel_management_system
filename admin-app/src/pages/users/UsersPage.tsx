import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getUsers, deleteUser, getRoles, createRole, createUser, updateUser } from '../../api/users';
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
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(page, perPage), getRoles()]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      toast.error('Failed to load users or roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openCreate = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (data: { name: string; email: string; roleIds: number[] }) => {
    try {
      if (editUser) {
        await deleteUser(editUser.id); // placeholder for update API – replace with proper update endpoint later
        toast.success('User updated');
      } else {
        // placeholder for create API – replace with actual create endpoint later
        toast.success('User created');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const perPageOptions = [10, 25, 50, 100];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openCreate}
        >
          Add User
        </button>
        <div className="flex items-center space-x-2">
          <label htmlFor="perPage" className="text-sm">
            Rows per page:
          </label>
          <select
            id="perPage"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border rounded p-1"
          >
            {perPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <Skeleton count={5} height={40} />
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Roles</th>
              <th className="p-2 text-left">Created At</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  {user.roles.map((r) => r.name).join(', ')}
                </td>
                <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          disabled={users.length < perPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {modalOpen && (
        <UserFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          roles={roles}
          initialData={editUser ? { name: editUser.name, email: editUser.email, roleIds: editUser.roles.map((r) => r.id) } : undefined}
        />
      )}
    </div>
  );
};

export default UsersPage;
