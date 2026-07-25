
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_DOMAIN = Deno.env.get("RESEND_FROM_DOMAIN");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "noreply@digital-footprint.uk";
const SITE_URL = Deno.env.get("SITE_URL") || "https://digital-footprint.uk";

function getFromAddress(label?: string): string {
  const domain = RESEND_FROM_DOMAIN || "digital-footprint.uk";
  if (label) return `${label} <noreply@${domain}>`;
  return `Digital Footprint <noreply@${domain}>`;
}

function renderTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
    result = result.replaceAll(`{{ ${key} }}`, value);
  }
  return result;
}

function buildUrgencyMeta(daysOverdue: number) {
  const urgencyColor = daysOverdue > 14 ? "#dc2626" : daysOverdue > 7 ? "#f59e0b" : "#3b82f6";
  const urgencyText = daysOverdue > 14 ? "URGENT" : daysOverdue > 7 ? "Second Reminder" : "Friendly Reminder";
  const overdueText = daysOverdue > 0 ? `Payment Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}` : "Payment Due";
  return { urgencyColor, urgencyText, overdueText };
}

interface Invoice {
  id: string;
  invoice_number: string;
  description: string;
  amount: number;
  status: string;
  due_date: string;
  client_id: string;
  client_email?: string;
  client_name?: string;
}

async function sendReminderEmail(
  supabase: any,
  invoice: Invoice,
  daysOverdue: number,
  isManual: boolean = false
) {
  if (!RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email");
    return false;
  }

  const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(invoice.amount));
  const { urgencyColor, urgencyText, overdueText } = buildUrgencyMeta(daysOverdue);
  const dueDateStr = new Date(invoice.due_date).toLocaleDateString("en-GB");
  const paymentLink = `${SITE_URL}/portal/billing`;

  // 1. Try to load email templates
  const { data: clientTemplate } = await supabase
    .from("email_templates")
    .select("subject, html_content")
    .eq("name", "Invoice Reminder")
    .eq("category", "invoice")
    .maybeSingle();

  const { data: adminTemplate } = await supabase
    .from("email_templates")
    .select("subject, html_content")
    .eq("name", "Invoice Reminder Admin")
    .eq("category", "invoice")
    .maybeSingle();

  // 2. Build client email
  let clientSubject: string;
  let clientHtml: string;

  if (clientTemplate) {
    const vars: Record<string, string> = {
      client_name: invoice.client_name || "Valued Client",
      invoice_number: invoice.invoice_number,
      invoice_description: invoice.description,
      invoice_amount: formattedAmount,
      invoice_due_date: dueDateStr,
      days_overdue: String(daysOverdue),
      urgency_text: urgencyText,
      overdue_text: overdueText,
      urgency_color: urgencyColor,
      payment_link: paymentLink,
    };
    clientSubject = renderTemplate(clientTemplate.subject, vars);
    clientHtml = renderTemplate(clientTemplate.html_content, vars);
  } else {
    // Fallback hardcoded HTML
    clientSubject = `${urgencyText}: Invoice ${invoice.invoice_number} - ${formattedAmount} ${daysOverdue > 0 ? 'Overdue' : 'Due'}`;
    clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0;">Digital-Footprint</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Invoice Reminder</p>
          </div>
          <div style="background: ${urgencyColor}; color: white; padding: 10px 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
            <strong>${urgencyText}: ${overdueText}</strong>
          </div>
          <p style="color: #374151; line-height: 1.6;">Dear ${invoice.client_name || "Valued Client"},</p>
          <p style="color: #374151; line-height: 1.6;">This is a reminder regarding the following invoice:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Invoice Number:</td><td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${invoice.invoice_number}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Description:</td><td style="padding: 8px 0; color: #1f2937; text-align: right;">${invoice.description}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Amount Due:</td><td style="padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 18px; text-align: right;">${formattedAmount}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Due Date:</td><td style="padding: 8px 0; color: #1f2937; text-align: right;">${dueDateStr}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="display: inline-block; background: #007AFF; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Pay Now</a>
          </div>
          <p style="color: #374151; line-height: 1.6;">If you have already made this payment, please disregard this reminder. If you have any questions, please contact us.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated reminder from Digital-Footprint.<br>Please do not reply directly to this email.</p>
        </div>
      </div>`;
  }

  // 3. Build admin email
  let adminSubject: string;
  let adminHtml: string;

  if (adminTemplate) {
    const vars: Record<string, string> = {
      invoice_number: invoice.invoice_number,
      invoice_amount: formattedAmount,
      days_overdue: daysOverdue > 0 ? String(daysOverdue) : "Not yet due",
      client_email: invoice.client_email || "Not available",
      client_name: invoice.client_name || "Unknown",
      invoice_description: invoice.description,
      is_manual: isManual ? "Manual " : "",
      urgency_color: urgencyColor,
      urgency_text: urgencyText,
    };
    adminSubject = renderTemplate(adminTemplate.subject, vars);
    adminHtml = renderTemplate(adminTemplate.html_content, vars);
  } else {
    adminSubject = `${isManual ? 'Manual ' : ''}Reminder Sent: ${invoice.invoice_number}`;
    adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${urgencyColor}; border-bottom: 2px solid ${urgencyColor}; padding-bottom: 10px;">Invoice Reminder Sent</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Invoice:</strong> ${invoice.invoice_number}</p>
          <p style="margin: 10px 0;"><strong>Amount:</strong> ${formattedAmount}</p>
          <p style="margin: 10px 0;"><strong>Days Overdue:</strong> ${daysOverdue > 0 ? daysOverdue : 'Not yet due'}</p>
          <p style="margin: 10px 0;"><strong>Client Email:</strong> ${invoice.client_email || 'Not available'}</p>
          <p style="margin: 10px 0;"><strong>Description:</strong> ${invoice.description}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">A reminder email has been sent to the client${isManual ? ' (manually triggered)' : ''}.</p>
      </div>`;
  }

  // 4. Send emails
  try {
    const emailPromises = [];

    if (invoice.client_email) {
      emailPromises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: getFromAddress("Invoice Reminders"),
            to: [invoice.client_email],
            subject: clientSubject,
            html: clientHtml,
          }),
        })
      );
    }

    emailPromises.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: getFromAddress(),
          to: [NOTIFICATION_EMAIL],
          subject: adminSubject,
          html: adminHtml,
        }),
      })
    );

    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { invoice_id } = body as { invoice_id?: string };

    if (invoice_id) {
      const { data: invoice, error: fetchError } = await supabase
        .from("invoices")
        .select("*, profiles(email, full_name)")
        .eq("id", invoice_id)
        .maybeSingle();

      if (fetchError || !invoice) {
        return new Response(
          JSON.stringify({ error: "Invoice not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const invoiceWithClient = {
        ...invoice,
        client_email: invoice.profiles?.email,
        client_name: invoice.profiles?.full_name,
      };

      const sent = await sendReminderEmail(supabase, invoiceWithClient, daysOverdue, true);

      if (sent) {
        await supabase
          .from("invoices")
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq("id", invoice.id);
      }

      return new Response(
        JSON.stringify({
          success: sent,
          message: sent ? "Reminder sent successfully" : "Failed to send reminder",
          invoice_number: invoice.invoice_number,
          template_used: !!(await supabase.from("email_templates").select("id").eq("name", "Invoice Reminder").eq("category", "invoice").maybeSingle()).data,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: overdueInvoices, error: fetchError } = await supabase
      .from("invoices")
      .select("*, profiles(email, full_name)")
      .eq("status", "pending")
      .lt("due_date", today.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch invoices: ${fetchError.message}`);
    }

    if (!overdueInvoices || overdueInvoices.length === 0) {
      return new Response(
        JSON.stringify({ message: "No overdue invoices found", reminders_sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let remindersSent = 0;
    const results = [];

    for (const invoice of overdueInvoices) {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const shouldSendReminder = daysOverdue === 1 || daysOverdue === 3 || daysOverdue === 7 || daysOverdue === 14 || daysOverdue % 7 === 0;

      if (shouldSendReminder) {
        const invoiceWithClient = {
          ...invoice,
          client_email: invoice.profiles?.email,
          client_name: invoice.profiles?.full_name,
        };

        const sent = await sendReminderEmail(supabase, invoiceWithClient, daysOverdue);

        if (sent) {
          remindersSent++;
          await supabase
            .from("invoices")
            .update({
              status: daysOverdue > 7 ? "overdue" : "pending",
              last_reminder_sent: new Date().toISOString()
            })
            .eq("id", invoice.id);
        }

        results.push({
          invoice_number: invoice.invoice_number,
          days_overdue: daysOverdue,
          reminder_sent: sent,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${overdueInvoices.length} overdue invoices`,
        reminders_sent: remindersSent,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing invoice reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
