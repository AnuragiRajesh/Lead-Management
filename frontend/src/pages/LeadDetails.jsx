import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import {
  ArrowLeftIcon,
  TrashIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [toast, setToast] = useState(null);

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

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/auth/users').then(({ data }) => setMembers(data)).catch(() => {});
    }
  }, [user]);

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/leads/${id}`, { status: statusEdit });
      setShowStatusConfirm(false);
      setToast({ message: 'Status updated successfully', type: 'success' });
      fetchAll();
    } catch (err) {
      setShowStatusConfirm(false);
      setToast({ message: err.response?.data?.message || 'Update failed', type: 'error' });
    }
  };

  const handleAssignUpdate = async () => {
    try {
      await api.put(`/leads/${id}`, { assignedTo: assignEdit || null });
      setShowAssignConfirm(false);
      setToast({ message: 'Lead assigned successfully', type: 'success' });
      fetchAll();
    } catch (err) {
      setShowAssignConfirm(false);
      setToast({ message: err.response?.data?.message || 'Assign failed', type: 'error' });
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post('/notes', { leadId: id, text: noteText });
      setNoteText('');
      setToast({ message: 'Note added', type: 'success' });
      fetchAll();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to add note', type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${id}`);
      navigate('/leads');
    } catch (err) {
      setShowDeleteConfirm(false);
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  const assignedMember = members.find((m) => m._id === assignEdit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/leads" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={lead.status} />
                {lead.company && <span className="text-gray-400 text-sm">{lead.company}</span>}
              </div>
            </div>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <TrashIcon className="w-4 h-4" /> Delete Lead
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Lead info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Lead Information</h2>
              <div className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{lead.phone}</span>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{lead.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500">Created by <span className="text-gray-700 font-medium">{lead.createdBy?.name}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500">Assigned to <span className="text-gray-700 font-medium">{lead.assignedTo?.name || 'Nobody'}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500">{new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Update status card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h2>
              <select
                value={statusEdit}
                onChange={(e) => setStatusEdit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-3"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
              <button
                onClick={() => setShowStatusConfirm(true)}
                disabled={statusEdit === lead.status}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
              >
                Save Status
              </button>
            </div>

            {/* Assign card (admin only) */}
            {user?.role === 'admin' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Assign To</h2>
                <select
                  value={assignEdit}
                  onChange={(e) => setAssignEdit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-3"
                >
                  <option value="">— Unassigned —</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAssignConfirm(true)}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Save Assignment
                </button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Notes</h2>
              <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n._id} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-800 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {n.userId?.name} · {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity Log</h2>
              {activity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-100" />
                  <div className="space-y-4">
                    {activity.map((a) => (
                      <div key={a._id} className="flex gap-4 relative">
                        <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white ring-1 ring-blue-200 shrink-0 mt-0.5 z-10" />
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium capitalize text-blue-700">{a.action.replace(/_/g, ' ')}</span>
                            {a.detail && <span className="text-gray-500"> — {a.detail}</span>}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {a.userId?.name} · {new Date(a.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Lead"
          message={`Permanently delete "${lead.name}"? All notes and activity will also be removed.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showStatusConfirm && (
        <ConfirmDialog
          title="Update Status"
          message={`Change status from "${lead.status}" to "${statusEdit}"?`}
          confirmLabel="Update"
          onConfirm={handleStatusUpdate}
          onCancel={() => setShowStatusConfirm(false)}
        />
      )}

      {showAssignConfirm && (
        <ConfirmDialog
          title="Assign Lead"
          message={
            assignEdit
              ? `Assign this lead to ${assignedMember?.name || 'selected user'}?`
              : 'Remove assignment from this lead?'
          }
          confirmLabel="Confirm"
          onConfirm={handleAssignUpdate}
          onCancel={() => setShowAssignConfirm(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LeadDetails;
