import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const STATUSES = ['pending_payment', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled'];

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

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        );
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusSave = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), { status: newStatus });
      // Update local state so UI reflects change immediately
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSaving(false);
    }
  };

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
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#F5E6E8' }}>Orders</div>
          <div style={{ fontSize: '11px', color: '#C5949F', marginTop: '2px' }}>Click any row to view details</div>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(197,148,159,0.3)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#F5E6E8',
            fontSize: '12px',
            width: '220px',
            outline: 'none',
          }}
        />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <div style={{ color: '#C5949F', fontSize: '13px' }}>Loading orders…</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: '#C5949F', fontSize: '13px' }}>No orders found.</div>
          ) : (
            <div style={{
              backgroundColor: '#0A1628',
              border: '1px solid rgba(197,148,159,0.15)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(197,148,159,0.07)' }}>
                    {['Customer', 'Date', 'Qty', 'Total', 'Method', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#C5949F',
                        borderBottom: '1px solid rgba(197,148,159,0.15)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending_payment;
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleRowClick(order)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(197,148,159,0.1)' : 'transparent',
                          borderLeft: isSelected ? '2px solid #C5949F' : '2px solid transparent',
                        }}
                      >
                        <td style={{ padding: '11px 14px', color: '#F5E6E8', fontWeight: '500', borderBottom: '1px solid rgba(197,148,159,0.08)' }}>{order.name}</td>
                        <td style={{ padding: '11px 14px', color: '#C5949F', borderBottom: '1px solid rgba(197,148,159,0.08)' }}>{formatDate(order.createdAt)}</td>
                        <td style={{ padding: '11px 14px', color: '#F5E6E8', borderBottom: '1px solid rgba(197,148,159,0.08)' }}>{order.quantity}</td>
                        <td style={{ padding: '11px 14px', color: '#F5E6E8', borderBottom: '1px solid rgba(197,148,159,0.08)' }}>${order.total?.toFixed(2)}</td>
                        <td style={{ padding: '11px 14px', color: '#F5E6E8', borderBottom: '1px solid rgba(197,148,159,0.08)', textTransform: 'capitalize' }}>{order.deliveryMethod}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(197,148,159,0.08)' }}>
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drawer */}
        {selectedOrder && (
          <div style={{
            width: '300px',
            minWidth: '300px',
            backgroundColor: '#0A1628',
            borderLeft: '1px solid rgba(197,148,159,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Drawer header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(197,148,159,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#F5E6E8' }}>{selectedOrder.name}</div>
                <div style={{ fontSize: '11px', color: '#C5949F', marginTop: '2px' }}>Order · {formatDate(selectedOrder.createdAt)}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid rgba(197,148,159,0.3)',
                backgroundColor: 'transparent', color: '#C5949F',
                cursor: 'pointer', fontSize: '16px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            {/* Drawer body */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Customer info */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: '600', color: '#C5949F', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Customer</div>
                <div style={{
                  backgroundColor: 'rgba(197,148,159,0.07)',
                  border: '1px solid rgba(197,148,159,0.15)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}>
                  {[
                    { label: 'Email', value: selectedOrder.email },
                    { label: 'Phone', value: selectedOrder.phone },
                    { label: 'Method', value: selectedOrder.deliveryMethod, capitalize: true },
                    ...(selectedOrder.deliveryMethod === 'delivery' ? [{ label: 'Address', value: selectedOrder.address }] : []),
                  ].map(({ label, value, capitalize }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 0', borderBottom: '1px solid rgba(197,148,159,0.1)',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: '#C5949F' }}>{label}</span>
                      <span style={{ color: '#F5E6E8', fontWeight: '500', textTransform: capitalize ? 'capitalize' : 'none', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: '600', color: '#C5949F', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Order summary</div>
                <div style={{
                  backgroundColor: 'rgba(197,148,159,0.07)',
                  border: '1px solid rgba(197,148,159,0.15)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}>
                  {[
                    { label: 'Quantity', value: `${selectedOrder.quantity} pies` },
                    { label: 'Free pies', value: `${selectedOrder.freePies} bonus` },
                    { label: 'Total pies', value: `${selectedOrder.totalPies} pies` },
                    { label: 'Subtotal', value: `$${selectedOrder.subtotal?.toFixed(2)}` },
                    { label: 'HST', value: `$${selectedOrder.hst?.toFixed(2)}` },
                    { label: 'Total', value: `$${selectedOrder.total?.toFixed(2)}`, bold: true },
                  ].map(({ label, value, bold }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 0', borderBottom: '1px solid rgba(197,148,159,0.1)',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: '#C5949F', fontWeight: bold ? '600' : '400' }}>{label}</span>
                      <span style={{ color: '#F5E6E8', fontWeight: bold ? '700' : '500' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {selectedOrder.instructions && selectedOrder.instructions !== 'None' && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#C5949F', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Instructions</div>
                  <div style={{
                    backgroundColor: 'rgba(197,148,159,0.07)',
                    border: '1px solid rgba(197,148,159,0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#C5949F',
                    fontStyle: 'italic',
                    lineHeight: '1.5',
                  }}>
                    "{selectedOrder.instructions}"
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer — status update */}
            <div style={{
              padding: '14px 16px',
              borderTop: '1px solid rgba(197,148,159,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#C5949F', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Update status</div>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                style={{
                  width: '100%', padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(197,148,159,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#F5E6E8', fontSize: '12px', outline: 'none',
                }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} style={{ backgroundColor: '#0A1628' }}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusSave}
                disabled={saving || newStatus === selectedOrder.status}
                style={{
                  width: '100%', padding: '10px',
                  borderRadius: '8px', border: 'none',
                  background: saving || newStatus === selectedOrder.status
                    ? 'rgba(197,148,159,0.3)'
                    : 'linear-gradient(135deg, #C5949F, #B88B95)',
                  color: '#0A1628', fontSize: '13px', fontWeight: '700',
                  cursor: saving || newStatus === selectedOrder.status ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Save status'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}