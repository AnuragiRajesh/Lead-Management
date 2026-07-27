import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import {
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const statConfig = [
  { key: 'total',     label: 'Total Leads',  icon: UserGroupIcon,       color: 'bg-blue-500',    light: 'bg-blue-50 text-blue-600' },
  { key: 'new',       label: 'New',          icon: BoltIcon,            color: 'bg-indigo-500',  light: 'bg-indigo-50 text-indigo-600' },
  { key: 'contacted', label: 'Contacted',    icon: ArrowTrendingUpIcon, color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-600' },
  { key: 'qualified', label: 'Qualified',    icon: ArrowTrendingUpIcon, color: 'bg-violet-500',  light: 'bg-violet-50 text-violet-600' },
  { key: 'won',       label: 'Won',          icon: CheckCircleIcon,     color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600' },
  { key: 'lost',      label: 'Lost',         icon: XCircleIcon,         color: 'bg-red-500',     light: 'bg-red-50 text-red-600' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, allRes] = await Promise.all([
          api.get('/leads?limit=5&page=1'),
          api.get('/leads?limit=1000'),
        ]);
        setRecent(recentRes.data.leads);
        const summary = { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 };
        allRes.data.leads.forEach((l) => { if (summary[l.status] !== undefined) summary[l.status]++; });
        setStats({ total: allRes.data.pagination.total, ...summary });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your leads today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {statConfig.map(({ key, label, icon: Icon, light }) => (
                <div key={key} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${light}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.[key] ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent leads */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Leads</h2>
                <Link to="/leads" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                  View all <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No leads yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50/60">
                        <th className="px-6 py-3 text-left font-medium">Name</th>
                        <th className="px-6 py-3 text-left font-medium">Company</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-left font-medium">Assigned To</th>
                        <th className="px-6 py-3 text-left font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recent.map((lead) => (
                        <tr key={lead._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-3.5 font-medium text-gray-900">{lead.name}</td>
                          <td className="px-6 py-3.5 text-gray-500">{lead.company || '—'}</td>
                          <td className="px-6 py-3.5"><StatusBadge status={lead.status} /></td>
                          <td className="px-6 py-3.5 text-gray-500">{lead.assignedTo?.name || '—'}</td>
                          <td className="px-6 py-3.5">
                            <Link to={`/leads/${lead._id}`} className="text-blue-600 hover:text-blue-700 font-medium">View →</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
