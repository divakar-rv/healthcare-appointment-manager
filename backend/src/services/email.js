const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (SENDGRID_API_KEY && SENDGRID_API_KEY !== 'leave-blank-for-now') {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

async function sendEmail(to, subject, text, html) {
  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'leave-blank-for-now') {
    console.warn('SENDGRID_API_KEY not configured — skipping email send to ' + to);
    return { skipped: true };
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject,
    text,
    html: html || text
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (err) {
    console.error('Email send failed:', err.response ? err.response.body : err.message);
    throw err;
  }
}

exports.sendBookingConfirmation = async (toEmail, appointment) => {
  const subject = 'Appointment Confirmed';
  const text = 'Your appointment is confirmed for ' + new Date(appointment.slot_start).toLocaleString() + '.';
  return sendEmail(toEmail, subject, text);
};

exports.sendReminder = async (toEmail, message) => {
  const subject = 'Appointment / Medication Reminder';
  return sendEmail(toEmail, subject, message);
};

exports.sendCancellation = async (toEmail, appointment) => {
  const subject = 'Appointment Cancelled';
  const text = 'Your appointment scheduled for ' + new Date(appointment.slot_start).toLocaleString() + ' has been cancelled.';
  return sendEmail(toEmail, subject, text);
};

exports.sendLeaveNotice = async (toEmail, leaveDate) => {
  const subject = 'Doctor Unavailable — Appointment Affected';
  const text = 'Your doctor has been marked on leave for ' + leaveDate + '. Please contact the clinic to reschedule.';
  return sendEmail(toEmail, subject, text);
};
