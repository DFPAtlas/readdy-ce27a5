
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "your-email@example.com";

async function sendPaymentNotification(paymentDetails: {
  type: string;
  amount: number;
  currency: string;
  customerEmail: string;
  description: string;
  invoiceId?: string;
  milestoneId?: string;
}) {
  if (!RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email notification");
    return;
  }

  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: paymentDetails.currency.toUpperCase(),
  }).format(paymentDetails.amount / 100);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
        💰 Payment Received!
      </h2>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: #10b981;">${formattedAmount}</p>
        <p style="margin: 10px 0;"><strong>Payment Type:</strong> ${paymentDetails.type}</p>
        <p style="margin: 10px 0;"><strong>Customer Email:</strong> <a href="mailto:${paymentDetails.customerEmail}">${paymentDetails.customerEmail}</a></p>
        <p style="margin: 10px 0;"><strong>Description:</strong> ${paymentDetails.description}</p>
        ${paymentDetails.invoiceId ? `<p style="margin: 10px 0;"><strong>Invoice ID:</strong> ${paymentDetails.invoiceId}</p>` : ""}
        ${paymentDetails.milestoneId ? `<p style="margin: 10px 0;"><strong>Milestone ID:</strong> ${paymentDetails.milestoneId}</p>` : ""}
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #065f46; font-weight: 500;">Payment successfully processed via Stripe</p>
      </div>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
        This notification was sent automatically when a payment was received.
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Payment Notifications <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `💰 Payment Received: ${formattedAmount} - ${paymentDetails.type}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to send payment notification:", data);
    }
  } catch (error) {
    console.error("Error sending payment notification:", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId;
        const milestoneId = session.metadata?.milestone_id;
        const paymentType = session.metadata?.type;

        if (paymentType === "milestone_payment" && milestoneId && session.payment_status === "paid") {
          await supabase
            .from("milestones")
            .update({
              payment_status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_id: session.payment_intent as string,
            })
            .eq("id", milestoneId);

          const { data: milestone } = await supabase
            .from("milestones")
            .select("title, amount")
            .eq("id", milestoneId)
            .maybeSingle();

          await sendPaymentNotification({
            type: "Milestone Payment",
            amount: session.amount_total || 0,
            currency: session.currency || "gbp",
            customerEmail: session.customer_email || "Unknown",
            description: milestone ? `Milestone: ${milestone.title}` : "Milestone Payment",
            milestoneId: milestoneId,
          });
        } else if (invoiceId && session.payment_status === "paid") {
          await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", invoiceId);

          await sendPaymentNotification({
            type: session.mode === "subscription" ? "Subscription Payment" : "One-time Payment",
            amount: session.amount_total || 0,
            currency: session.currency || "gbp",
            customerEmail: session.customer_email || "Unknown",
            description: `Invoice #${invoiceId}`,
            invoiceId: invoiceId,
          });
        } else if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              stripe_subscription_id: subscription.id,
              next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("client_id", session.client_reference_id);

          await sendPaymentNotification({
            type: "Subscription Payment",
            amount: session.amount_total || 0,
            currency: session.currency || "gbp",
            customerEmail: session.customer_email || "Unknown",
            description: "Subscription Activated",
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              next_billing_date: new Date(invoice.lines.data[0]?.period?.end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          await sendPaymentNotification({
            type: "Subscription Renewal",
            amount: invoice.amount_paid,
            currency: invoice.currency,
            customerEmail: invoice.customer_email || "Unknown",
            description: invoice.lines.data[0]?.description || "Monthly Subscription",
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "active" : subscription.status,
            next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
