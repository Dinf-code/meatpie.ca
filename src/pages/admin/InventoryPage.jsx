import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function InventoryPage() {
  const [remainingPies, setRemainingPies] = useState(null);
  const [weeklyCapacity, setWeeklyCapacity] = useState(null);
  const [newRemaining, setNewRemaining] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingRemaining, setSavingRemaining] = useState(false);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null);

  const capacityRef = doc(db, 'config', 'capacity');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(capacityRef);
        if (snap.exists()) {
          const data = snap.data();
          setRemainingPies(data.remainingPies ?? 0);
          setWeeklyCapacity(data.weeklyCapacity ?? 90);
          setNewRemaining(String(data.remainingPies ?? 0));
          setNewCapacity(String(data.weeklyCapacity ?? 90));
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateRemaining = async () => {
    const val = parseInt(newRemaining);
    if (isNaN(val) || val < 0) return showMessage('Enter a valid number', true);
    setSavingRemaining(true);
    try {
      await updateDoc(capacityRef, { remainingPies: val });
      setRemainingPies(val);
      showMessage('Stock updated successfully');
    } catch (err) {
      showMessage('Failed to update stock', true);
    } finally {
      setSavingRemaining(false);
    }
  };

  const handleUpdateCapacity = async () => {
    const val = parseInt(newCapacity);
    if (isNaN(val) || val <= 0) return showMessage('Enter a valid capacity', true);
    setSavingCapacity(true);
    try {
      await updateDoc(capacityRef, { weeklyCapacity: val });
      setWeeklyCapacity(val);
      showMessage('Weekly capacity updated');
    } catch (err) {
      showMessage('Failed to update capacity', true);
    } finally {
      setSavingCapacity(false);
    }
  };

  const handleReset = async () => {
    if (!weeklyCapacity) return;
    setResetting(true);
    try {
      await updateDoc(capacityRef, { remainingPies: weeklyCapacity });
      setRemainingPies(weeklyCapacity);
      setNewRemaining(String(weeklyCapacity));
      showMessage('Inventory reset to full capacity');
    } catch (err) {
      showMessage('Failed to reset inventory', true);
    } finally {
      setResetting(false);
    }
  };

  const pctRemaining = weeklyCapacity ? Math.round((remainingPies / weeklyCapacity) * 100) : 0;
  const barColor = pctRemaining > 50 ? '#1D9E75' : pctRemaining > 20 ? '#EF9F27' : '#EF4444';

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
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#F5E6E8' }}>Inventory</div>
          <div style={{ fontSize: '11px', color: '#C5949F', marginTop: '2px' }}>Manage your weekly stock</div>
        </div>

        {/* Toast message */}
        {message && (
          <div style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: message.isError ? 'rgba(239,68,68,0.15)' : 'rgba(29,158,117,0.15)',
            border: `1px solid ${message.isError ? 'rgba(239,68,68,0.4)' : 'rgba(29,158,117,0.4)'}`,
            color: message.isError ? '#EF4444' : '#1D9E75',
          }}>
            {message.text}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>

        {/* Stock overview */}
        <div style={{
          backgroundColor: '#0A1628',
          border: '1px solid rgba(197,148,159,0.15)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#C5949F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current stock
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#F5E6E8', lineHeight: 1 }}>{remainingPies}</div>
            <div style={{ fontSize: '14px', color: '#C5949F' }}>/ {weeklyCapacity} pies</div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '8px', backgroundColor: 'rgba(197,148,159,0.15)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              width: `${pctRemaining}%`,
              height: '100%',
              borderRadius: '4px',
              backgroundColor: barColor,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#C5949F' }}>{pctRemaining}% remaining</div>
        </div>

        {/* Update remaining stock */}
        <div style={{
          backgroundColor: '#0A1628',
          border: '1px solid rgba(197,148,159,0.15)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#C5949F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Update remaining stock
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={newRemaining}
              onChange={e => setNewRemaining(e.target.value)}
              min="0"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(197,148,159,0.3)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#F5E6E8',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleUpdateRemaining}
              disabled={savingRemaining}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #C5949F, #B88B95)',
                color: '#0A1628',
                fontSize: '13px',
                fontWeight: '700',
                cursor: savingRemaining ? 'not-allowed' : 'pointer',
                opacity: savingRemaining ? 0.7 : 1,
              }}
            >
              {savingRemaining ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Weekly capacity */}
        <div style={{
          backgroundColor: '#0A1628',
          border: '1px solid rgba(197,148,159,0.15)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#C5949F', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Weekly capacity
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(197,148,159,0.6)', marginBottom: '16px' }}>
            This is the number the reset button restores to
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={newCapacity}
              onChange={e => setNewCapacity(e.target.value)}
              min="1"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(197,148,159,0.3)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#F5E6E8',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleUpdateCapacity}
              disabled={savingCapacity}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #C5949F, #B88B95)',
                color: '#0A1628',
                fontSize: '13px',
                fontWeight: '700',
                cursor: savingCapacity ? 'not-allowed' : 'pointer',
                opacity: savingCapacity ? 0.7 : 1,
              }}
            >
              {savingCapacity ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Reset button */}
        <div style={{
          backgroundColor: '#0A1628',
          border: '1px solid rgba(197,148,159,0.15)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#C5949F', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Reset weekly inventory
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(197,148,159,0.6)', marginBottom: '16px' }}>
            Sets remaining pies back to {weeklyCapacity}. Do this at the start of each week.
          </div>
          <button
            onClick={handleReset}
            disabled={resetting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(197,148,159,0.4)',
              backgroundColor: 'transparent',
              color: '#F5E6E8',
              fontSize: '13px',
              fontWeight: '600',
              cursor: resetting ? 'not-allowed' : 'pointer',
              opacity: resetting ? 0.7 : 1,
            }}
          >
            {resetting ? 'Resetting…' : `Reset to ${weeklyCapacity} pies`}
          </button>
        </div>
      </div>
    </div>
  );
}