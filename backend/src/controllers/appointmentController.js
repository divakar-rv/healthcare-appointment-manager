const { Appointment, DoctorProfile, DoctorLeave, User } = require('../../models');
const { Op } = require('sequelize');
const { sendBookingConfirmation, sendCancellation } = require('../services/email');
const { createCalendarEvent, deleteCalendarEvent } = require('../services/calendar');

exports.bookAppointment = async (req, res) => {
  try {
    const patient_id = req.user.id;
    const { doctor_id, slot_start } = req.body;

    if (!doctor_id || !slot_start) {
      return res.status(400).json({ error: 'doctor_id and slot_start are required' });
    }

    const doctorProfile = await DoctorProfile.findOne({ where: { user_id: doctor_id } });
    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const start = new Date(slot_start);
    const end = new Date(start.getTime() + doctorProfile.slot_duration_minutes * 60000);

    const dateOnly = start.toISOString().split('T')[0];
    const onLeave = await DoctorLeave.findOne({ where: { doctor_id, leave_date: dateOnly } });
    if (onLeave) {
      return res.status(409).json({ error: 'Doctor is on leave on this date' });
    }

    let appointment;
    try {
      appointment = await Appointment.create({
        patient_id,
        doctor_id,
        slot_start: start,
        slot_end: end,
        status: 'booked'
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'This slot was just booked by someone else. Please choose another.' });
      }
      throw err;
    }

    // Send confirmation email — failure here never blocks the booking itself
    try {
      const patient = await User.findByPk(patient_id);
      await sendBookingConfirmation(patient.email, appointment);
    } catch (emailErr) {
      console.error('Booking confirmation email failed:', emailErr.message);
    }

    // Create calendar event for the patient — failure here never blocks the booking
    try {
      const patient = await User.findByPk(patient_id);
      const doctorUser = await User.findByPk(doctor_id);
      const event = await createCalendarEvent(patient, {
        summary: 'Appointment with Dr. ' + (doctorUser ? doctorUser.name : 'your doctor'),
        description: 'Healthcare appointment booked via Healthcare Appointment Manager.',
        startTime: appointment.slot_start,
        endTime: appointment.slot_end
      });
      await appointment.update({ google_event_id: event.id });
    } catch (calErr) {
      console.error('Calendar event creation failed:', calErr.message);
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;
    if (!doctor_id || !date) {
      return res.status(400).json({ error: 'doctor_id and date are required' });
    }

    const doctorProfile = await DoctorProfile.findOne({ where: { user_id: doctor_id } });
    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const onLeave = await DoctorLeave.findOne({ where: { doctor_id, leave_date: date } });
    if (onLeave) {
      return res.json({ available_slots: [], reason: 'Doctor is on leave this date' });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    const hoursRange = doctorProfile.working_hours[dayOfWeek];
    if (!hoursRange) {
      return res.json({ available_slots: [], reason: 'Doctor does not work this day' });
    }

    const [startHour, endHour] = hoursRange.split('-').map(Number);
    const slotMinutes = doctorProfile.slot_duration_minutes;

    const allSlots = [];
    let current = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`);
    const end = new Date(`${date}T${String(endHour).padStart(2, '0')}:00:00`);
    while (current < end) {
      allSlots.push(new Date(current));
      current = new Date(current.getTime() + slotMinutes * 60000);
    }

    const booked = await Appointment.findAll({
      where: {
        doctor_id,
        status: 'booked',
        slot_start: {
          [Op.between]: [
            new Date(`${date}T00:00:00`),
            new Date(`${date}T23:59:59`)
          ]
        }
      }
    });
    const bookedTimes = new Set(booked.map(a => new Date(a.slot_start).getTime()));

    const available = allSlots
      .filter(slot => !bookedTimes.has(slot.getTime()))
      .map(slot => slot.toISOString());

    res.json({ available_slots: available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.patient_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    await appointment.update({ status: 'cancelled' });

    // Send cancellation email — failure here never blocks the cancellation itself
    try {
      const patient = await User.findByPk(appointment.patient_id);
      await sendCancellation(patient.email, appointment);
    } catch (emailErr) {
      console.error('Cancellation email failed:', emailErr.message);
    }

    // Delete the calendar event if one exists — failure here never blocks the cancellation
    try {
      if (appointment.google_event_id) {
        const patient = await User.findByPk(appointment.patient_id);
        await deleteCalendarEvent(patient, appointment.google_event_id);
      }
    } catch (calErr) {
      console.error('Calendar event deletion failed:', calErr.message);
    }

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};