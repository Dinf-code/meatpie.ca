import Stripe from "stripe";

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

    console.log("✅ Payment successful:", {
      sessionId: session.id,
      orderId: session.metadata?.orderId,
    });

    // 👉 THIS is where you update Firebase
  }

  res.status(200).json({ received: true });
}