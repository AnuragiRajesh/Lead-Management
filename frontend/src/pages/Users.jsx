import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { UserCircleIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
    ${role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
    {role === 'admin'
      ? <ShieldCheckIcon className="w-3 h-3" />
      : <UserIcon className="w-3 h-3" />}
    {role}
  </span>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/users')
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No users found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-medium">User</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                          {u.name?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
