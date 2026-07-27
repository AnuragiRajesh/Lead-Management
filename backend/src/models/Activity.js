const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'assigned', 'status_changed', 'note_added', 'deleted'],
      required: true,
    },
    detail: { type: String, default: '' }, // optional human-readable detail
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
