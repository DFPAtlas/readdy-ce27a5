'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function FirstContentSection() {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  const animClass = (delay: number) => {
    if (reducedMotion) return '';
    return `transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;
  };

  return (
    <section
      id="first-content-section"
      ref={sectionRef}
      className="relative bg-[#050D1C] min-h-[90vh] flex items-center"
      style={{ scrollMarginTop: '5rem' }}
      aria-label="Digital Footprint introduction"
    >
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.5) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }} />

      <div className="relative w-full max-w-[1150px] mx-auto px-6 sm:px-8 lg:px-10 py-24 md:py-32 lg:py-40">
        <p
          className="text-[#06B6D4] text-xs sm:text-sm uppercase tracking-[0.14em] font-semibold mb-6"
          style={{ transitionDelay: '0ms' }}
        >
          <span className={animClass(0)} style={{ display: 'inline-block', transitionDelay: '0ms' }}>
            Digital Businesses, Built Completely
          </span>
        </p>

        <h1
          className="text-white font-bold tracking-[-0.02em] leading-[0.98] mb-8 max-w-[1100px]"
          style={{
            fontSize: 'clamp(38px, 6.5vw, 88px)',
            fontWeight: 700,
          }}
        >
          <span className={animClass(1)} style={{ display: 'inline-block', transitionDelay: '100ms' }}>
            We don&rsquo;t just build websites.
          </span>
          <br />
          <span className={animClass(2)} style={{ display: 'inline-block', transitionDelay: '200ms' }}>
            We build the{' '}
          </span>
          <span
            className={animClass(3)}
            style={{
              display: 'inline-block',
              transitionDelay: '300ms',
              color: '#06B6D4',
              textShadow: visible && !reducedMotion ? '0 0 40px rgba(6,182,212,0.25)' : 'none',
              transition: 'all 0.7s ease-out 300ms, text-shadow 0.7s ease-out 600ms',
            }}
          >
            systems
          </span>
          <span className={animClass(4)} style={{ display: 'inline-block', transitionDelay: '350ms' }}> </span>
          <span
            className={animClass(5)}
            style={{
              display: 'inline-block',
              transitionDelay: '400ms',
              color: '#06B6D4',
              textShadow: visible && !reducedMotion ? '0 0 40px rgba(6,182,212,0.25)' : 'none',
              transition: 'all 0.7s ease-out 400ms, text-shadow 0.7s ease-out 700ms',
            }}
          >
            businesses run on.
          </span>
        </h1>

        <p
          className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-[750px] mb-12"
          style={{ lineHeight: 1.65, fontSize: 'clamp(16px, 1.35vw, 20px)' }}
        >
          <span className={animClass(6)} style={{ display: 'inline-block', transitionDelay: '550ms' }}>
            Digital Footprint combines strategy, brand, websites, software, AI agents, automation, secure databases and cloud infrastructure to turn ambitious ideas into complete, operational companies.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link
            href="/contact"
            className={animClass(8)}
            style={{
              display: 'inline-flex',
              transitionDelay: '700ms',
            }}
          >
            <span className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white whitespace-nowrap cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#F97316]/25 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 focus:ring-offset-[#050D1C]">
              Discuss Your Project
              <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200" />
            </span>
          </Link>

          <Link
            href="/case-studies"
            className={animClass(9)}
            style={{
              display: 'inline-flex',
              transitionDelay: '780ms',
            }}
          >
            <span className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-300 whitespace-nowrap cursor-pointer transition-all duration-300 border border-white/[0.12] hover:border-white/[0.3] hover:text-white hover:bg-white/[0.04] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#050D1C]">
              Explore Our Work
              <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200" />
            </span>
          </Link>
        </div>

        <div
          className={animClass(10)}
          style={{
            transitionDelay: '900ms',
          }}
        >
          <p className="text-sm text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Web Platforms</span>
            <span className="text-[#06B6D4]/40">&middot;</span>
            <span>SaaS</span>
            <span className="text-[#06B6D4]/40">&middot;</span>
            <span>AI Agents</span>
            <span className="text-[#06B6D4]/40">&middot;</span>
            <span>Automation</span>
            <span className="text-[#06B6D4]/40">&middot;</span>
            <span>Databases</span>
            <span className="text-[#06B6D4]/40">&middot;</span>
            <span>Cloud Infrastructure</span>
          </p>
        </div>
      </div>
    </section>
  );
}