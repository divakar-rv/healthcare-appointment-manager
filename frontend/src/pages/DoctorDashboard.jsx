import { useAuth } from '../AuthContext';
import AppointmentsList from '../components/AppointmentsList';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Doctor Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>

      <AppointmentsList refreshKey={0} />
    </div>
  );
}