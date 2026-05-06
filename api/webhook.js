import Stripe from "stripe";
import { db } from "./firebaseAdmin.js";

export const config = {
  api: {
    bodyParser: false, // ❗ required for Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔥 Webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

const orderId = session.metadata?.orderId;
const quantity = Number(session.metadata?.quantity || 0);

if (orderId) {
  await db.collection("orders").doc(orderId).update({
    paymentStatus: "paid",
    stripeSessionId: session.id,
  });

  const capacityRef = db.collection("config").doc("capacity");

  await db.runTransaction(async (transaction) => {
    const capacityDoc = await transaction.get(capacityRef);

    const current = capacityDoc.data().remainingPies || 0;

    transaction.update(capacityRef, {
      remainingPies: current - quantity,
    });
  });

  console.log("✅ Firebase updated successfully");
}
  }

  res.status(200).json({ received: true });
}