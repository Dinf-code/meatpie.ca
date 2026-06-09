import Stripe from 'stripe';
import { db } from "./firebaseAdmin.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const {
      orderId,
      quantity,
      customer,
      email        
    } = body;

    if (!orderId || !quantity) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // ✅ Fetch live inventory from Firestore
    const capacityRef = db.collection("config").doc("capacity");

    const capacityDoc = await capacityRef.get();

    if (!capacityDoc.exists) {
      return res.status(500).json({
        error: "Capacity configuration missing",
      });
    }

    const remainingPies = capacityDoc.data().remainingPies || 0;

    // ✅ Prevent invalid quantities
    if (quantity <= 0) {
      return res.status(400).json({
        error: "Invalid quantity",
      });
    }

    // ✅ Prevent overselling
    if (quantity > remainingPies) {
      return res.status(400).json({
        error: "Not enough pies remaining",
      });
    }

    // ✅ Verify order exists in Firebase
     const orderRef = db.collection("orders").doc(orderId);
     const orderDoc = await orderRef.get();
     if (!orderDoc.exists) {
     return res.status(404).json({ error: "Order not found" });
}

    // ✅ Backend-controlled pricing
    const packs = quantity / 3;
    const subtotal = packs * 1000;        // $10 per pack in cents
    const hst = Math.round(subtotal * 0.13);
    const calculatedTotal = subtotal + hst;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      customer_email: email || undefined,

      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Meat Pies Pack',
              description: `${quantity} pies ordered`,
            },
            unit_amount: calculatedTotal,
          },
          quantity: 1,
        },
      ],

      metadata: {
        orderId,
        quantity: quantity.toString(),
      },

     success_url: `https://meatpie.ca/success?orderId=${orderId}`,
     cancel_url: `https://meatpie.ca/cancel`,
    });

    res.status(200).json({
      url: session.url
    });

  } catch (error) {
    console.error('Stripe error:', error);

    res.status(500).json({
      error: error.message
    });
  }
}