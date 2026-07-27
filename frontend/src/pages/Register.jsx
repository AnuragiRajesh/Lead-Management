import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChartBarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'admin' ? '/dashboard' : '/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <ChartBarIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">LeadManager</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required autoFocus placeholder="John Doe" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className={inputCls}>
                <option value="member" className="bg-slate-800">Member</option>
                <option value="admin" className="bg-slate-800">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium rounded-xl transition-colors text-sm shadow-lg shadow-blue-900/30"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
