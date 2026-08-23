import { useState } from 'react';
import api from '../api';

export default function VisitNotesForm({ appointmentId, onSubmitted }) {
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      const prescription = medication
        ? { medication, dosage, frequency }
        : {};
      await api.post('/visits', {
        appointment_id: appointmentId,
        doctor_notes: doctorNotes,
        prescription
      });
      setMessage('Visit notes submitted.');
      onSubmitted?.();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit visit notes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 12, marginTop: 8 }}>
      <h4>Add Visit Notes for Appointment #{appointmentId}</h4>
      {message && <p>{message}</p>}
      <div>
        <label>Doctor Notes:</label><br />
        <textarea
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          required
          rows={4}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Medication (optional):</label><br />
        <input value={medication} onChange={(e) => setMedication(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Dosage:</label><br />
        <input value={dosage} onChange={(e) => setDosage(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Frequency:</label><br />
        <input value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. twice daily" />
      </div>
      <button type="submit" disabled={submitting} style={{ marginTop: 12 }}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}