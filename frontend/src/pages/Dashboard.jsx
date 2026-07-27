import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  won: '#10b981',
  lost: '#ef4444',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/leads?limit=5&page=1');
        setRecent(data.leads);

        // Build status summary from all leads
        const all = await api.get('/leads?limit=1000');
        const summary = { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 };
        all.data.leads.forEach((l) => {
          if (summary[l.status] !== undefined) summary[l.status]++;
        });
        setStats({ total: all.data.pagination.total, ...summary });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>Welcome, {user?.name}</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <span className="stat-number">{stats?.total}</span>
                <span className="stat-label">Total Leads</span>
              </div>
              {['new', 'contacted', 'qualified', 'won', 'lost'].map((s) => (
                <div
                  key={s}
                  className="stat-card"
                  style={{ borderTop: `4px solid ${STATUS_COLORS[s]}` }}
                >
                  <span className="stat-number">{stats?.[s]}</span>
                  <span className="stat-label" style={{ textTransform: 'capitalize' }}>{s}</span>
                </div>
              ))}
            </div>

            <h2>Recent Leads</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.company || '—'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: STATUS_COLORS[lead.status] }}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td>{lead.assignedTo?.name || '—'}</td>
                    <td>
                      <Link to={`/leads/${lead._id}`} className="btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/leads" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
              View All Leads →
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
