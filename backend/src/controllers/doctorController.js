const { DoctorProfile, User, DoctorLeave, Appointment, Notification } = require('../../models');

// Admin creates a doctor profile for an existing user with role 'doctor'
exports.createDoctorProfile = async (req, res) => {
  try {
    const { user_id, specialisation, working_hours, slot_duration_minutes } = req.body;
    if (!user_id || !specialisation || !working_hours || !slot_duration_minutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await User.findByPk(user_id);
    if (!user || user.role !== 'doctor') {
      return res.status(400).json({ error: 'user_id must belong to a user with role doctor' });
    }
    const existing = await DoctorProfile.findOne({ where: { user_id } });
    if (existing) {
      return res.status(409).json({ error: 'Doctor profile already exists for this user' });
    }
    const profile = await DoctorProfile.create({ user_id, specialisation, working_hours, slot_duration_minutes });
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create doctor profile' });
  }
};

// List all doctors, optionally filtered by specialisation
exports.listDoctors = async (req, res) => {
  try {
    const { specialisation } = req.query;
    const where = specialisation ? { specialisation } : {};
    const doctors = await DoctorProfile.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Admin updates a doctor profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await DoctorProfile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    const { specialisation, working_hours, slot_duration_minutes } = req.body;
    await profile.update({
      specialisation: specialisation ?? profile.specialisation,
      working_hours: working_hours ?? profile.working_hours,
      slot_duration_minutes: slot_duration_minutes ?? profile.slot_duration_minutes
    });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
};

// Admin marks a doctor on leave; must notify affected patients if bookings exist
exports.markLeave = async (req, res) => {
  try {
    const { doctor_id, leave_date } = req.body;
    if (!doctor_id || !leave_date) {
      return res.status(400).json({ error: 'doctor_id and leave_date are required' });
    }

    const leave = await DoctorLeave.create({ doctor_id, leave_date });

    // Find affected appointments on that date for this doctor
    const startOfDay = new Date(`${leave_date}T00:00:00`);
    const endOfDay = new Date(`${leave_date}T23:59:59`);
    const { Op } = require('sequelize');

    const affected = await Appointment.findAll({
      where: {
        doctor_id,
        status: 'booked',
        slot_start: { [Op.between]: [startOfDay, endOfDay] }
      }
    });

    // Log a notification per affected patient (actual email sending wired up in Phase 6)
    for (const appt of affected) {
      await Notification.create({
        user_id: appt.patient_id,
        type: 'email',
        status: 'pending',
        payload: { reason: 'doctor_leave', appointment_id: appt.id, leave_date },
        attempts: 0
      });
    }

    res.status(201).json({ leave, affected_appointments: affected.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark leave' });
  }
};