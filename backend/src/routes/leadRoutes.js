const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getLeads);
router.get('/:id', protect, getLead);
router.post('/', protect, adminOnly, createLead);
router.put('/:id', protect, updateLead);         // admin full | member status-only (handled in controller)
router.delete('/:id', protect, adminOnly, deleteLead);

module.exports = router;
