import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import {
  ShieldCheckIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const LIMIT = 8;

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
    ${role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
    {role === 'admin'
      ? <ShieldCheckIcon className="w-3 h-3" />
      : <UserIcon className="w-3 h-3" />}
    {role}
  </span>
);

// Avatar color based on first letter
const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
];
const avatarColor = (name) =>
  AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/auth/users?page=${page}&limit=${LIMIT}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const startIndex = (pagination.page - 1) * LIMIT + 1;
  const endIndex = Math.min(startIndex + users.length - 1, pagination.total);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {pagination.total} registered user{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
              <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No users found.</div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-left font-medium">User</th>
                      <th className="px-6 py-3.5 text-left font-medium">Email</th>
                      <th className="px-6 py-3.5 text-left font-medium">Role</th>
                      <th className="px-6 py-3.5 text-left font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(u.name)} flex items-center justify-center text-white text-sm font-bold uppercase shrink-0`}>
                              {u.name?.[0]}
                            </div>
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/40">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-medium text-gray-700">{startIndex}–{endIndex}</span> of{' '}
                  <span className="font-medium text-gray-700">{pagination.total}</span> users
                </p>

                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>

                  {/* Page number pills */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors
                        ${p === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      {p}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
