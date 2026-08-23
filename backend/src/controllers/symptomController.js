const { SymptomForm, Appointment } = require('../../models');
const { generatePreVisitSummary } = require('../services/llm');

exports.submitSymptoms = async (req, res) => {
  try {
    const { appointment_id, symptoms_text } = req.body;
    if (!appointment_id || !symptoms_text) {
      return res.status(400).json({ error: 'appointment_id and symptoms_text are required' });
    }

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.patient_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized for this appointment' });
    }
    if (appointment.status !== 'booked') {
      return res.status(400).json({ error: 'Symptoms can only be submitted for booked appointments' });
    }
    const existing = await SymptomForm.findOne({ where: { appointment_id } });
    if (existing) {
      return res.status(409).json({ error: 'Symptom form already submitted for this appointment' });
    }

    const pre_visit_summary = await generatePreVisitSummary(symptoms_text);

    const form = await SymptomForm.create({ appointment_id, symptoms_text, pre_visit_summary });
    res.status(201).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit symptoms' });
  }
};

exports.getSymptomForm = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const form = await SymptomForm.findOne({ where: { appointment_id } });
    if (!form) {
      return res.status(404).json({ error: 'No symptom form found for this appointment' });
    }
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch symptom form' });
  }
};
