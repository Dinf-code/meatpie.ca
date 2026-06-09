import { useNavigate } from 'react-router-dom';

function CancelPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1B2D', color: '#F5E6E8', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#C5949F', marginBottom: '24px' }}>meatpie.ca</div>

        {/* Icon */}
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>✕</div>

        {/* Heading */}
        <h1 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '6px' }}>Payment Cancelled</h1>
        <p style={{ fontSize: '13px', color: '#C5949F', textAlign: 'center', marginBottom: '16px' }}>
          No worries — nothing was charged to your card.
        </p>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid #EF4444' }}>
            No payment taken
          </span>
        </div>

        {/* Cart Still Waiting */}
        <div style={{ background: 'rgba(197,148,159,0.08)', border: '1px solid rgba(197,148,159,0.25)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: '#C5949F', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>YOUR CART IS STILL WAITING</div>
          {[
            ['3 meat pies', '$11.30'],
            ['6 meat pies', '$22.60'],
            ['9 meat pies + 1 FREE', '$33.90'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(197,148,159,0.15)', fontSize: '14px' }}>
              <span style={{ color: '#C5949F' }}>{label}</span>
              <span style={{ color: '#F5E6E8', fontWeight: '600' }}>{value}</span>
            </div>
          ))}
          <div style={{ fontSize: '12px', color: '#C5949F', marginTop: '10px' }}>
            Orders open Monday to Thursday (EST). Ready every Saturday 5pm – 10pm EST.
          </div>
        </div>

        {/* Having Trouble */}
        <div style={{ background: 'rgba(197,148,159,0.08)', border: '1px solid rgba(197,148,159,0.25)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: '#C5949F', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>HAVING TROUBLE?</div>
          {[
            ['Email', 'onuchukwudinachi5@gmail.com'],
            ['Phone', '+1 437 239 8050'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(197,148,159,0.15)', fontSize: '14px' }}>
              <span style={{ color: '#C5949F' }}>{label}</span>
              <span style={{ color: '#F5E6E8', fontWeight: '600' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg,#C5949F,#B88B95)', color: '#0A1628', marginTop: '6px' }}>
          Return to Order
        </button>
        <button onClick={() => window.location.href = 'mailto:onuchukwudinachi5@gmail.com'} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(197,148,159,0.5)', fontSize: '15px', fontWeight: '700', cursor: 'pointer', background: 'transparent', color: '#F5E6E8', marginTop: '10px' }}>
          Contact Us
        </button>

      </div>
    </div>
  );
}

export default CancelPage;