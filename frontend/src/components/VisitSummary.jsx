import { useState } from 'react';
import api from '../api';

export default function VisitSummary({ appointmentId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  const loadSummary = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/visits/${appointmentId}`);
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load visit summary');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!visible && !summary) loadSummary();
    setVisible(v => !v);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={toggle}>
        {visible ? 'Hide Visit Summary' : 'View Visit Summary'}
      </button>
      {visible && (
        <div style={{ border: '1px solid #ccc', padding: 12, marginTop: 8 }}>
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          {summary && (
            <>
              <p><strong>Summary:</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{summary.post_visit_summary}</p>
              {summary.prescription && Object.keys(summary.prescription).length > 0 && (
                <>
                  <p><strong>Prescription:</strong></p>
                  <p>
                    {summary.prescription.medication} — {summary.prescription.dosage} — {summary.prescription.frequency}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}