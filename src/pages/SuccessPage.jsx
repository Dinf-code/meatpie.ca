import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

function SuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderId, ...orderSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0F1B2D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5949F', fontSize: '16px' }}>
        Loading your order...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1B2D', color: '#F5E6E8', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#C5949F', marginBottom: '24px' }}>meatpie.ca</div>

        {/* Icon */}
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>✓</div>

        {/* Heading */}
        <h1 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '6px' }}>
          {order ? `Hi ${order.name.split(' ')[0]}, your order is confirmed!` : 'Order Confirmed!'}
        </h1>
        <p style={{ fontSize: '13px', color: '#C5949F', textAlign: 'center', marginBottom: '16px' }}>
          Your meat pies are on their way to being baked.
        </p>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid #22C55E' }}>
            Payment successful
          </span>
        </div>

        {/* Order Summary */}
        {order && (
          <div style={{ background: 'rgba(197,148,159,0.08)', border: '1px solid rgba(197,148,159,0.25)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: '#C5949F', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>ORDER SUMMARY</div>
            {[
              ['Order ID', `#${order.id.slice(0, 8).toUpperCase()}`],
              ['Quantity', `${order.quantity} meat pies`],
              ['Subtotal', `$${order.subtotal.toFixed(2)}`],
              ['HST (13%)', `$${order.hst.toFixed(2)}`],
              ['Total Paid', `$${order.total.toFixed(2)}`],
              ['Fulfillment', order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(197,148,159,0.15)', fontSize: '14px' }}>
                <span style={{ color: '#C5949F' }}>{label}</span>
                <span style={{ color: '#F5E6E8', fontWeight: '600' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* What Happens Next */}
        <div style={{ background: 'rgba(197,148,159,0.08)', border: '1px solid rgba(197,148,159,0.25)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: '#C5949F', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>WHAT HAPPENS NEXT</div>
          {[
           ['Ready', 'Saturday, 5pm – 10pm EST'],
            ['Pickup', 'Niagara, ON'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(197,148,159,0.15)', fontSize: '14px' }}>
              <span style={{ color: '#C5949F' }}>{label}</span>
              <span style={{ color: '#F5E6E8', fontWeight: '600' }}>{value}</span>
            </div>
          ))}
          <div style={{ fontSize: '12px', color: '#C5949F', marginTop: '10px' }}>
            Exact pickup address will be sent to your email before Saturday.
          </div>
        </div>

        {/* Need Help */}
        <div style={{ background: 'rgba(197,148,159,0.08)', border: '1px solid rgba(197,148,159,0.25)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: '#C5949F', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>NEED HELP?</div>
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

        {/* Button */}
        <button onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg,#C5949F,#B88B95)', color: '#0A1628', marginTop: '6px' }}>
          Back to meatpie.ca
        </button>

      </div>
    </div>
  );
}

export default SuccessPage;
