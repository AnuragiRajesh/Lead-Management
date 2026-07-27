const Activity = require('../models/Activity');
const Lead = require('../models/Lead');

// @desc  Get activity log for a lead
// @route GET /api/activity/:leadId
// @access Private
const getActivity = async (req, res) => {
  const { leadId } = req.params;

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (req.user.role === 'member' && String(lead.assignedTo) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to view activity for this lead' });
  }

  const activities = await Activity.find({ leadId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(activities);
};

module.exports = { getActivity };
