const Activity = require('../models/Activity');

/**
 * Log an activity entry.
 * @param {string} leadId
 * @param {string} userId
 * @param {'created'|'updated'|'assigned'|'status_changed'|'note_added'|'deleted'} action
 * @param {string} [detail]
 */
const logActivity = async (leadId, userId, action, detail = '') => {
  try {
    await Activity.create({ leadId, userId, action, detail });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
