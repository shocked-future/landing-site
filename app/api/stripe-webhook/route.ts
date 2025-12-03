import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripeAdmin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// This is the "secret" from your Stripe Webhook settings
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = (await headers()).get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // --- Handle Specific Stripe Events ---
  // We are handling the two most important ones:
  // 1. checkout.session.completed: A user *just paid*
  // 2. customer.subscription.updated: A subscription was renewed, canceled, or expired
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // 1. Get metadata we stored during checkout
        const supabase_user_id = session.metadata?.supabase_user_id;
        const stripe_customer_id = session.customer as string;
        const stripe_subscription_id = session.subscription as string;

        if (!supabase_user_id) {
          throw new Error('Webhook Error: Missing supabase_user_id on checkout session.');
        }

        // 2. Get the Price ID to determine the tier
        const lineItem = (await stripe.checkout.sessions.listLineItems(session.id)).data[0];
        const priceId = lineItem.price!.id;

        // 3. Map Price ID to our internal Tier name
        let tier = 'initiate';
        if (priceId === process.env.NEXT_PUBLIC_PRICE_ID_OPERATIVE_MONTHLY) tier = 'operative';
        if (priceId === process.env.NEXT_PUBLIC_PRICE_ID_VANGUARD_MONTHLY) tier = 'vanguard';
        if (priceId === process.env.NEXT_PUBLIC_PRICE_ID_SPECTER) tier = 'specter';

        // 4. Update the user's row in our 'profiles' table
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id,
            stripe_subscription_id,
            subscription_tier: tier,
            subscription_status: 'active', // Payment was successful
          })
          .eq('id', supabase_user_id); // Find the user by their Auth ID

        if (error) throw error;
        
        console.log(`[Stripe Webhook] checkout.session.completed: User ${supabase_user_id} subscribed to ${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // 2. Get the new status (e.g., 'active', 'past_due', 'canceled')
        const status = subscription.status;
        const stripe_subscription_id = subscription.id;

        // 3. Update the 'profiles' table based on the subscription ID
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: status,
            // If they cancel, we can also clear their tier
            subscription_tier: status === 'active' ? undefined : 'initiate', 
          })
          .eq('stripe_subscription_id', stripe_subscription_id); // Find user by sub ID

        if (error) throw error;

        console.log(`[Stripe Webhook] customer.subscription.updated: Sub ${stripe_subscription_id} status updated to ${status}`);
        break;
      }
        
      default:
        // console.warn(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('[Stripe Webhook Error]', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  // 5. Acknowledge the event
  return NextResponse.json({ received: true });
}