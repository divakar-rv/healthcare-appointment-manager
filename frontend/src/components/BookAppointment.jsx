import { useState } from 'react';
import api from '../api';

export default function BookAppointment({ onBooked }) {
  const [specialisation, setSpecialisation] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');

  const searchDoctors = async () => {
    setMessage('');
    try {
      const res = await api.get('/doctors', { params: specialisation ? { specialisation } : {} });
      setDoctors(res.data);
    } catch (err) {
      setMessage('Failed to load doctors');
    }
  };

  const loadSlots = async (doctor) => {
    setSelectedDoctor(doctor);
    setSlots([]);
    if (!date) return;
    try {
      const res = await api.get('/appointments/slots', { params: { doctor_id: doctor.user_id, date } });
      setSlots(res.data.available_slots || []);
      if (res.data.reason) setMessage(res.data.reason);
      else setMessage('');
    } catch (err) {
      setMessage('Failed to load slots');
    }
  };

  const bookSlot = async (slot) => {
    setMessage('');
    try {
      await api.post('/appointments', { doctor_id: selectedDoctor.user_id, slot_start: slot });
      setMessage('Appointment booked successfully!');
      setSlots([]);
      if (onBooked) onBooked();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 20, marginTop: 20 }}>
      <h3>Book an Appointment</h3>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Specialisation (optional)"
          value={specialisation}
          onChange={e => setSpecialisation(e.target.value)}
          style={{ padding: 6, marginRight: 8 }}
        />
        <button onClick={searchDoctors}>Search Doctors</button>
      </div>

      {doctors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h4>Doctors</h4>
          {doctors.map(doc => (
            <div key={doc.id} style={{ padding: 8, border: selectedDoctor?.id === doc.id ? '2px solid blue' : '1px solid #ddd', marginBottom: 6, cursor: 'pointer' }}
                 onClick={() => setSelectedDoctor(doc)}>
              <strong>{doc.User?.name}</strong> — {doc.specialisation}
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div style={{ marginBottom: 12 }}>
          <label>Date: </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: 6, marginRight: 8 }} />
          <button onClick={() => loadSlots(selectedDoctor)}>Check Availability</button>
        </div>
      )}

      {slots.length > 0 && (
        <div>
          <h4>Available Slots</h4>
          {slots.map(slot => (
            <button key={slot} onClick={() => bookSlot(slot)} style={{ margin: 4, padding: 6 }}>
              {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
      )}

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
