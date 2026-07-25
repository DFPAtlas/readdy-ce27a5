"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JsonLdScript from '../components/JsonLdScript';
import VideoHeroSection from './VideoHeroSection';
import FirstContentSection from './FirstContentSection';
import FeaturedProjectsSection from './FeaturedProjectsSection';
import CDDProcessSection from './CDDProcessSection';
import IntelligentBusinessSystemsSection from './IntelligentBusinessSystemsSection';
import InfrastructureManagementSection from './InfrastructureManagementSection';
import FounderSection from './FounderSection';
import WaysToWorkSection from './WaysToWorkSection';
import CTASection from './CTASection';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Digital Footprint',
  url: 'https://digital-footprint.uk',
  logo: 'https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/eee9f9ba-b907-488b-a1a8-f6d02534a71b_compressed_Remove-Background-Keep-Foot-Logo.webp',
  description: 'Digital Footprint conceives, develops, deploys and manages connected digital businesses, SaaS platforms, AI agents, automation, operational portals and secure infrastructure.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hertfordshire',
    addressCountry: 'UK'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@digital-footprint.uk',
    contactType: 'Customer Service'
  }
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Digital Footprint | SaaS, AI Automation and Digital Business Systems',
  description: 'Digital Footprint conceives, develops, deploys and manages connected digital businesses, SaaS platforms, AI agents, automation, operational portals and secure infrastructure.',
  url: 'https://digital-footprint.uk',
  publisher: {
    '@type': 'Organization',
    name: 'Digital Footprint'
  }
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <JsonLdScript schemas={[organizationSchema, webPageSchema]} />

      <main id="main-content" className={`transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`} suppressHydrationWarning={true} aria-label="Home page content">
        <div className="min-h-screen bg-[#050D1C]">
          <Header />
          <VideoHeroSection />
          <FirstContentSection />
          <FeaturedProjectsSection />
          <CDDProcessSection />
          <IntelligentBusinessSystemsSection />
          <InfrastructureManagementSection />
          <FounderSection />
          <WaysToWorkSection />
          <CTASection />
          <Footer />
        </div>
      </main>
    </>
  );
}