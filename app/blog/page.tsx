'use client';

import { motion } from '@/components/motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const posts = [
  { title: 'How AI is Transforming Business Operations in 2026', date: 'June 5, 2026', category: 'AI & Automation', excerpt: 'Artificial intelligence is no longer a futuristic concept. Discover how businesses of all sizes are leveraging AI to automate workflows, reduce costs and improve decision-making.', readTime: '6 min read', image: 'https://readdy.ai/api/search-image?query=Futuristic%20AI%20artificial%20intelligence%20transforming%20business%20operations%20with%20automation%20and%20data%20analytics%2C%20dark%20modern%20professional%20technology%20concept%20with%20cyan%20neon%20accents&width=600&height=380&seq=blog-ai-ops-light&orientation=landscape' },
  { title: 'Why Every Small Business Needs a Digital Transformation Strategy', date: 'May 28, 2026', category: 'Digital Transformation', excerpt: 'Digital transformation is not just for enterprises. Small businesses that embrace technology gain competitive advantage, improve efficiency and unlock new growth opportunities.', readTime: '5 min read', image: 'https://readdy.ai/api/search-image?query=Small%20business%20digital%20transformation%20strategy%20concept%20with%20modern%20technology%20tools%20and%20growth%20charts%2C%20dark%20professional%20business%20technology%20design%20with%20cyan%20highlights&width=600&height=380&seq=blog-digital-trans-light&orientation=landscape' },
  { title: 'Cloud vs On-Premise: Making the Right Choice for Your Business', date: 'May 20, 2026', category: 'Cloud', excerpt: 'The cloud versus on-premise debate continues. We break down the key considerations — cost, security, scalability and compliance — to help you make an informed decision.', readTime: '7 min read', image: 'https://readdy.ai/api/search-image?query=Cloud%20computing%20versus%20on-premise%20server%20infrastructure%20comparison%20concept%2C%20dark%20modern%20technology%20decision%20making%20with%20cyan%20and%20blue%20accents&width=600&height=380&seq=blog-cloud-vs-light&orientation=landscape' },
  { title: 'Cyber Security Essentials for UK Businesses', date: 'May 12, 2026', category: 'Security', excerpt: 'With cyber threats evolving rapidly, UK businesses must stay vigilant. Learn the essential security measures every organisation should implement to protect their data and reputation.', readTime: '8 min read', image: 'https://readdy.ai/api/search-image?query=Cyber%20security%20protection%20concept%20for%20businesses%20with%20shield%20lock%20and%20digital%20protection%2C%20dark%20modern%20professional%20security%20technology%20design%20with%20red%20and%20cyan%20accents&width=600&height=380&seq=blog-cyber-ess-light&orientation=landscape' },
  { title: 'The Complete Guide to Business Process Automation', date: 'May 5, 2026', category: 'Automation', excerpt: 'Business process automation can save your organisation hundreds of hours annually. Here is a comprehensive guide to identifying, prioritising and implementing automation opportunities.', readTime: '10 min read', image: 'https://readdy.ai/api/search-image?query=Business%20process%20automation%20workflow%20concept%20with%20digital%20transformation%20and%20efficiency%20optimization%2C%20dark%20modern%20professional%20technology%20design%20with%20green%20and%20cyan%20accents&width=600&height=380&seq=blog-bpa-guide-light&orientation=landscape' },
  { title: 'What Makes a Great Business Website in 2026', date: 'April 28, 2026', category: 'Web Design', excerpt: 'Website expectations have evolved. Speed, accessibility, AI integration and user experience are no longer optional. Here is what your business website needs to succeed today.', readTime: '5 min read', image: 'https://readdy.ai/api/search-image?query=Modern%20business%20website%20design%20concept%202026%20with%20responsive%20design%20and%20user%20experience%2C%20dark%20professional%20web%20design%20technology%20aesthetic%20with%20cyan%20and%20purple%20neon%20accents&width=600&height=380&seq=blog-web-2026-light&orientation=landscape' },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 bg-white text-slate-800">
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(6,182,212,0.05),transparent_60%)]" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-sm font-medium mb-6">
                <i className="ri-article-line w-4 h-4 flex items-center justify-center" />
                Insights
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-slate-900">Blog</h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Insights on technology, automation, AI and digital transformation for modern businesses.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group glass-card rounded-2xl overflow-hidden cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span>{post.date}</span>
                      <span>&bull;</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#06B6D4] transition-colors leading-snug">{post.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{post.excerpt}</p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-16">
              <div className="section-dark-alt rounded-2xl p-12 border border-slate-200">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06B6D4]/8 border border-[#06B6D4]/20 text-[#06B6D4] text-sm font-medium mb-6">
                  <i className="ri-mail-send-line w-4 h-4 flex items-center justify-center" />
                  Stay in the Loop
                </div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900">Stay Updated</h2>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto">Subscribe to our newsletter for the latest insights on technology, automation and digital transformation.</p>
                <form data-readdy-form className="flex items-center gap-3 max-w-md mx-auto">
                  <input type="email" name="email" placeholder="Enter your email" required className="flex-1 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors text-sm" />
                  <button type="submit" className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">Subscribe</button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}