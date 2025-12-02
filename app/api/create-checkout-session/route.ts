import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_ENIGMA_AUTH_URL!,
      process.env.NEXT_PUBLIC_ENIGMA_AUTH_ANON_KEY! 
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
    }

    // --- SECURITY UPDATE: Allowed Price IDs ---
    const allowedPrices = [
      process.env.NEXT_PUBLIC_PRICE_ID_OPERATIVE_MONTHLY,
      process.env.NEXT_PUBLIC_PRICE_ID_VANGUARD_MONTHLY, // Updated from yearly
      process.env.NEXT_PUBLIC_PRICE_ID_SPECTER           // New Tier
    ];

    if (!allowedPrices.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid Price ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id, 
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}