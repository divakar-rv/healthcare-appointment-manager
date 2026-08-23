import { useState } from 'react';
import api from '../api';

export default function SymptomForm({ appointmentId, onSubmitted }) {
  const [symptoms, setSymptoms] = useState('');
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/symptoms', { appointment_id: appointmentId, symptoms_text: symptoms });
      setSummary(res.data.pre_visit_summary);
      setMessage('Symptoms submitted.');
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, marginTop: 12 }}>
      <h4>Submit Symptoms for Appointment #{appointmentId}</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms..."
          required
          rows={4}
          style={{ width: '100%', padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '6px 14px' }}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {message && <p>{message}</p>}
      {summary && (
        <div style={{ marginTop: 10, background: '#f5f5f5', padding: 10 }}>
          <p><strong>Urgency:</strong> {summary.urgency_level}</p>
          <p><strong>Chief complaint:</strong> {summary.chief_complaint}</p>
          {summary.suggested_questions?.length > 0 && (
            <div>
              <strong>Suggested questions:</strong>
              <ul>
                {summary.suggested_questions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
