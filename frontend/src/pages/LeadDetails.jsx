import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'won', 'lost'];

const LeadDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activity, setActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [statusEdit, setStatusEdit] = useState('');
  const [assignEdit, setAssignEdit] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [leadRes, notesRes, actRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/notes/${id}`),
        api.get(`/activity/${id}`),
      ]);
      setLead(leadRes.data);
      setStatusEdit(leadRes.data.status);
      setAssignEdit(leadRes.data.assignedTo?._id || '');
      setNotes(notesRes.data);
      setActivity(actRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load members for assign dropdown (admin only)
  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/auth/users')
        .then(({ data }) => setMembers(data))
        .catch(() => {});
    }
  }, [user]);

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/leads/${id}`, { status: statusEdit });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAssignUpdate = async () => {
    try {
      await api.put(`/leads/${id}`, { assignedTo: assignEdit || null });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Assign failed');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post('/notes', { leadId: id, text: noteText });
      setNoteText('');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      navigate('/leads');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <><Navbar /><div className="page"><p>Loading...</p></div></>;
  if (error) return <><Navbar /><div className="page"><p className="error">{error}</p></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>{lead.name}</h1>
          <div>
            {user?.role === 'admin' && (
              <>
                <Link to={`/leads/${id}/edit`} className="btn">Edit Lead</Link>
                <button className="btn danger" onClick={handleDelete} style={{ marginLeft: '0.5rem' }}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Lead Info</h3>
            <p><strong>Email:</strong> {lead.email || '—'}</p>
            <p><strong>Phone:</strong> {lead.phone || '—'}</p>
            <p><strong>Company:</strong> {lead.company || '—'}</p>
            <p><strong>Created by:</strong> {lead.createdBy?.name}</p>
            <p><strong>Assigned to:</strong> {lead.assignedTo?.name || 'Unassigned'}</p>
          </div>

          <div className="detail-card">
            <h3>Status</h3>
            <select
              value={statusEdit}
              onChange={(e) => setStatusEdit(e.target.value)}
              className="input"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn" onClick={handleStatusUpdate} style={{ marginTop: '0.5rem' }}>
              Update Status
            </button>
          </div>

          {user?.role === 'admin' && (
            <div className="detail-card">
              <h3>Assign To</h3>
              <select
                value={assignEdit}
                onChange={(e) => setAssignEdit(e.target.value)}
                className="input"
              >
                <option value="">— Unassigned —</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
              <button className="btn" onClick={handleAssignUpdate} style={{ marginTop: '0.5rem' }}>
                Save Assignment
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="section">
          <h2>Notes</h2>
          <form onSubmit={handleAddNote} className="note-form">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={3}
            />
            <button type="submit" className="btn">Add Note</button>
          </form>
          {notes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <ul className="note-list">
              {notes.map((n) => (
                <li key={n._id} className="note-item">
                  <p>{n.text}</p>
                  <small>{n.userId?.name} — {new Date(n.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activity */}
        <div className="section">
          <h2>Activity Log</h2>
          {activity.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            <ul className="activity-list">
              {activity.map((a) => (
                <li key={a._id} className="activity-item">
                  <span className="activity-action">{a.action.replace('_', ' ')}</span>
                  {a.detail && <span> — {a.detail}</span>}
                  <small> · {a.userId?.name} · {new Date(a.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadDetails;
