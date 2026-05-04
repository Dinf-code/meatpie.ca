import { ChevronDown, ChevronUp } from 'lucide-react';

// ── InfoSection ───────────────────────────────────────────────
const InfoSection = ({ id, title, isOpen, onToggle, children }) => (
  <div style={{ backgroundColor: 'rgba(197,148,159,0.1)', border: '1px solid rgba(197,148,159,0.3)', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden' }}>
    <button onClick={onToggle} aria-expanded={isOpen} aria-controls={id}
      style={{ width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#F5E6E8' }}>
      <span style={{ fontWeight: '600', fontSize: '15px' }}>{title}</span>
      {isOpen ? <ChevronUp size={20} color="#C5949F" /> : <ChevronDown size={20} color="#C5949F" />}
    </button>
    {isOpen && (
      <div id={id} style={{ padding: '0 20px 20px 20px', color: '#C5949F', fontSize: '14px', lineHeight: '1.6' }}>
        {children}
      </div>
    )}
  </div>
);

export default InfoSection;