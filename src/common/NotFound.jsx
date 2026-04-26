import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="data-card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2>Page Not Found</h2>
      <p style={{ color: '#64748b', margin: '1rem 0 1.5rem' }}>
        The page you requested does not exist or you do not have access.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Go To Dashboard
      </button>
    </div>
  );
}
