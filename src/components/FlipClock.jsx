// ── Flip Clock Digit ──────────────────────────────────────────
const FlipDigit = ({ digit }) => (
  <div style={{
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1628',
    borderRadius: '6px',
    width: 'clamp(22px, 5vw, 30px)',
    height: 'clamp(30px, 6vw, 38px)',
    fontSize: 'clamp(16px, 4vw, 22px)',
    fontWeight: '700',
    color: '#F5E6E8',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(197,148,159,0.3)',
  }}>
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '50%',
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderBottom: '1px solid rgba(0,0,0,0.3)',
    }} />
    <span style={{ position: 'relative', zIndex: 1, lineHeight: 1 }}>{digit}</span>
  </div>
);

// ── Flip Clock Group ──────────────────────────────────────────

const FlipGroup = ({ value, label }) => {
  const padded = String(value).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        <FlipDigit digit={padded[0]} />
        <FlipDigit digit={padded[1]} />
      </div>
      <span style={{ fontSize: 'clamp(6px, 1.5vw, 8px)', color: '#C5949F', fontWeight: '600', letterSpacing: '1px' }}>
        {label}
      </span>
    </div>
  );
};

// ── Flip Clock ──────────────────────────────────────────
const FlipClock = ({ timeString, isOpen }) => {
  if (!isOpen) {
    return (
      <div style={{
        padding: '6px 10px',
        backgroundColor: 'rgba(107,114,128,0.15)',
        borderRadius: '8px',
        border: '2px solid rgba(107,114,128,0.3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', fontWeight: '700', color: '#6B7280', whiteSpace: 'nowrap' }}>ORDERS CLOSED</div>
        <div style={{ fontSize: '8px', color: '#9CA3AF', fontWeight: '600', marginBottom: '2px' }}><strong style={{ color: '#F4D4DA' }}>Orders Open Monday, 00:00 EST</strong></div>
      </div>
    );
  }

  const parts = timeString.split(':');
  const hours = parseInt(parts[0] || 0);
  const minutes = parseInt(parts[1] || 0);
  const seconds = parseInt(parts[2] || 0);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(3px, 1vw, 6px)' }}>
      <FlipGroup value={hours} label="HRS" />
      <div style={{ color: '#C5949F', fontWeight: '700', fontSize: 'clamp(14px, 3vw, 20px)', marginTop: '2px', lineHeight: 1 }}>:</div>
      <FlipGroup value={minutes} label="MIN" />
      <div style={{ color: '#C5949F', fontWeight: '700', fontSize: 'clamp(14px, 3vw, 20px)', marginTop: '2px', lineHeight: 1 }}>:</div>
      <FlipGroup value={seconds} label="SEC" />
    </div>
  );
};

export default FlipClock;