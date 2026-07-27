import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const LeadList = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/leads?${params}`);
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${deleteTarget}`);
      setDeleteTarget(null);
      setToast({ message: 'Lead deleted successfully', type: 'success' });
      fetchLeads();
    } catch (err) {
      setDeleteTarget(null);
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {pagination.total} total lead{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/leads/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              New Lead
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, company..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No leads found.</p>
              {user?.role === 'admin' && (
                <Link to="/leads/create" className="mt-3 inline-block text-blue-600 hover:underline text-sm font-medium">
                  Create your first lead
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                      <th className="px-6 py-3 text-left font-medium">Name</th>
                      <th className="px-6 py-3 text-left font-medium">Email</th>
                      <th className="px-6 py-3 text-left font-medium">Company</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-left font-medium">Assigned To</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-gray-900">{lead.name}</td>
                        <td className="px-6 py-3.5 text-gray-500">{lead.email || '—'}</td>
                        <td className="px-6 py-3.5 text-gray-500">{lead.company || '—'}</td>
                        <td className="px-6 py-3.5"><StatusBadge status={lead.status} /></td>
                        <td className="px-6 py-3.5 text-gray-500">{lead.assignedTo?.name || '—'}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/leads/${lead._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-3.5 h-3.5" /> View
                            </Link>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => setDeleteTarget(lead._id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-3.5 h-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Lead"
          message="This will permanently remove the lead and all its notes and activity. This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LeadList;
