import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

const CreateLead = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'new', assignedTo: '' });
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setMembers(data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      const { data } = await api.post('/leads', payload);
      setToast({ message: 'Lead created successfully!', type: 'success' });
      setTimeout(() => navigate(`/leads/${data._id}`), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/leads" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Lead</h1>
            <p className="text-gray-500 text-sm mt-0.5">Add a new lead to your pipeline</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required autoFocus placeholder="Jane Smith" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
                <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className={inputCls}>
                  <option value="">— Unassigned —</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <Link to="/leads" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                {loading ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CreateLead;
