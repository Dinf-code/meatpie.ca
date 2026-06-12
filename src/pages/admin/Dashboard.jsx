import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const STATUS_COLORS = {
  pending_payment: { bg: '#FAEEDA', color: '#633806' },
  paid:            { bg: '#E1F5EE', color: '#085041' },
  preparing:       { bg: '#E6F1FB', color: '#0C447C' },
  ready:           { bg: '#EEEDFE', color: '#3C3489' },
  fulfilled:       { bg: '#F0F0F0', color: '#444444' },
  cancelled:       { bg: '#FEE2E2', color: '#991B1B' },
};

const STATUS_LABELS = {
  pending_payment: 'Pending',
  paid: 'Paid',
  preparing: 'Preparing',
  ready: 'Ready',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all orders
        const ordersSnap = await getDocs(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        );
        const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(allOrders);

        // Fetch capacity
        const capacitySnap = await getDocs(collection(db, 'config'));
        capacitySnap.forEach(doc => {
          if (doc.id === 'capacity') setCapacity(doc.data());
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived stats
  const paidOrders = orders.filter(o => o.status !== 'pending_payment' && o.status !== 'cancelled');
  const revenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const piesSold = paidOrders.reduce((sum, o) => sum + (o.totalPies || 0), 0);
  const recentOrders = orders.slice(0, 5);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5949F', fontSize: '14px' }}>
      Loading…
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(197,148,159,0.15)',
        backgroundColor: '#0A1628',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#F5E6E8' }}>Dashboard</div>
          <div style={{ fontSize: '11px', color: '#C5949F', marginTop: '2px' }}>Overview of your store</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Revenue', value: `$${revenue.toFixed(2)}`, sub: 'all time' },
            { label: 'Orders', value: paidOrders.length, sub: 'paid' },
            { label: 'Pies sold', value: piesSold, sub: 'all time' },
            { label: 'Remaining', value: capacity?.remainingPies ?? '—', sub: 'pies in stock' },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              backgroundColor: '#0A1628',
              border: '1px solid rgba(197,148,159,0.15)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: '11px', color: '#C5949F', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E6E8' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(197,148,159,0.6)', marginTop: '3px' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Two column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Recent orders */}
          <div style={{
            backgroundColor: '#0A1628',
            border: '1px solid rgba(197,148,159,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#F5E6E8', marginBottom: '14px' }}>
              Recent orders
            </div>
            {recentOrders.length === 0 && (
              <div style={{ fontSize: '12px', color: '#C5949F' }}>No orders yet.</div>
            )}
            {recentOrders.map(order => {
              const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending_payment;
              return (
                <div key={order.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(197,148,159,0.1)',
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#F5E6E8' }}>{order.name}</div>
                    <div style={{ fontSize: '11px', color: '#C5949F', marginTop: '2px' }}>
                      {order.totalPies} pies · {order.deliveryMethod} · ${order.total?.toFixed(2)}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: '500',
                    backgroundColor: s.bg,
                    color: s.color,
                  }}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status breakdown */}
          <div style={{
            backgroundColor: '#0A1628',
            border: '1px solid rgba(197,148,159,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#F5E6E8', marginBottom: '14px' }}>
              Order status breakdown
            </div>
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = statusCounts[key] || 0;
              const total = orders.length || 1;
              const pct = Math.round((count / total) * 100);
              const s = STATUS_COLORS[key];
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  <div style={{ fontSize: '11px', color: '#C5949F', width: '70px' }}>{label}</div>
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'rgba(197,148,159,0.15)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: '2px', backgroundColor: s.color }} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: '#F5E6E8', width: '20px', textAlign: 'right' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}