import { useEffect, useState } from 'react';
import api from '../api';
import SymptomForm from './SymptomForm';
import VisitNotesForm from './VisitNotesForm';
import { useAuth } from '../AuthContext';
import VisitSummary from './VisitSummary';
export default function AppointmentsList({ refreshKey }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [openSymptomFor, setOpenSymptomFor] = useState(null);
  const [openVisitNotesFor, setOpenVisitNotesFor] = useState(null);
  const [message, setMessage] = useState('');

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments/mine');
      setAppointments(res.data);
    } catch (err) {
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [refreshKey]);

  const cancelAppointment = async (id) => {
    setMessage('');
    try {
      await api.patch(`/appointments/${id}/cancel`);
      setMessage('Appointment cancelled.');
      loadAppointments();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Cancellation failed');
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>My Appointments</h3>
      {message && <p>{message}</p>}
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        appointments.map(appt => (
          <div key={appt.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 10 }}>
            <p><strong>Date:</strong> {new Date(appt.slot_start).toLocaleString()}</p>
            <p><strong>Status:</strong> {appt.status}</p>

            {appt.status === 'booked' && user?.role === 'patient' && (
              <>
                <button onClick={() => cancelAppointment(appt.id)} style={{ marginRight: 8 }}>Cancel</button>
                <button onClick={() => setOpenSymptomFor(openSymptomFor === appt.id ? null : appt.id)}>
                  {openSymptomFor === appt.id ? 'Close' : 'Submit Symptoms'}
                </button>
              </>
            )}
            {appt.status === 'booked' && user?.role === 'patient' && openSymptomFor === appt.id && (
              <SymptomForm appointmentId={appt.id} onSubmitted={() => setOpenSymptomFor(null)} />
            )}

            {appt.status === 'booked' && user?.role === 'doctor' && (
              <button onClick={() => setOpenVisitNotesFor(openVisitNotesFor === appt.id ? null : appt.id)}>
                {openVisitNotesFor === appt.id ? 'Close' : 'Add Visit Notes'}
              </button>
            )}
            {appt.status === 'booked' && user?.role === 'doctor' && openVisitNotesFor === appt.id && (
              <VisitNotesForm
                appointmentId={appt.id}
                onSubmitted={() => {
                  setOpenVisitNotesFor(null);
                  loadAppointments();
                }}
              />
            )}
            {appt.status === 'completed' && user?.role === 'patient' && (
              <VisitSummary appointmentId={appt.id} />
            )}
          </div>
        ))
      )}
    </div>
  );
}