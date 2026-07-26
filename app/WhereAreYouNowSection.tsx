'use client';

import { motion } from '@/components/motion';
import Link from 'next/link';

const startingPoints = [
  { label: 'I need a new website', value: 'website', icon: 'ri-globe-line', color: '#06B6D4' },
  { label: 'My current website needs improving', value: 'website-improvement', icon: 'ri-tools-line', color: '#0891B2' },
  { label: 'I need more enquiries', value: 'lead-generation', icon: 'ri-user-search-line', color: '#8B5CF6' },
  { label: 'I want to automate my business', value: 'automation', icon: 'ri-settings-3-line', color: '#10B981' },
  { label: 'I need a client or staff portal', value: 'portal', icon: 'ri-dashboard-line', color: '#F97316' },
  { label: 'I have a software or SaaS idea', value: 'saas', icon: 'ri-code-s-slash-line', color: '#EC4899' },
  { label: 'I\'m not sure what I need', value: 'discovery', icon: 'ri-compass-3-line', color: '#6366F1' },
];

const serviceLabels: Record<string, string> = {
  website: 'Website Development',
  'website-improvement': 'Website Development',
  'lead-generation': 'Business Process Automation',
  automation: 'Business Process Automation',
  portal: 'Customer Portals',
  saas: 'Website Development',
  discovery: 'Technology Consultancy',
};

export default function WhereAreYouNowSection() {
  return (
    <section
      id="where-are-you-now"
      className="py-24 px-6 bg-white relative overflow-hidden"
      style={{ scrollMarginTop: '5rem' }}
      aria-label="Where are you now"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.04),transparent_60%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-[#06B6D4]/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#06B6D4] text-xs sm:text-sm uppercase tracking-[0.14em] font-semibold mb-4">
            Your starting point
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Where are you now?
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Choose the closest match. You do not need a technical brief &mdash; we will help you work out the next step.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {startingPoints.map((point, i) => {
            const isDiscovery = point.value === 'discovery';
            return (
              <motion.div
                key={point.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/contact?need=${point.value}&need_label=${encodeURIComponent(point.label)}`}
                  className={`group block p-6 rounded-2xl border transition-all duration-300 cursor-pointer h-full focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
                    isDiscovery
                      ? 'border-[#6366F1]/20 bg-[#6366F1]/[0.03] hover:border-[#6366F1]/40 hover:bg-[#6366F1]/[0.06] hover:-translate-y-1'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg'
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:scale-105"
                    style={{ backgroundColor: `${point.color}12` }}
                  >
                    <i className={`${point.icon} text-lg w-5 h-5 flex items-center justify-center`} style={{ color: point.color }} />
                  </div>
                  <h3 className={`text-base font-semibold mb-1 ${isDiscovery ? 'text-[#6366F1]' : 'text-slate-800'}`}>
                    {point.label}
                  </h3>
                  <p className={`text-xs flex items-center gap-1.5 mt-2 ${isDiscovery ? 'text-[#6366F1]/70' : 'text-slate-400'}`}>
                    {isDiscovery ? 'We\'ll help you figure it out' : 'We\'ll get you started'}
                    <i className="ri-arrow-right-line w-3 h-3 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200" />
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}