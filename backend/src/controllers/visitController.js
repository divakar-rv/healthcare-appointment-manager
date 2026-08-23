const { VisitNote, Appointment } = require('../../models');
const { generatePostVisitSummary } = require('../services/llm');

exports.submitVisitNotes = async (req, res) => {
  try {
    const { appointment_id, doctor_notes, prescription } = req.body;
    if (!appointment_id || !doctor_notes) {
      return res.status(400).json({ error: 'appointment_id and doctor_notes are required' });
    }

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized for this appointment' });
    }

    const existing = await VisitNote.findOne({ where: { appointment_id } });
    if (existing) {
      return res.status(409).json({ error: 'Visit notes already submitted for this appointment' });
    }

    const notesForLLM = doctor_notes + (prescription ? ' Prescription: ' + JSON.stringify(prescription) : '');
    const post_visit_summary = await generatePostVisitSummary(notesForLLM);

    const visitNote = await VisitNote.create({
      appointment_id,
      doctor_notes,
      prescription: prescription || {},
      post_visit_summary
    });

    await appointment.update({ status: 'completed' });

    res.status(201).json(visitNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit visit notes' });
  }
};

exports.getVisitNote = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const note = await VisitNote.findOne({ where: { appointment_id } });
    if (!note) {
      return res.status(404).json({ error: 'No visit notes found for this appointment' });
    }
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch visit notes' });
  }
};
