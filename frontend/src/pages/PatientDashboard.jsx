import { useState } from 'react';
import { useAuth } from '../AuthContext';
import BookAppointment from '../components/BookAppointment';
import AppointmentsList from '../components/AppointmentsList';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Patient Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>

      <BookAppointment onBooked={() => setRefreshKey(k => k + 1)} />
      <AppointmentsList refreshKey={refreshKey} />
    </div>
  );
}