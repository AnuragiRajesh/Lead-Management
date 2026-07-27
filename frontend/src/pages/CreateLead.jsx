import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const CreateLead = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    assignedTo: '',
  });
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load team members for assignment dropdown
  useEffect(() => {
    api.get('/auth/users')
      .then(({ data }) => setMembers(data))
      .catch(() => {});
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
      navigate(`/leads/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>Create Lead</h1>
        <form className="lead-form" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input">
                <option value="">— Unassigned —</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateLead;
