import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscription Confirmed | Digital Footprint',
  description: 'Your Digital Footprint Starter Plan subscription is now active.',
};

export default function SubscriptionSuccessPage() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="min-h-screen bg-[#0B0F14] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 600px 400px at 50% 30%, rgba(56,232,198,0.08), transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto pt-28 pb-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(56,232,198,0.12)] flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-double-line text-[#38E8C6] w-8 h-8 flex items-center justify-center" />
          </div>

          <p className="text-[#38E8C6] text-xs uppercase tracking-[0.14em] font-semibold mb-3">
            Subscription active
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tight mb-4">
            Welcome to the Starter Plan.
          </h1>
          <p className="text-[#AAB4C3] max-w-lg mx-auto mb-10">
            Your subscription is now active. A confirmation and receipt will be sent to the
            email address you used at checkout.
          </p>

          <div className="rounded-2xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.7)] p-6 lg:p-8 mb-8">
            <h2 className="text-lg font-semibold text-[#F5F7FA] mb-6">What happens next</h2>
            <div className="space-y-5">
              {[
                { step: 1, title: 'Confirmation email', desc: 'A receipt for your first monthly payment will be sent to you.' },
                { step: 2, title: 'Welcome pack', desc: 'We will reach out with your Starter Plan welcome details and next steps.' },
                { step: 3, title: 'Ongoing support', desc: 'Your website management and support begins immediately.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 text-left">
                  <div className="w-8 h-8 rounded-full bg-[rgba(56,232,198,0.12)] flex items-center justify-center shrink-0">
                    <span className="text-[#38E8C6] text-sm font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F7FA]">{item.title}</h3>
                    <p className="text-sm text-[#AAB4C3]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl border border-[rgba(148,163,184,0.25)] text-[#F5F7FA] font-semibold cursor-pointer hover:border-[#38E8C6]/40 hover:text-[#38E8C6] transition-all text-sm whitespace-nowrap"
          >
            Return to Digital Footprint
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}