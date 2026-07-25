
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { milestoneId, successUrl, cancelUrl } = await req.json();

    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*, projects(name, client_id)')
      .eq('id', milestoneId)
      .maybeSingle();

    if (milestoneError || !milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.payment_status === 'paid') {
      throw new Error('This milestone has already been paid');
    }

    if (!milestone.amount || milestone.amount <= 0) {
      throw new Error('No payment amount set for this milestone');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Milestone: ${milestone.title}`,
              description: milestone.description || `Payment for ${milestone.projects?.name || 'Project'} milestone`,
            },
            unit_amount: Math.round(milestone.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/portal/dashboard?payment=success&milestone=${milestoneId}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/portal/dashboard?payment=cancelled`,
      metadata: {
        milestone_id: milestoneId,
        type: 'milestone_payment',
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
