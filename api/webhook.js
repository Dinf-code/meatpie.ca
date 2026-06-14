import Stripe from "stripe";
import { db } from "./firebaseAdmin.js";
import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: false, // ❗ required for Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

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
      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        console.error("❌ Order not found");
        return res.status(404).send("Order not found");
      }

      const existingOrder = orderDoc.data();

      // ✅ Prevent duplicate webhook processing
      if (existingOrder.status === "paid") {
        console.log("⚠️ Order already processed");
        return res.status(200).json({ received: true, duplicate: true });
      }

      // ✅ Update order status
      await orderRef.update({
        status: "paid",
        stripeSessionId: session.id,
        processedAt: new Date(),
      });

      // ✅ Reduce inventory safely
      const capacityRef = db.collection("config").doc("capacity");
      await db.runTransaction(async (transaction) => {
        const capacityDoc = await transaction.get(capacityRef);
        const current = capacityDoc.data().remainingPies || 0;
        transaction.update(capacityRef, {
          remainingPies: current - quantity,
        });
      });

      console.log("✅ Firebase updated successfully");

      // ✅ Send confirmation email
      const order = existingOrder;
      const isDelivery = order.deliveryMethod === "delivery";
      const freePiesLine = order.freePies > 0
        ? `<tr>
            <td style="padding:8px 0;color:#C5949F;">Bonus pies</td>
            <td style="padding:8px 0;text-align:right;color:#22C55E;font-weight:600;">+${order.freePies} FREE 🎉</td>
           </tr>`
        : "";

      try {
        await resend.emails.send({
          from: "hello@meatpie.ca",
          to: order.email,
          subject: "Your meatpie.ca order is confirmed!",
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#F5E6E8;letter-spacing:-0.5px;">
        meatpie<span style="color:#C5949F;">.ca</span>
      </h1>
    </div>

    <!-- Success card -->
    <div style="background:#0F1B2D;border:1px solid rgba(197,148,159,0.3);border-radius:16px;padding:32px;margin-bottom:24px;text-align:center;">
      <div style="width:60px;height:60px;border-radius:50%;background:rgba(29,158,117,0.15);border:2px solid #1D9E75;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F5E6E8;">Order Confirmed!</h2>
      <p style="margin:0;font-size:14px;color:#C5949F;line-height:1.5;">
        Hi ${order.name}, your order has been received and payment confirmed. We'll be in touch when your pies are ready.
      </p>
    </div>

    <!-- Order summary -->
    <div style="background:#0F1B2D;border:1px solid rgba(197,148,159,0.3);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#C5949F;text-transform:uppercase;letter-spacing:0.5px;">Order Summary</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#C5949F;border-bottom:1px solid rgba(197,148,159,0.1);">Quantity</td>
          <td style="padding:8px 0;text-align:right;color:#F5E6E8;font-weight:500;border-bottom:1px solid rgba(197,148,159,0.1);">${order.quantity} pies</td>
        </tr>
        ${freePiesLine}
        <tr>
          <td style="padding:8px 0;color:#C5949F;border-bottom:1px solid rgba(197,148,159,0.1);">Total pies</td>
          <td style="padding:8px 0;text-align:right;color:#F5E6E8;font-weight:500;border-bottom:1px solid rgba(197,148,159,0.1);">${order.totalPies} pies</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#C5949F;border-bottom:1px solid rgba(197,148,159,0.1);">Subtotal</td>
          <td style="padding:8px 0;text-align:right;color:#F5E6E8;font-weight:500;border-bottom:1px solid rgba(197,148,159,0.1);">$${order.subtotal?.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#C5949F;border-bottom:1px solid rgba(197,148,159,0.1);">HST (13%)</td>
          <td style="padding:8px 0;text-align:right;color:#F5E6E8;font-weight:500;border-bottom:1px solid rgba(197,148,159,0.1);">$${order.hst?.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;color:#F5E6E8;font-weight:700;font-size:16px;">Total</td>
          <td style="padding:12px 0 0;text-align:right;color:#F5E6E8;font-weight:700;font-size:16px;">$${order.total?.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <!-- Fulfillment -->
    <div style="background:#0F1B2D;border:1px solid rgba(197,148,159,0.3);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#C5949F;text-transform:uppercase;letter-spacing:0.5px;">Fulfillment</h3>
      <p style="margin:0;font-size:14px;color:#F5E6E8;font-weight:500;">
        ${isDelivery ? "📦 Delivery" : "📍 Pickup — Niagara, ON"}
      </p>
      ${isDelivery ? `<p style="margin:8px 0 0;font-size:13px;color:#C5949F;">${order.address}</p>` : `<p style="margin:8px 0 0;font-size:13px;color:#C5949F;">Pickup address will be sent to you shortly.</p>`}
      ${order.instructions && order.instructions !== "None" ? `<p style="margin:12px 0 0;font-size:13px;color:#C5949F;font-style:italic;">"${order.instructions}"</p>` : ""}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;">
      <p style="margin:0;font-size:12px;color:rgba(197,148,159,0.5);">
        Questions? Reply to this email or contact us at hello@meatpie.ca
      </p>
    </div>

  </div>
</body>
</html>
          `,
        });
        console.log("✅ Confirmation email sent to", order.email);
      } catch (emailErr) {
        // Don't fail the webhook if email fails
        console.error("❌ Email send failed:", emailErr.message);
      }
    }
  }

  res.status(200).json({ received: true });
}