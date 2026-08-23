import { useAuth } from '../AuthContext';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Doctor Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
