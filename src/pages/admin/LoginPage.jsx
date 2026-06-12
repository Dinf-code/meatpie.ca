import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — skip the login page entirely
  if (user) return <Navigate to="/admin" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin'); // success → dashboard
    } catch (err) {
      // Firebase error codes → human-readable messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F1B2D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(197,148,159,0.08)',
        border: '1px solid rgba(197,148,159,0.25)',
        borderRadius: '16px',
        padding: '40px 32px',
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '22px',
          fontWeight: '700',
          fontFamily: "'Work Sans', sans-serif",
          color: '#F5E6E8',
        }}>
          meatpie.ca
        </h1>
        <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: '#C5949F' }}>
          Admin login
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#C5949F', marginBottom: '6px', letterSpacing: '0.5px' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(197,148,159,0.3)',
                borderRadius: '10px',
                color: '#F5E6E8',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#C5949F', marginBottom: '6px', letterSpacing: '0.5px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(197,148,159,0.3)',
                borderRadius: '10px',
                color: '#F5E6E8',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Inline error — no alert() */}
          {error && (
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#EF4444' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(197,148,159,0.3)' : 'linear-gradient(135deg, #C5949F, #B88B95)',
              border: 'none',
              borderRadius: '10px',
              color: '#0A1628',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}