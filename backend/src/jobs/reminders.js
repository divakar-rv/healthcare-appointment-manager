const { Notification, User } = require('../../models');
const { sendReminder } = require('../services/email');

const MAX_ATTEMPTS = 3;

// Processes pending/failed notifications and retries sending them
async function processNotifications() {
  try {
    const { Op } = require('sequelize');
    const pending = await Notification.findAll({
      where: {
        status: { [Op.in]: ['pending', 'failed'] },
        attempts: { [Op.lt]: MAX_ATTEMPTS }
      }
    });

    for (const notif of pending) {
      const user = await User.findByPk(notif.user_id);
      if (!user) {
        await notif.update({ status: 'failed', attempts: notif.attempts + 1 });
        continue;
      }

      try {
        const message = buildMessageFromPayload(notif.payload);
        await sendReminder(user.email, message);
        await notif.update({ status: 'sent', attempts: notif.attempts + 1 });
        console.log('Notification ' + notif.id + ' sent to ' + user.email);
      } catch (err) {
        await notif.update({ status: 'failed', attempts: notif.attempts + 1 });
        console.error('Notification ' + notif.id + ' failed (attempt ' + (notif.attempts + 1) + '):', err.message);
      }
    }
  } catch (err) {
    console.error('processNotifications job error:', err.message);
  }
}

function buildMessageFromPayload(payload) {
  if (!payload) return 'You have a reminder from Healthcare Appointment Manager.';
  if (payload.reason === 'doctor_leave') {
    return 'Your doctor is unavailable on ' + payload.leave_date + ' for appointment #' + payload.appointment_id + '. Please contact the clinic to reschedule.';
  }
  if (payload.reason === 'medication') {
    return 'Reminder: take your medication - ' + payload.medication + ' (' + payload.frequency + ').';
  }
  return 'You have a reminder regarding appointment #' + (payload.appointment_id || 'N/A') + '.';
}

module.exports = { processNotifications };
