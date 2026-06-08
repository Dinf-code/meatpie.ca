function OrderModal({
  showSummary,
  setShowSummary,
  quantity,
  totalWithHST,
  freePies,
  deliveryMethod,
  orderForm,
  setOrderForm,
  formErrors,
  handleContinueToPayment,
  isLoading
}) {
  if (!showSummary) return null;

  return (
    <>
    {/* ── ORDER FORM MODAL ── */}

  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)', padding: '20px', overflowY: 'auto' }} onClick={() => setShowSummary(false)}>
    <div onClick={e=>e.stopPropagation()} style={{ backgroundColor: '#0F1B2D', borderRadius: '20px', padding: 'clamp(24px,6vw,32px)', maxWidth: '500px', width: '100%', border: '2px solid #C5949F', boxShadow: '0 20px 60px rgba(197,148,159,0.5)', color: '#F5E6E8', maxHeight: '90vh', overflowY: 'auto' }}>
      
      {/* Header */}
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: 'clamp(22px,5vw,28px)', fontWeight: '700', background: 'linear-gradient(135deg,#C5949F,#F4D4DA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
        Complete Your Order
      </h3>

      {/* Order Summary */}
      <div style={{ backgroundColor: 'rgba(197,148,159,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(197,148,159,0.3)' }}>
        <div style={{ fontSize: '14px', color: '#C5949F', marginBottom: '8px' }}>Order Summary</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '15px' }}>{quantity} meat pies</span>
          <span style={{ fontSize: '15px', fontWeight: '600' }}>${totalWithHST.toFixed(2)}</span>
        </div>
        {freePies > 0 && (
          <div style={{ fontSize: '13px', color: '#22C55E', marginTop: '8px' }}>
            🎉 +{freePies} bonus pie{freePies > 1 ? 's' : ''} FREE!
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#C5949F', marginTop: '8px' }}>
          {deliveryMethod === 'pickup' ? '📍 Pickup in Niagara' : '📦 Delivery'}
        </div>
      </div>

      {/* Form */}
      <div style={{ marginBottom: '24px' }}>
        {/* Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#F5E6E8' }}>Full Name *</label>
          <input
            type="text"
            value={orderForm.name}
            onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
            placeholder="John Doe"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: formErrors.name ? '2px solid #EF4444' : '1px solid rgba(197,148,159,0.3)', backgroundColor: 'rgba(197,148,159,0.05)', color: '#F5E6E8', fontSize: '14px', outline: 'none' }}
          />
          {formErrors.name && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.name}</div>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#F5E6E8' }}>Email *</label>
          <input
            type="email"
            value={orderForm.email}
            onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
            placeholder="john@example.com"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: formErrors.email ? '2px solid #EF4444' : '1px solid rgba(197,148,159,0.3)', backgroundColor: 'rgba(197,148,159,0.05)', color: '#F5E6E8', fontSize: '14px', outline: 'none' }}
          />
          {formErrors.email && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.email}</div>}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#F5E6E8' }}>Phone Number *</label>
          <input
            type="tel"
            value={orderForm.phone}
            onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
            placeholder="(416) 555-0123"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: formErrors.phone ? '2px solid #EF4444' : '1px solid rgba(197,148,159,0.3)', backgroundColor: 'rgba(197,148,159,0.05)', color: '#F5E6E8', fontSize: '14px', outline: 'none' }}
          />
          {formErrors.phone && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.phone}</div>}
        </div>

        {/* Address (only for delivery) */}
        {deliveryMethod === 'delivery' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#F5E6E8' }}>Delivery Address *</label>
            <textarea
              value={orderForm.address}
              onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
              placeholder="123 Main St, Hamilton, ON L8P 1A1"
              rows="3"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: formErrors.address ? '2px solid #EF4444' : '1px solid rgba(197,148,159,0.3)', backgroundColor: 'rgba(197,148,159,0.05)', color: '#F5E6E8', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {formErrors.address && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.address}</div>}
          </div>
        )}

        {/* Special Instructions */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#F5E6E8' }}>Special Instructions (Optional)</label>
          <textarea
            value={orderForm.instructions}
            onChange={(e) => setOrderForm({...orderForm, instructions: e.target.value})}
            placeholder="Any special requests or delivery notes..."
            rows="2"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(197,148,159,0.3)', backgroundColor: 'rgba(197,148,159,0.05)', color: '#F5E6E8', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={()=>setShowSummary(false)} style={{ flex: '1', minWidth: '120px', padding: '14px 24px', borderRadius: '12px', border: '2px solid rgba(197,148,159,0.5)', backgroundColor: 'transparent', color: '#F5E6E8', fontSize: '14px', fontWeight: '600' }}>
          Back
        </button>
        <button onClick={handleContinueToPayment}
          disabled={isLoading}
          style={{ flex: '2', minWidth: '160px', padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#C5949F,#B88B95)', color: '#0A1628', cursor: 'pointer', fontSize: '14px', fontWeight: '700', opacity: isLoading ? 0.7 : 1,
cursor: isLoading ? 'not-allowed' : 'pointer'}}>
          {isLoading ? 'Redirecting...' : 'Continue to Payment →'}
        </button>
      </div>
    </div>
  </div>

</>
  );
}

export default OrderModal;