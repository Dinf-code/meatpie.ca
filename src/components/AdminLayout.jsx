import { NavLink, Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '⊞' },
    { to: '/admin/orders', label: 'Orders', icon: '☰' },
    { to: '/admin/inventory', label: 'Inventory', icon: '◫' },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: "'Work Sans', sans-serif",
      backgroundColor: '#0F1B2D',
    }}>
      <div style={{
        width: '200px',
        minWidth: '200px',
        backgroundColor: '#0A1628',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(197,148,159,0.15)',
      }}>
        <div style={{
          padding: '24px 20px',
          fontSize: '16px',
          fontWeight: '700',
          color: '#F5E6E8',
          borderBottom: '1px solid rgba(197,148,159,0.15)',
        }}>
          meatpie<span style={{ color: '#C5949F' }}>.ca</span>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 20px',
                fontSize: '13px',
                fontWeight: '500',
                color: isActive ? '#F5E6E8' : 'rgba(245,230,232,0.5)',
                backgroundColor: isActive ? 'rgba(197,148,159,0.1)' : 'transparent',
                borderLeft: isActive ? '2px solid #C5949F' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <span style={{ fontSize: '16px' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: '12px 0',
          borderTop: '1px solid rgba(197,148,159,0.15)',
        }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 20px',
              width: '100%',
              fontSize: '13px',
              fontWeight: '500',
              color: 'rgba(245,230,232,0.5)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '16px' }}>→</span>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#111F33' }}>
        <Outlet />
      </div>
    </div>
  );
}