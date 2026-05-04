import React, { useState, useEffect } from 'react';
import '../App.css';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import FlipClock from "../components/FlipClock";
import InfoSection from "../components/InfoSection";
import { createCheckoutSession } from "../services/api";


const WEEKLY_MAX_PAID = 90;

// ── App ───────────────────────────────────────────────────────
function App() {
  const [quantity, setQuantity] = useState(3);
  const [expandedSection, setExpandedSection] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [isOpen, setIsOpen] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [remainingPies, setRemainingPies] = useState(WEEKLY_MAX_PAID);
  const [showSummary, setShowSummary] = useState(false);


// Real-time sync with Firebase
useEffect(() => {
  const capacityRef = doc(db, 'config', 'capacity');

  const initAndListen = async () => {
    // Initialize ONLY if it doesn't exist
    await setDoc(
      capacityRef,
      { remainingPies: WEEKLY_MAX_PAID },
      { merge: true }
    );

    const unsubscribe = onSnapshot(capacityRef, (docSnap) => {
      if (docSnap.exists()) {
        setRemainingPies(docSnap.data().remainingPies);
      }
    });

    return unsubscribe;
  };

  let unsubscribe;

  initAndListen().then((unsub) => {
    unsubscribe = unsub;
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);

const [orderForm, setOrderForm] = useState({
  name: '',
  email: '',
  phone: '',
  address: '',
  instructions: ''
});

const [formErrors, setFormErrors] = useState({});

  const packs = quantity / 3;
  const subtotal = packs * 10;
  const hst = subtotal * 0.13;
  const totalWithHST = subtotal + hst;
  const freePies = Math.floor(quantity / 9);
  const totalPiesWithBonus = quantity + freePies;
  const willExceedCapacity = remainingPies !== null && quantity > remainingPies;
  
  const handleCheckout = () => {
  if (!isOpen || willExceedCapacity || remainingPies <= 0) return;
  setShowSummary(true);
};
  
  const handleContinueToPayment = async () => {
  // Validate form
  const errors = {};
  
  if (!orderForm.name.trim()) errors.name = 'Name is required';
  if (!orderForm.email.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(orderForm.email)) errors.email = 'Invalid email address';
  if (!orderForm.phone.trim()) errors.phone = 'Phone number is required';
  if (deliveryMethod === 'delivery' && !orderForm.address.trim()) errors.address = 'Delivery address is required';
  
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  if (quantity > remainingPies) {
  alert('Not enough stock available');
  return;
}
  
setFormErrors({});
  
  try {
    // Create order in Firebase
    const orderData = {
      // Customer info
      name: orderForm.name.trim(),
      email: orderForm.email.trim(),
      phone: orderForm.phone.trim(),
      address: deliveryMethod === 'delivery' ? orderForm.address.trim() : 'Pickup',
      instructions: orderForm.instructions.trim() || 'None',
      
      // Order details
      quantity: quantity,
      freePies: freePies,
      totalPies: totalPiesWithBonus,
      subtotal: subtotal,
      hst: hst,
      total: totalWithHST,
      deliveryMethod: deliveryMethod,
      
      // Metadata
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      paid: false
    };
    
    // Save to Firebase orders collection
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, orderData);
    
    console.log('✅ Order saved to Firebase with ID:', docRef.id);
    
  // Call backend API to create Stripe checkout session
 const data = await createCheckoutSession({
   orderId: docRef.id,
   quantity,
   freePies,
   total: totalWithHST,
   email: orderForm.email,
   deliveryMethod
});
    
    // Redirect to Stripe Checkout
    window.location.href = data.url;
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error submitting order. Please try again.');
  }
};
  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0F1B2D', color: '#F5E6E8', position: 'relative', paddingBottom: '100px', overflowX: 'hidden', boxSizing: 'border-box' }}>

      {/* ── NAV ── */}
      <nav style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(197,148,159,0.2)', gap: '8px' }}>
        {/* Logo - no icon */}
        <h1 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: '700', fontFamily: "'Work Sans', sans-serif", textTransform: 'lowercase', background: 'linear-gradient(135deg, #C5949F 0%, #F4D4DA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
          meatpie.ca
        </h1>

        {/* Flip Clock only */}
        <FlipClock timeString={timeRemaining} isOpen={isOpen} />
      </nav>

      {/* ── HERO ── */}
      <div style={{ maxWidth: '100%', height: 'clamp(380px, 55vw, 500px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#2D4563', backgroundImage: 'url("meatpie_02.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.9) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', maxWidth: '1200px', margin: '0 auto', padding: 'clamp(20px,4vw,40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Orders badge - LEFT aligned */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}> 
            <div style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: isOpen ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)', border: isOpen ? '1px solid #22C55E' : '1px solid #6B7280', borderRadius: '20px', fontSize: 'clamp(10px,2.5vw,12px)', fontWeight: '600', color: isOpen ? '#22C55E' : '#9CA3AF' }}>
              {isOpen ? '● Orders Open' : '● Orders Closed'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'clamp(9px,2vw,12px)', color: '#C5949F', marginBottom: '8px', letterSpacing: '2px' }}>HAND-BAKED COLLECTION</div>
            <h2 style={{ fontSize: 'clamp(28px,8vw,56px)', fontWeight: '700', fontFamily: "'Playfair Display', serif", margin: '0 0 6px 0', lineHeight: '1.1', color: '#F5E6E8' }}>Nigerian Meatpie</h2>
            <h3 style={{ fontSize: 'clamp(16px,5vw,32px)', fontWeight: '700', fontFamily: "'Work Sans', sans-serif", textTransform: 'lowercase', margin: '0', lineHeight: '1.2', color: '#F5E6E8', letterSpacing: '1px' }}>...a taste of home</h3>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '100%', padding: 'clamp(16px,4vw,32px) clamp(12px,4vw,20px)', paddingBottom: '40px' }}>

        {/* Promo Banner */}
        <div style={{ overflow: 'hidden', background: 'linear-gradient(90deg, #C5949F, #B88B95, #D47676, #C5949F)', backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite', borderRadius: '16px', padding: 'clamp(14px,4vw,24px)', marginBottom: '32px', boxShadow: '0 8px 32px rgba(197,148,159,0.5)' }}>
          <div style={{ fontSize: 'clamp(13px,3.5vw,20px)', fontWeight: '700', textAlign: 'center', color: '#0A1628', lineHeight: '1.3' }}>
            🎉 Buy 9 Meatpies, Get 1 FREE! 🎉
          </div>
        </div>

        {/* Quantity */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#F5E6E8' }}>SELECT QUANTITY</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(197,148,159,0.15), rgba(197,148,159,0.05))', borderRadius: '16px', padding: 'clamp(12px,3vw,20px)', border: '2px solid rgba(197,148,159,0.3)' }}>
            <button onClick={() => setQuantity(Math.max(3, quantity - 3))} disabled={quantity <= 3}
              style={{ width: 'clamp(44px,12vw,56px)', height: 'clamp(44px,12vw,56px)', borderRadius: '50%', background: quantity <= 3 ? 'rgba(197,148,159,0.3)' : 'linear-gradient(135deg,#C5949F,#B88B95)', border: 'none', fontSize: 'clamp(20px,6vw,28px)', fontWeight: '700', color: '#0A1628', cursor: quantity <= 3 ? 'not-allowed' : 'pointer', opacity: quantity <= 3 ? 0.5 : 1 }}>−</button>
            <div style={{ fontSize: 'clamp(36px,10vw,48px)', fontWeight: '700', background: 'linear-gradient(135deg,#F5E6E8,#C5949F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{quantity}</div>
            <button onClick={() => setQuantity(quantity + 3)}
              style={{ width: 'clamp(44px,12vw,56px)', height: 'clamp(44px,12vw,56px)', borderRadius: '50%', background: 'linear-gradient(135deg,#C5949F,#B88B95)', border: 'none', fontSize: 'clamp(20px,6vw,28px)', fontWeight: '700', color: '#0A1628', cursor: 'pointer' }}>+</button>
          </div>
        </div>

        {/* Stock indicator - below quantity, above price */}
        <div style={{
          marginBottom: '24px',
          padding: '10px 16px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(197,148,159,0.5)',
          borderRadius: '10px',
          textAlign: 'center',
          color: willExceedCapacity ? '#EF4444' : '#F4D4DA',
          fontSize: 'clamp(12px,3vw,14px)',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          {willExceedCapacity
            ? `Only ${remainingPies} meat pies left in stock!`
            : `${remainingPies} meat pies left in stock!`}
        </div>

        {/* Price Breakdown */}
        <div style={{ background: 'linear-gradient(135deg,#C5949F,#B88B95)', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 24px rgba(197,148,159,0.4)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#0A1628', fontSize: '14px' }}>
            <span>Subtotal ({quantity} pies)</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#0A1628', fontSize: '14px' }}>
            <span>HST (13%)</span><span>${hst.toFixed(2)}</span>
          </div>
          {deliveryMethod === 'delivery' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#0A1628', fontSize: '14px' }}>
              <span>Delivery Fee</span><span>TBD at checkout</span>
            </div>
          )}
          <div style={{ borderTop: '2px solid rgba(10,22,40,0.3)', marginTop: '12px', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#0A1628' }}>TOTAL</span>
              <span style={{ fontSize: 'clamp(24px,6vw,32px)', fontWeight: '700', color: '#0A1628' }}>
                ${deliveryMethod === 'delivery' ? `${totalWithHST.toFixed(2)}+` : totalWithHST.toFixed(2)}
              </span>
            </div>
            {deliveryMethod === 'delivery' && (
              <div style={{ fontSize: '11px', color: 'rgba(10,22,40,0.7)', marginTop: '4px', textAlign: 'right' }}>+ delivery fee based on location</div>
            )}
          </div>
        </div>

        {/* Fulfillment */}
        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#F5E6E8' }}>SELECT FULFILLMENT METHOD</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['pickup', 'delivery'].map(method => (
              <button key={method} onClick={() => setDeliveryMethod(method)}
                style={{ flex: 1, padding: '16px', background: deliveryMethod === method ? 'linear-gradient(135deg,#C5949F,#B88B95)' : 'rgba(197,148,159,0.1)', border: `2px solid ${deliveryMethod === method ? '#C5949F' : 'rgba(197,148,159,0.3)'}`, borderRadius: '12px', cursor: 'pointer', color: deliveryMethod === method ? '#0A1628' : '#F5E6E8', fontWeight: '600', fontSize: '16px' }}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div style={{ marginTop: '24px', backgroundColor: 'rgba(197,148,159,0.1)', border: '1px solid rgba(197,148,159,0.3)', borderRadius: '12px', padding: '16px' }}>
          {deliveryMethod === 'pickup' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(197,148,159,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📍</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#F5E6E8', marginBottom: '4px' }}>Niagara, ON</div>
                  <div style={{ fontSize: '13px', color: '#C5949F' }}>Pickup address provided after order</div>
                </div>
              </div>
              <div style={{ color: '#C5949F', fontSize: '18px' }}>→</div>
            </div>
          ) : (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#F5E6E8' }}>📦 Delivery Information</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#C5949F', lineHeight: '1.5' }}>
                Delivery available <strong>Saturdays & Sundays only</strong>. Reduced rates apply to Niagara, Hamilton, and Markham.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px,2.5vw,13px)', marginBottom: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(197,148,159,0.2)', color: '#F5E6E8' }}>
                    {['Area','Days','Fee'].map((h,i) => (
                      <th key={h} style={{ padding: '10px 8px', textAlign: i===2?'right':'left', fontWeight: '600', borderBottom: '2px solid rgba(197,148,159,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ color: '#C5949F' }}>
                  {[['Niagara Region','Sat/Sun','$5'],['Hamilton','Sat/Sun','$5'],['Markham','Sat/Sun','$15'],['Other GTA','Sat/Sun','Distance-based']].map(([area,days,fee],i,arr) => (
                    <tr key={area}>
                      <td style={{ padding:'10px 8px', borderBottom: i<arr.length-1?'1px solid rgba(197,148,159,0.2)':'none' }}>{area}</td>
                      <td style={{ padding:'10px 8px', borderBottom: i<arr.length-1?'1px solid rgba(197,148,159,0.2)':'none' }}>{days}</td>
                      <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:'600', borderBottom: i<arr.length-1?'1px solid rgba(197,148,159,0.2)':'none' }}>{fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: 0, fontSize: '11px', color: '#C5949F', fontStyle: 'italic' }}>Large orders may qualify for better rates.</p>
            </div>
          )}
        </div>

        {/* Collapsibles - no emojis in header */}
        <div style={{ marginTop: '32px' }}>
          <InfoSection id="ingredients-section" title="Ingredients & Heritage" isOpen={expandedSection==='ingredients'} onToggle={() => setExpandedSection(expandedSection==='ingredients'?null:'ingredients')}>
            <div>
              <p style={{ margin: '0 0 12px 0' }}>Our Nigerian meat pies are made the <strong style={{ color: '#F4D4DA' }}>traditional way</strong> — with a <strong style={{ color: '#F4D4DA' }}>flaky shortcrust pastry</strong> and a rich, savoury filling of minced beef, potatoes, carrots, and onions gently cooked in <strong style={{ color: '#F4D4DA' }}>Nigerian-style flavours</strong>. The filling is <strong style={{ color: '#F4D4DA' }}>cooked first</strong>, so every bite is rich, savoury, properly seasoned — and best enjoyed <strong style={{ color: '#F4D4DA' }}>hot and fresh</strong>.</p>
              <p style={{ margin: '0 0 12px 0' }}>Inspired by my love for meat pies and my mother's homemade recipes, this stays true to its roots with <strong style={{ color: '#F4D4DA' }}>simple, well-chosen ingredients</strong>. <strong style={{ color: '#F4D4DA' }}>Comfort food, done properly.</strong></p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '13px', color: '#B88B95', paddingTop: '12px', borderTop: '1px solid rgba(197,148,159,0.3)' }}>
                <strong style={{ color: '#D4A5A5' }}>Ingredients:</strong> minced beef, potatoes, carrots, onions, lightly curried sauce, flour, salt, sugar, olive margarine, baking powder, evaporated milk, eggs, water.
              </p>
            </div>
          </InfoSection>

          <InfoSection id="nutrition-section" title="Nutrition Facts" isOpen={expandedSection==='nutrition'} onToggle={() => setExpandedSection(expandedSection==='nutrition'?null:'nutrition')}>
            <div>
              <div style={{ backgroundColor: 'rgba(10,22,40,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '2px solid rgba(197,148,159,0.3)' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#F5E6E8' }}>Nutrition Facts</h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#B88B95' }}>Per 1 meat pie (approx. 120g)</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#C5949F' }}>
                <tbody>
                  {[
                    {label:'Calories',value:'330',bold:true,large:true},
                    {label:'Total Fat',value:'20g',bold:true},
                    {label:'Saturated Fat',value:'10g',indent:true},
                    {label:'Carbohydrates',value:'25g',bold:true},
                    {label:'Sugars',value:'2g',indent:true},
                    {label:'Fibre',value:'2g',indent:true},
                    {label:'Protein',value:'12g',bold:true},
                    {label:'Sodium',value:'350mg',bold:true},
                  ].map(({label,value,bold,large,indent},i,arr)=>(
                    <tr key={label} style={{ borderBottom: i<arr.length-1?`${i===0?3:1}px solid rgba(197,148,159,${i===0?0.4:0.2})`:'none' }}>
                      <td style={{ padding: indent?'6px 0 6px 16px':'8px 0', fontWeight: bold?'600':'400', color: bold&&!indent?'#F5E6E8':'#C5949F', fontSize: indent?'12px':'13px' }}>{label}</td>
                      <td style={{ padding: indent?'6px 0':'8px 0', textAlign:'right', fontWeight: bold?'700':'400', fontSize: large?'16px':indent?'12px':'13px', color: large?'#F5E6E8':'#C5949F' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: '12px 0 0 0', fontSize: '10px', fontStyle: 'italic', color: '#B88B95' }}>*Values are estimates and may vary.</p>
            </div>
          </InfoSection>
        </div>
      </div>

      {/* ── CHECKOUT BUTTON ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 'clamp(12px,3vw,20px)', background: 'linear-gradient(to top,#0A1628 80%,transparent)', display: 'flex', justifyContent: 'center' }}>
        <button disabled={!isOpen||willExceedCapacity} onClick={handleCheckout}
          style={{ width: '100%', maxWidth: '100%', padding: 'clamp(14px,3vw,20px)', background: !isOpen||willExceedCapacity?'rgba(107,114,128,0.3)':'linear-gradient(135deg,#C5949F,#B88B95)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: !isOpen||willExceedCapacity?'not-allowed':'pointer', boxShadow: !isOpen||willExceedCapacity?'none':'0 8px 32px rgba(197,148,159,0.5)', color: !isOpen||willExceedCapacity?'#6B7280':'#0A1628', opacity: !isOpen||willExceedCapacity?0.6:1 }}>
          <div style={{ textAlign: 'left' }}>
            <div style= {{ fontSize: 'clamp(10px,2.5vw,12px)', fontWeight: '600', marginBottom: '4px' }}>
              {willExceedCapacity?'CAPACITY REACHED':isOpen?'PROCEED TO PAY':'ORDERS CLOSED'}
            </div>
            <div style={{ fontSize: 'clamp(18px,5vw,24px)', fontWeight: '700' }}>
              ${deliveryMethod==='delivery'?`${totalWithHST.toFixed(2)}+`:totalWithHST.toFixed(2)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(13px,3.5vw,18px)', fontWeight: '700' }}>
            {willExceedCapacity?'Adjust':isOpen?'CHECKOUT':'Opening Soon'} <span>→</span>
          </div>
        </button>
      </div>

      {/* ── ORDER FORM MODAL ── */}
{showSummary && (
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
        <button onClick={()=>setShowSummary(false)} style={{ flex: '1', minWidth: '120px', padding: '14px 24px', borderRadius: '12px', border: '2px solid rgba(197,148,159,0.5)', backgroundColor: 'transparent', color: '#F5E6E8', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          Back
        </button>
        <button onClick={handleContinueToPayment} style={{ flex: '2', minWidth: '160px', padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#C5949F,#B88B95)', color: '#0A1628', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
          Continue to Payment →
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default App;