const Note = require('../models/Note');
const Lead = require('../models/Lead');
const logActivity = require('../utils/logActivity');

// @desc  Add a note to a lead
// @route POST /api/notes
// @access Private (admin + assigned member)
const addNote = async (req, res) => {
  const { leadId, text } = req.body;

  if (!leadId || !text) {
    return res.status(400).json({ message: 'leadId and text are required' });
  }

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  // Members can only add notes to assigned leads
  if (req.user.role === 'member' && String(lead.assignedTo) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to add notes to this lead' });
  }

  const note = await Note.create({ leadId, userId: req.user._id, text });

  await logActivity(leadId, req.user._id, 'note_added', `Note added: "${text.slice(0, 50)}"`);

  res.status(201).json(note);
};

// @desc  Get notes for a lead
// @route GET /api/notes/:leadId
// @access Private (admin + assigned member)
const getNotes = async (req, res) => {
  const { leadId } = req.params;

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (req.user.role === 'member' && String(lead.assignedTo) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to view notes for this lead' });
  }

  const notes = await Note.find({ leadId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(notes);
};

module.exports = { addNote, getNotes };
