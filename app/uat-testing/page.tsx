'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UATHeroSection from './UATHeroSection';
import WhatTestersDoSection from './WhatTestersDoSection';
import WhoCanApplySection from './WhoCanApplySection';
import PayGuideSection from './PayGuideSection';
import ApplicationForm from './ApplicationForm';

export default function UATTestingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main
      id="main-content"
      className={`transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      suppressHydrationWarning={true}
    >
      <div className="min-h-screen bg-white text-slate-800">
        <Header />
        <UATHeroSection />
        <WhatTestersDoSection />
        <WhoCanApplySection />
        <PayGuideSection />
        <ApplicationForm />
        <Footer />
      </div>
    </main>
  );
}