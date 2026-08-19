'use client';

import { useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const PLAN_FEATURES = [
  'Ongoing website management',
  'Monthly maintenance & updates',
  'Priority UK-based support',
];

export default function SubscriptionCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-subscription-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lookup_key: 'starter_plan_monthly' }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start the subscription checkout. Please try again.');
        setIsSubmitting(false);
      }
    } catch {
      setError('A network error occurred. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-14">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-[rgba(148,163,184,0.12)]" />
        <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[#64748B] whitespace-nowrap">
          Prefer ongoing support?
        </span>
        <div className="h-px flex-1 bg-[rgba(148,163,184,0.12)]" />
      </div>

      <div className="max-w-xl mx-auto rounded-2xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.6)] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(56,232,198,0.08)] flex items-center justify-center shrink-0">
            <i className="ri-leaf-line text-[#38E8C6] w-6 h-6 flex items-center justify-center" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FA]">Starter Plan</h3>
            <p className="text-sm text-[#AAB4C3]">
              <span className="text-xl font-bold text-[#F5F7FA]">£20.00</span>
              <span className="text-[#64748B]"> / month</span>
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {PLAN_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-[#AAB4C3]">
              <span className="w-5 h-5 rounded-full bg-[rgba(56,232,198,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                <i className="ri-check-line text-[#38E8C6] w-3 h-3 flex items-center justify-center" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 min-h-[50px] rounded-xl text-base font-bold transition-all duration-300 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38E8C6]/50 bg-[#38E8C6] text-[#0B0F14] shadow-[0_0_24px_rgba(56,232,198,0.2)] hover:shadow-[0_0_36px_rgba(56,232,198,0.35)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line w-5 h-5 flex items-center justify-center animate-spin" />
                Redirecting to secure checkout...
              </>
            ) : (
              <>
                <i className="ri-lock-line w-4 h-4 flex items-center justify-center" />
                Subscribe now
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-xs text-[#64748B] text-center flex items-center justify-center gap-1.5">
          <i className="ri-shield-check-line w-3.5 h-3.5 flex items-center justify-center" />
          Secure payment processed by Stripe. Cancel anytime.
        </p>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.18)]">
            <p className="text-sm text-[#EF4444] flex items-start gap-2">
              <i className="ri-error-warning-line w-4 h-4 flex items-center justify-center shrink-0 mt-0.5" />
              {error}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}