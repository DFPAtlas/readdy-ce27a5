'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from '@/components/motion';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const deviceOptions = [
  'Android phone',
  'iPhone',
  'Windows laptop/PC',
  'Mac',
  'iPad/tablet',
];

const browserOptions = [
  'Chrome',
  'Safari',
  'Firefox',
  'Edge',
];

const industryOptions = [
  'Security',
  'Property',
  'Hospitality',
  'Events',
  'Construction',
  'Admin',
  'Retail',
  'Technology',
  'Other',
];

const experienceOptions = [
  'No testing experience',
  'Some testing experience',
  'Professional QA/tester',
];

const availabilityOptions = [
  'Weekdays',
  'Evenings',
  'Weekends',
  'Short notice',
];

const paymentOptions = [
  'Bank transfer',
  'PayPal',
  'Other',
];

export default function ApplicationForm() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [reasonLength, setReasonLength] = useState(0);

  const toggleSelection = (item: string, selected: string[], setter: (v: string[]) => void) => {
    if (selected.includes(item)) {
      setter(selected.filter((s) => s !== item));
    } else {
      setter([...selected, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const form = formRef.current;
    if (!form) return;

    const honeypotEl = form.querySelector<HTMLInputElement>('input[name="phone_alt"]');
    if (honeypotEl && honeypotEl.value.trim() !== '') {
      setFormState('success');
      form.reset();
      setSelectedDevices([]);
      setSelectedBrowsers([]);
      setSelectedIndustries([]);
      setSelectedAvailability([]);
      setReasonLength(0);
      return;
    }

    if (selectedDevices.length === 0) {
      setFormError('Please select at least one device.');
      return;
    }
    if (selectedBrowsers.length === 0) {
      setFormError('Please select at least one browser.');
      return;
    }
    if (selectedIndustries.length === 0) {
      setFormError('Please select at least one industry.');
      return;
    }
    if (selectedAvailability.length === 0) {
      setFormError('Please select at least one availability option.');
      return;
    }

    setFormState('loading');

    try {
      const formData = new FormData(form);
      formData.append('devices', selectedDevices.join(', '));
      formData.append('browsers', selectedBrowsers.join(', '));
      formData.append('industries', selectedIndustries.join(', '));
      formData.append('availability', selectedAvailability.join(', '));

      const response = await fetch('https://readdy.ai/api/form/d93ocvlmi650so75dsqg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      const responseText = await response.text();
      let parsed: any;
      try { parsed = JSON.parse(responseText); } catch { parsed = null; }

      if (response.ok && parsed?.code === 'OK') {
        setFormState('success');
        form.reset();
        setSelectedDevices([]);
        setSelectedBrowsers([]);
        setSelectedIndustries([]);
        setSelectedAvailability([]);
        setReasonLength(0);
      } else {
        const serverMsg = parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || responseText || 'Submission failed. Please try again.';
        if (serverMsg.includes('spam') || serverMsg.includes('form data is spam')) {
          setFormError('Your submission could not be processed. Please try again.');
        } else {
          setFormError(serverMsg);
        }
        setFormState('error');
      }
    } catch {
      setFormError('Network error. Please check your connection and try again.');
      setFormState('error');
    }
  };

  const TagButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
        selected
          ? 'bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4]'
          : 'bg-slate-50 border border-slate-200 text-slate-400 hover:border-[#06B6D4]/20 hover:text-slate-600'
      }`}
    >
      {label}
    </button>
  );

  if (formState === 'success') {
    return (
      <section id="apply-form" className="py-24 bg-[#F8FAFC]" ref={ref}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Application Submitted!</h3>
            <p className="text-slate-500 mb-8">
              Thank you for applying to become a UAT tester. We will review your application and get back to you soon.
            </p>
            <button
              onClick={() => setFormState('idle')}
              className="px-6 py-3 bg-[#F97316] rounded-xl font-semibold text-white hover:bg-[#EA580C] transition-colors whitespace-nowrap cursor-pointer"
            >
              Submit Another Application
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="apply-form" className="py-24 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-xs font-semibold mb-4">
            Apply Now
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Tester Application</h2>
          <p className="text-slate-400 text-lg">
            Fill in the form below and we will be in touch when a suitable test project comes up.
          </p>
        </motion.div>

        <motion.form
          ref={formRef}
          data-readdy-form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-card rounded-3xl p-8 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="John Smith"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="+44 7123 456789"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Town/City</label>
              <input
                type="text"
                name="town_city"
                placeholder="London"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Country</label>
            <input
              type="text"
              name="country"
              placeholder="United Kingdom"
              defaultValue="United Kingdom"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_over_18" required className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-white/5 text-[#06B6D4] focus:ring-[#06B6D4]/20 cursor-pointer" />
              <span className="text-sm text-slate-600">I confirm I am 18 years or over *</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Devices Available *</label>
            <div className="flex flex-wrap gap-2">
              {deviceOptions.map((d) => (
                <TagButton key={d} label={d} selected={selectedDevices.includes(d)} onClick={() => toggleSelection(d, selectedDevices, setSelectedDevices)} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Browsers Available *</label>
            <div className="flex flex-wrap gap-2">
              {browserOptions.map((b) => (
                <TagButton key={b} label={b} selected={selectedBrowsers.includes(b)} onClick={() => toggleSelection(b, selectedBrowsers, setSelectedBrowsers)} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Experience Level *</label>
            <div className="flex flex-wrap gap-2">
              {experienceOptions.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => {
                    const radio = document.querySelector<HTMLInputElement>(`input[name="experience_level"][value="${exp}"]`);
                    radio?.click();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer bg-slate-50 border border-slate-200 text-slate-400 hover:border-[#06B6D4]/20 hover:text-slate-600"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="experience_level" value={exp} className="w-3.5 h-3.5 text-[#06B6D4] focus:ring-[#06B6D4]/20 cursor-pointer" />
                    {exp}
                  </label>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Industries Worked In *</label>
            <div className="flex flex-wrap gap-2">
              {industryOptions.map((ind) => (
                <TagButton key={ind} label={ind} selected={selectedIndustries.includes(ind)} onClick={() => toggleSelection(ind, selectedIndustries, setSelectedIndustries)} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Availability *</label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((a) => (
                <TagButton key={a} label={a} selected={selectedAvailability.includes(a)} onClick={() => toggleSelection(a, selectedAvailability, setSelectedAvailability)} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Preferred Payment Method *</label>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => {
                    const radio = document.querySelector<HTMLInputElement>(`input[name="preferred_payment_method"][value="${pm}"]`);
                    radio?.click();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer bg-slate-50 border border-slate-200 text-slate-400 hover:border-[#06B6D4]/20 hover:text-slate-600"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="preferred_payment_method" value={pm} className="w-3.5 h-3.5 text-[#06B6D4] focus:ring-[#06B6D4]/20 cursor-pointer" />
                    {pm}
                  </label>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Why would you like to become a UAT tester? <span className="text-slate-500">({reasonLength}/500)</span>
            </label>
            <textarea
              name="application_reason"
              rows={4}
              maxLength={500}
              onChange={(e) => setReasonLength(e.target.value.length)}
              placeholder="Tell us a bit about why you are interested in UAT testing..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all resize-none"
            />
          </div>

          <input type="text" name="phone_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly className="absolute opacity-0 pointer-events-none top-[-9999px] left-[-9999px]" />

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="contact_consent" required className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-white/5 text-[#06B6D4] focus:ring-[#06B6D4]/20 mt-0.5 cursor-pointer" />
              <span className="text-sm text-slate-400">I agree to be contacted by Digital Footprint about UAT testing opportunities *</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="privacy_consent" required className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-white/5 text-[#06B6D4] focus:ring-[#06B6D4]/20 mt-0.5 cursor-pointer" />
              <span className="text-sm text-slate-400">I understand my details will be stored and processed for tester recruitment and project assignment *</span>
            </label>
          </div>

          {formError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{formError}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={formState === 'loading'}
            className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-xl font-bold text-white hover:shadow-lg hover:shadow-[#F97316]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 whitespace-nowrap"
          >
            {formState === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
}