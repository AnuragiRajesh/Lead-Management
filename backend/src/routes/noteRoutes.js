const express = require('express');
const router = express.Router();
const { addNote, getNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addNote);
router.get('/:leadId', protect, getNotes);

module.exports = router;
