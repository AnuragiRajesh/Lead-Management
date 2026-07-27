const Lead = require('../models/Lead');
const logActivity = require('../utils/logActivity');

// @desc  Create a lead
// @route POST /api/leads
// @access Admin
const createLead = async (req, res) => {
  const { name, email, phone, company, status, assignedTo } = req.body;

  if (!name) return res.status(400).json({ message: 'Lead name is required' });

  const lead = await Lead.create({
    name,
    email,
    phone,
    company,
    status,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
  });

  await logActivity(lead._id, req.user._id, 'created', `Lead "${lead.name}" created`);

  res.status(201).json(lead);
};

// @desc  Get all leads (with pagination, search, filters)
// @route GET /api/leads
// @access Private (admin sees all, member sees assigned only)
const getLeads = async (req, res) => {
  const { page = 1, limit = 10, search, status, assignedTo } = req.query;

  const query = {};

  // Members only see leads assigned to them
  if (req.user.role === 'member') {
    query.assignedTo = req.user._id;
  } else {
    // Admin can filter by assignedTo
    if (assignedTo) query.assignedTo = assignedTo;
  }

  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Lead.countDocuments(query);

  const leads = await Lead.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    leads,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

// @desc  Get single lead
// @route GET /api/leads/:id
// @access Private
const getLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  // Members can only view their assigned leads
  if (req.user.role === 'member' && String(lead.assignedTo?._id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to view this lead' });
  }

  res.json(lead);
};

// @desc  Update a lead
// @route PUT /api/leads/:id
// @access Admin (full update) | Member (status only)
const updateLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  // Members can only update status on their assigned leads
  if (req.user.role === 'member') {
    if (String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Members can only update status' });

    const oldStatus = lead.status;
    lead.status = status;
    await lead.save();

    await logActivity(
      lead._id,
      req.user._id,
      'status_changed',
      `Status changed from "${oldStatus}" to "${status}"`
    );

    return res.json(lead);
  }

  // Admin full update
  const { name, email, phone, company, status, assignedTo } = req.body;

  const oldStatus = lead.status;
  const oldAssigned = String(lead.assignedTo);

  if (name) lead.name = name;
  if (email) lead.email = email;
  if (phone) lead.phone = phone;
  if (company) lead.company = company;
  if (status) lead.status = status;
  if (assignedTo !== undefined) lead.assignedTo = assignedTo || null;

  await lead.save();

  if (status && status !== oldStatus) {
    await logActivity(
      lead._id,
      req.user._id,
      'status_changed',
      `Status changed from "${oldStatus}" to "${status}"`
    );
  }

  if (assignedTo !== undefined && String(assignedTo) !== oldAssigned) {
    await logActivity(lead._id, req.user._id, 'assigned', `Lead assigned to user ${assignedTo}`);
  }

  if (name || email || phone || company) {
    await logActivity(lead._id, req.user._id, 'updated', `Lead details updated`);
  }

  res.json(lead);
};

// @desc  Delete a lead
// @route DELETE /api/leads/:id
// @access Admin only
const deleteLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  await logActivity(lead._id, req.user._id, 'deleted', `Lead "${lead.name}" deleted`);
  await lead.deleteOne();

  res.json({ message: 'Lead deleted' });
};

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead };
