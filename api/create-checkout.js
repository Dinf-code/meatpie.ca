import Stripe from 'stripe';

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
      total,
      customer
    } = body;

    if (!orderId || !quantity || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      customer_email: customer?.email || undefined,

      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Meat Pies Pack',
              description: `${quantity} pies ordered`,
            },
            unit_amount: Math.round(Number(total) * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        orderId,
        quantity: quantity.toString(),
      },

      success_url: `https://meatpieca.vercel.app/success?orderId=${orderId}`,
      cancel_url: `https://meatpieca.vercel.app/cancel`,
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}