'use client';

import { motion } from '@/components/motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroLightLines from '@/components/HeroLightLines';

const allServices = [
  { icon: 'ri-code-s-slash-line', title: 'Website Design & Development', desc: 'Beautiful, high-performance websites built with modern technology stacks. Responsive, accessible, and conversion-optimised.', color: '#06B6D4', features: ['Custom Design', 'Next.js & React', 'E-Commerce', 'CMS Integration', 'SEO Optimised', 'Mobile-First'] },
  { icon: 'ri-robot-line', title: 'AI Agent Development', desc: 'Custom AI agents that automate customer service, lead qualification, scheduling and intelligent workflows.', color: '#7C3AED', features: ['Chatbots', 'Voice Assistants', 'Lead Qualification', 'Custom Training', 'API Integration', 'Analytics'] },
  { icon: 'ri-settings-3-line', title: 'Business Process Automation', desc: 'Streamline repetitive tasks, reduce errors and free your team to focus on high-value work.', color: '#10B981', features: ['Workflow Design', 'Document Processing', 'Email Automation', 'Data Entry', 'Approval Flows', 'Reporting'] },
  { icon: 'ri-dashboard-line', title: 'Customer Portals', desc: 'Secure, branded client portals with dashboards, document sharing, messaging and real-time project tracking.', color: '#F97316', features: ['Client Dashboard', 'File Sharing', 'Messaging', 'Progress Tracking', 'Invoice Viewing', 'Custom Branding'] },
  { icon: 'ri-contacts-line', title: 'CRM Integration', desc: 'Connect and optimise your customer relationship tools for seamless data flow and better insights.', color: '#EF4444', features: ['Salesforce', 'HubSpot', 'Zoho', 'Custom CRM', 'Data Migration', 'Automation'] },
  { icon: 'ri-cloud-line', title: 'Cloud Systems', desc: 'Scalable cloud infrastructure, migration and management with leading providers.', color: '#0891B2', features: ['AWS', 'Azure', 'Google Cloud', 'Migration', 'Management', 'Cost Optimisation'] },
  { icon: 'ri-server-line', title: 'Server Management', desc: 'Proactive server monitoring, maintenance and optimisation for peak performance.', color: '#6366F1', features: ['24/7 Monitoring', 'Updates', 'Security Patching', 'Performance Tuning', 'Backup Management', 'Disaster Recovery'] },
  { icon: 'ri-router-line', title: 'Network Infrastructure', desc: 'Design, implementation and support for reliable, secure business networks that scale.', color: '#0D9488', features: ['Network Design', 'WiFi Solutions', 'VPN Setup', 'Firewall Config', 'Switch Management', 'Cabling'] },
  { icon: 'ri-shield-check-line', title: 'Cyber Security', desc: 'Comprehensive cyber security solutions to protect your business from evolving threats.', color: '#DC2626', features: ['Risk Assessment', 'Firewalls', 'Endpoint Protection', 'Security Audits', 'Training', 'Incident Response'] },
  { icon: 'ri-camera-line', title: 'CCTV & Smart Security', desc: 'Modern surveillance and access control systems for physical security.', color: '#1E40AF', features: ['IP Cameras', 'NVR Systems', 'Access Control', 'Remote Viewing', 'AI Detection', 'Mobile App'] },
  { icon: 'ri-computer-line', title: 'IT Support', desc: 'Responsive technical support for your entire organisation — remote and on-site.', color: '#6366F1', features: ['Help Desk', 'Remote Support', 'On-Site Visits', 'Hardware Setup', 'Software Support', 'SLA Options'] },
  { icon: 'ri-lightbulb-line', title: 'Technology Consultancy', desc: 'Expert advice to guide your digital strategy, vendor selection and transformation roadmap.', color: '#D97706', features: ['Strategy', 'Audit', 'Roadmap', 'Vendor Selection', 'Digital Transformation', 'ROI Analysis'] },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 bg-white text-slate-800">
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(6,182,212,0.06),transparent_60%)]" />
          <HeroLightLines />
          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-sm font-medium mb-6">
                <i className="ri-tools-line w-4 h-4 flex items-center justify-center" />
                What We Offer
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">Our Services</h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Complete technology services to help your business modernise, automate and grow.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices.map((service, index) => {
                const slug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                return (
                  <motion.div
                    key={service.title}
                    id={slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group glass-card rounded-2xl p-6 cursor-pointer scroll-mt-28"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: `${service.color}15` }}>
                      <i className={`${service.icon} text-xl w-5 h-5 flex items-center justify-center`} style={{ color: service.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{service.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.features.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">{f}</span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-16">
              <div className="section-dark-alt rounded-2xl p-12 border border-slate-200">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-sm font-medium mb-6">
                  <i className="ri-chat-1-line w-4 h-4 flex items-center justify-center" />
                  Not Sure?
                </div>
                <h2 className="text-3xl font-bold mb-4">Not Sure What You Need?</h2>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto">Book a free consultation and we will help you identify the right solutions for your business.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  Book Free Consultation
                  <i className="ri-arrow-right-line w-5 h-5 flex items-center justify-center" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}