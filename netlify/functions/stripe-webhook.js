// Netlify Function: Stripe Webhook Handler
// Place in: netlify/functions/stripe-webhook.js

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // For signature verification, we need the raw body
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const customerId = session.customer;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;

      if (email) {
        // Find the user in Supabase by email using the admin API
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
          console.error('Error listing users:', listError.message);
          throw listError;
        }

        const user = users.find(u => u.email === email);

        if (user) {
          // Update user to Pro tier in their metadata
          const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { tier: 'pro' }
          });

          if (updateError) {
            console.error('Error updating user tier:', updateError.message);
            throw updateError;
          }

          console.log(`Successfully upgraded user ${email} to Pro tier.`);
        } else {
          console.warn(`No user found with email: ${email}`);
        }
      }
    } catch (err) {
      console.error('Error processing checkout.session.completed:', err.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
