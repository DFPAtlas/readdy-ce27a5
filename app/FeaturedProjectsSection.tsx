'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from '@/components/motion';
import Link from 'next/link';

interface Project {
  name: string;
  category: string;
  categories: string[];
  description: string;
  status: string;
  color: string;
  icon: string;
  href?: string;
  homepagePreview?: string;
  homepagePreviewAlt?: string;
  homepageUrl?: string;
  previewStatus: 'real' | 'coming-soon';
  filterGroup: 'featured' | 'companies' | 'ai';
}

const projects: Project[] = [
  {
    name: 'QuickGuard',
    category: 'Security',
    categories: ['SaaS', 'Security'],
    description: 'Temporary security staffing marketplace with guard accounts, client accounts, job posting, matching, subscriptions, compliance and payment workflows.',
    status: 'In Development',
    color: '#F97316',
    icon: 'ri-shield-check-line',
    href: '/products/quickguard',
    homepagePreview: 'https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/f82e1cb0-0c6e-4cde-b539-67eb8c573472_compressed_Quickguard.webp',
    homepagePreviewAlt: 'QuickGuard homepage preview showing the security staffing marketplace hero',
    homepageUrl: 'https://www.quickguard.uk',
    previewStatus: 'real',
    filterGroup: 'featured',
  },
  {
    name: 'GuardianHub',
    category: 'Security',
    categories: ['SaaS', 'Security'],
    description: 'Security company operations platform covering rotas, patrols, incidents, compliance, client portals and guard operations.',
    status: 'In Development',
    color: '#10B981',
    icon: 'ri-building-line',
    href: '/products/guardianhub',
    homepagePreview: 'https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/c6ee6689-e143-4b16-8360-78bb8f1ef605_compressed_Guardian-hub.webp',
    homepagePreviewAlt: 'GuardianHub homepage preview showing AI security operations platform hero',
    homepageUrl: 'https://guardian-hub.uk',
    previewStatus: 'real',
    filterGroup: 'featured',
  },
  {
    name: 'LetHub',
    category: 'Property',
    categories: ['SaaS', 'Property'],
    description: 'Property and lettings operations platform with landlord, tenant and staff workflows, maintenance, documents, compliance and inspections.',
    status: 'In Development',
    color: '#2563EB',
    icon: 'ri-home-4-line',
    href: '/products/lethub',
    homepagePreview: 'https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/e3a4ef3b-304b-4b7c-8c3a-21fb0cc04db6_compressed_Lethub.webp',
    homepagePreviewAlt: 'LetHub homepage preview showing UK property management platform hero',
    homepageUrl: 'https://lethub.uk',
    previewStatus: 'real',
    filterGroup: 'featured',
  },
  {
    name: 'Corevia AI',
    category: 'AI',
    categories: ['AI and Automation', 'Internal Systems'],
    description: 'Private company AI workforce platform built from company documents, systems, workflows and internal knowledge.',
    status: 'In Development',
    color: '#EC4899',
    icon: 'ri-robot-line',
    href: '/products/corevia',
    homepagePreview: 'https://readdy.ai/api/search-image?query=A%20futuristic%20AI-powered%20workspace%20dashboard%20interface%20displayed%20on%20a%20sleek%20monitor%20in%20a%20modern%20minimalist%20office%20with%20soft%20pink%20and%20magenta%20ambient%20lighting%2C%20holographic%20data%20visualisations%20floating%20above%20the%20screen%2C%20clean%20dark%20UI%20design%20with%20glowing%20accent%20lines%2C%20the%20interface%20shows%20intelligent%20document%20processing%20and%20workflow%20automation%20panels%2C%20contemporary%20tech%20aesthetic%20with%20smooth%20gradients%20and%20glassmorphism%20elements%2C%20the%20workspace%20has%20a%20professional%20and%20cutting-edge%20atmosphere%20with%20subtle%20neon%20reflections%2C%20photorealistic%203D%20render%20style%2C%20cinematic%20lighting%2C%20shallow%20depth%20of%20field%2C%20high-end%20technology%20concept%20art%2C%20crisp%20and%20detailed%20UI%20mockup%20on%20a%20dark%20background%20with%20subtle%20grid%20lines&width=800&height=500&seq=corevia-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'Corevia AI homepage preview showing AI workforce platform with intelligent document processing and workflow automation',
    homepageUrl: 'https://corevia.digital-footprint.uk',
    previewStatus: 'real',
    filterGroup: 'featured',
  },
  {
    name: 'HomAura',
    category: 'Property',
    categories: ['SaaS', 'Smart Buildings', 'Property'],
    description: 'Smart-home platform and business ecosystem for monitoring, device support, third-party installation guidance and connected-home management.',
    status: 'Concept Development',
    color: '#7C3AED',
    icon: 'ri-home-wifi-line',
    href: '/products/homaura',
    homepagePreview: 'https://readdy.ai/api/search-image?query=A%20sleek%20smart%20home%20management%20platform%20interface%20displayed%20on%20a%20modern%20tablet%20in%20a%20contemporary%20living%20room%20with%20warm%20purple%20ambient%20lighting%2C%20the%20dashboard%20shows%20connected%20IoT%20devices%2C%20home%20monitoring%20panels%2C%20device%20control%20tiles%20and%20energy%20usage%20charts%20with%20a%20dark%20glassmorphism%20UI%20design%2C%20elegant%20and%20futuristic%20smart%20building%20technology%20aesthetic%20with%20smooth%20gradients%2C%20subtle%20neon%20purple%20reflections%20on%20surfaces%2C%20photorealistic%203D%20render%2C%20cinematic%20soft%20lighting%2C%20premium%20tech%20product%20visualization%2C%20clean%20modern%20interior%20with%20minimal%20furniture%2C%20the%20tablet%20screen%20shows%20a%20beautiful%20dark-themed%20home%20automation%20dashboard%20with%20room%20tiles%20and%20device%20status%20indicators&width=800&height=500&seq=homaura-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'HomAura homepage preview showing smart home management platform with IoT device control and home automation dashboard',
    homepageUrl: 'https://homaura.uk',
    previewStatus: 'real',
    filterGroup: 'featured',
  },
  {
    name: 'DataHarbour',
    category: 'Data',
    categories: ['Data'],
    description: 'Data intelligence and packaged insight platform with controlled data operations and administrative systems.',
    status: 'Prototype',
    color: '#0891B2',
    icon: 'ri-database-2-line',
    href: '/products/dataharbour',
    homepagePreview: 'https://readdy.ai/api/search-image?query=A%20sophisticated%20data%20intelligence%20platform%20interface%20displayed%20on%20a%20large%20curved%20monitor%20in%20a%20modern%20corporate%20office%20with%20cool%20cyan%20and%20teal%20ambient%20lighting%2C%20the%20dashboard%20shows%20flowing%20data%20visualisations%2C%20analytics%20charts%2C%20insight%20panels%20and%20real-time%20data%20streams%20with%20a%20dark%20premium%20UI%20design%2C%20sleek%20and%20professional%20data%20technology%20aesthetic%20with%20glassmorphism%20elements%20and%20smooth%20gradients%2C%20subtle%20reflections%20on%20the%20glossy%20desk%20surface%2C%20photorealistic%203D%20render%2C%20cinematic%20dramatic%20lighting%2C%20high-end%20enterprise%20software%20visualization%2C%20the%20screen%20displays%20a%20beautiful%20dark-themed%20analytics%20dashboard%20with%20interactive%20data%20graphs%20and%20intelligence%20metrics&width=800&height=500&seq=dataharbour-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'DataHarbour homepage preview showing data intelligence platform with analytics dashboards and real-time data visualisations',
    homepageUrl: 'https://dataharbour.uk',
    previewStatus: 'real',
    filterGroup: 'featured',
  },
  {
    name: 'FisheryHub',
    category: 'Leisure',
    categories: ['SaaS', 'Ecommerce'],
    description: 'Fishing-lake management and booking platform with owner tools, maps, swims, memberships, QR check-in and catch reporting.',
    status: 'In Development',
    color: '#06B6D4',
    icon: 'ri-anchor-line',
    href: '/products/fisheryhub',
    homepagePreview: 'https://readdy.ai/api/search-image?query=A%20serene%20fishing%20lake%20management%20platform%20interface%20displayed%20on%20a%20modern%20tablet%20resting%20on%20a%20wooden%20bench%20beside%20a%20peaceful%20lakeside%20at%20dawn%20with%20soft%20cyan%20blue%20ambient%20lighting%2C%20the%20dashboard%20shows%20detailed%20lake%20maps%20with%20fishing%20swims%20marked%2C%20booking%20calendars%20and%20catch%20reports%20with%20a%20dark%20glassmorphism%20UI%20design%2C%20tranquil%20outdoor%20nature%20aesthetic%20blended%20with%20modern%20technology%2C%20misty%20calm%20lake%20water%20in%20the%20background%20with%20subtle%20cyan%20reflections%20on%20the%20surface%2C%20photorealistic%203D%20render%2C%20cinematic%20warm%20golden%20lighting%20on%20the%20device%20screen%20contrasting%20with%20cool%20blue%20surroundings%2C%20premium%20leisure%20technology%20product%20visualization%2C%20detailed%20UI%20mockup%20with%20fishing%20statistics%20and%20lake%20occupancy%20panels%20on%20a%20dark%20background&width=800&height=500&seq=fisheryhub-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'FisheryHub homepage preview showing fishing lake management platform with lake maps, swim bookings and catch reporting dashboard',
    homepageUrl: 'https://fisheryhub.uk',
    previewStatus: 'real',
    filterGroup: 'companies',
  },
  {
    name: 'Homvia',
    category: 'Property',
    categories: ['AI and Automation', 'Property'],
    description: 'AI-assisted home-improvement planning, tradesperson matching, project management, staged payments and homeowner support.',
    status: 'Prototype',
    color: '#D97706',
    icon: 'ri-tools-line',
    href: '/products/homvia',
    homepagePreview: 'https://readdy.ai/api/search-image?query=An%20AI-powered%20home%20improvement%20platform%20interface%20displayed%20on%20a%20laptop%20in%20a%20modern%20home%20renovation%20space%20with%20warm%20amber%20and%20orange%20ambient%20lighting%2C%20the%20dashboard%20shows%20tradesperson%20profiles%20with%20ratings%2C%20project%20timelines%20with%20progress%20bars%2C%20cost%20estimates%20and%20renovation%20checklists%20with%20a%20dark%20premium%20UI%20design%2C%20contemporary%20construction%20meets%20technology%20aesthetic%20with%20smooth%20gradients%20and%20glassmorphism%20elements%2C%20subtle%20warm%20reflections%20on%20polished%20concrete%20surfaces%2C%20exposed%20brick%20wall%20in%20the%20background%2C%20photorealistic%203D%20render%2C%20cinematic%20dramatic%20side%20lighting%2C%20high-end%20home%20renovation%20software%20visualization%2C%20the%20screen%20displays%20a%20beautiful%20dark-themed%20project%20management%20dashboard%20with%20before-and-after%20image%20galleries&width=800&height=500&seq=homvia-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'Homvia homepage preview showing AI home improvement platform with tradesperson matching and project management dashboard',
    homepageUrl: 'https://homvia.uk',
    previewStatus: 'real',
    filterGroup: 'companies',
  },
  {
    name: 'HotDesk Hub',
    category: 'SaaS',
    categories: ['SaaS', 'Smart Buildings'],
    description: 'Workplace desk-management SaaS with QR and NFC access, floorplans, occupancy intelligence and workplace systems.',
    status: 'Concept Development',
    color: '#0D9488',
    icon: 'ri-layout-grid-line',
    href: '/products/hotdesk-hub',
    homepagePreview: 'https://readdy.ai/api/search-image?query=A%20modern%20workplace%20desk%20management%20platform%20interface%20displayed%20on%20a%20large%20wall-mounted%20screen%20in%20a%20sleek%20co-working%20office%20with%20teal%20and%20emerald%20ambient%20lighting%2C%20the%20dashboard%20shows%20interactive%20floor%20plans%20with%20desk%20availability%20maps%20in%20green%20and%20red%2C%20QR%20check-in%20panels%20and%20real-time%20occupancy%20analytics%20with%20a%20dark%20glassmorphism%20UI%20design%2C%20contemporary%20smart%20building%20aesthetic%20with%20smooth%20gradients%20and%20clean%20architectural%20lines%2C%20subtle%20teal%20reflections%20on%20glass%20walls%20and%20polished%20surfaces%2C%20modern%20office%20furniture%20in%20the%20background%2C%20photorealistic%203D%20render%2C%20cinematic%20professional%20lighting%2C%20premium%20workspace%20technology%20product%20visualization%2C%20the%20screen%20displays%20a%20beautiful%20dark-themed%20workplace%20dashboard%20with%20heatmap%20visualisations%20and%20desk%20booking%20tiles&width=800&height=500&seq=hotdesk-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'HotDesk Hub homepage preview showing workplace desk management platform with floor plans and occupancy intelligence dashboard',
    homepageUrl: 'https://hotdeskhub.uk',
    previewStatus: 'real',
    filterGroup: 'companies',
  },
  {
    name: 'BivvyBox',
    category: 'Ecommerce',
    categories: ['Ecommerce'],
    description: 'Specialist carp-fishing ecommerce and membership ecosystem with loyalty, content and customer data tools.',
    status: 'Concept Development',
    color: '#6366F1',
    icon: 'ri-shopping-bag-3-line',
    href: '/products/bivvybox',
    homepagePreview: 'https://readdy.ai/api/search-image?query=A%20premium%20carp%20fishing%20ecommerce%20platform%20interface%20displayed%20on%20a%20smartphone%20resting%20on%20a%20fishing%20tackle%20box%20in%20an%20outdoor%20lakeside%20setting%20with%20moody%20indigo%20and%20deep%20blue%20ambient%20lighting%2C%20the%20storefront%20shows%20fishing%20tackle%20products%20with%20high-quality%20images%2C%20membership%20tier%20cards%2C%20catch%20reporting%20gallery%20and%20loyalty%20reward%20badges%20with%20a%20dark%20premium%20UI%20design%2C%20nature%20meets%20technology%20aesthetic%20with%20smooth%20gradients%20and%20glassmorphism%20elements%2C%20subtle%20indigo%20reflections%20on%20wet%20surfaces%20and%20fishing%20gear%2C%20early%20morning%20fishing%20scene%20with%20soft%20mist%20over%20calm%20water%2C%20photorealistic%203D%20render%2C%20cinematic%20atmospheric%20lighting%2C%20premium%20outdoor%20retail%20technology%20product%20visualization%2C%20the%20phone%20screen%20displays%20a%20beautiful%20dark-themed%20ecommerce%20storefront%20with%20product%20categories%20and%20membership%20benefits%20panels&width=800&height=500&seq=bivvybox-homepage-001&orientation=landscape',
    homepagePreviewAlt: 'BivvyBox homepage preview showing specialist carp fishing ecommerce platform with product storefront and membership dashboard',
    homepageUrl: 'https://bivvybox.uk',
    previewStatus: 'real',
    filterGroup: 'companies',
  },
  {
    name: 'RackFlow',
    category: 'Robotics',
    categories: ['Robotics', 'Internal Systems'],
    description: 'Retrofit warehouse automation concept combining autonomous picking robots, local AI control and modular deployment.',
    status: 'Concept Development',
    color: '#DC2626',
    icon: 'ri-cpu-line',
    previewStatus: 'coming-soon',
    filterGroup: 'ai',
  },
  {
    name: 'ChairDock AI',
    category: 'Robotics',
    categories: ['AI and Automation', 'Robotics', 'Smart Buildings'],
    description: 'Personal ergonomic chair storage, retrieval, cleaning and setup system for hot-desk offices.',
    status: 'Concept Development',
    color: '#CA8A04',
    icon: 'ri-archive-line',
    previewStatus: 'coming-soon',
    filterGroup: 'ai',
  },
  {
    name: 'DriveDrop AI',
    category: 'Robotics',
    categories: ['AI and Automation', 'Robotics', 'Ecommerce'],
    description: 'AI voice ordering and automated drive-through delivery system using smart bays and an overhead delivery rail.',
    status: 'Concept Development',
    color: '#9333EA',
    icon: 'ri-car-line',
    previewStatus: 'coming-soon',
    filterGroup: 'ai',
  },
];

const portfolioFilters = [
  { key: 'featured', label: 'Featured' },
  { key: 'companies', label: 'Companies & Platforms' },
  { key: 'ai', label: 'AI & Innovation' },
];

const pipelineStages = [
  { label: 'Concept', count: 6, color: '#94A3B8' },
  { label: 'Prototype', count: 2, color: '#F59E0B' },
  { label: 'Development', count: 5, color: '#3B82F6' },
  { label: 'Testing', count: 0, color: '#10B981' },
  { label: 'Launch', count: 0, color: '#06B6D4' },
];

export default function FeaturedProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('featured');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filtered = projects.filter((p) => p.filterGroup === activeFilter);

  return (
    <section id="featured-projects" className="py-24 px-6 bg-[#060F1E] relative overflow-hidden" style={{ scrollMarginTop: '5rem' }}>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(6,182,212,0.04) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold tracking-[0.25em] text-[#F97316] uppercase mb-4 block">
            THE DFP PORTFOLIO
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Built through Digital Footprint
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            A growing portfolio of SaaS companies, AI systems and technology ventures—designed, developed and operated through our CDD process.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          {[
            { value: '13', label: 'Ventures' },
            { value: '8', label: 'Digital Platforms' },
            { value: '5', label: 'Intelligent Systems' },
            { value: '3', label: 'Active Stages' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="flex justify-center gap-2 mb-10" role="group" aria-label="Filter portfolio projects">
          {portfolioFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              aria-pressed={activeFilter === f.key}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2 focus:ring-offset-[#060F1E] ${
                activeFilter === f.key
                  ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/25'
                  : 'text-slate-400 border border-white/[0.06] hover:text-white hover:border-white/[0.15] bg-white/[0.02]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
          {filtered.map((project, i) => {
            const isHighlighted = hoveredCard === project.name;

            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredCard(project.name)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative rounded-2xl border transition-all duration-500 cursor-pointer focus-within:ring-2 focus-within:ring-[#06B6D4] focus-within:ring-offset-2 focus-within:ring-offset-[#060F1E] ${
                  isHighlighted
                    ? 'border-white/[0.12] bg-white/[0.02] -translate-y-1.5 shadow-xl shadow-black/25 ring-1 ring-white/[0.06]'
                    : 'border-white/[0.05] bg-white/[0.01]'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 rounded-t-2xl transition-all duration-500"
                  style={{
                    background: isHighlighted ? project.color : 'transparent',
                    height: isHighlighted ? '2px' : '1px',
                    boxShadow: isHighlighted ? `0 0 12px ${project.color}40` : 'none',
                  }}
                />

                {isHighlighted && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                    <div
                      className="absolute inset-0 transition-all duration-1000"
                      style={{
                        background: `linear-gradient(105deg, transparent 35%, ${project.color}06 47%, ${project.color}0D 50%, ${project.color}06 53%, transparent 65%)`,
                      }}
                    />
                  </div>
                )}

                {project.previewStatus === 'real' && project.homepagePreview ? (
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-2xl bg-[#0A1628]">
                    <img
                      src={project.homepagePreview}
                      alt={project.homepagePreviewAlt || ''}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-all duration-700"
                      style={{
                        filter: isHighlighted ? 'brightness(1.05) saturate(1.02)' : 'brightness(0.95) saturate(0.95)',
                        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(to bottom, transparent 65%, rgba(6,15,30,0.35) 100%)',
                        opacity: isHighlighted ? 0.2 : 0.45,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="relative w-full aspect-[16/10] overflow-hidden rounded-t-2xl flex flex-col items-center justify-center gap-2.5"
                    style={{ backgroundColor: `${project.color}08` }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500"
                      style={{
                        backgroundColor: `${project.color}12`,
                        transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <i
                        className={`${project.icon} text-2xl w-7 h-7 flex items-center justify-center`}
                        style={{ color: project.color }}
                      />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-semibold text-white/80 mb-0.5">{project.name}</p>
                      <p className="text-[11px] text-slate-400">Homepage preview coming soon</p>
                    </div>
                  </div>
                )}

                <div className="p-6 relative z-10">
                  {project.href ? (
                    <Link
                      href={project.href}
                      className="block focus:outline-none"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
                            style={{
                              backgroundColor: isHighlighted ? `${project.color}20` : `${project.color}10`,
                              boxShadow: isHighlighted ? `0 0 16px ${project.color}15` : 'none',
                              transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            <i className={`${project.icon} text-lg w-5 h-5 flex items-center justify-center`} style={{ color: project.color }} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{project.name}</h4>
                            <span className="text-[10px] font-medium text-slate-400">
                              {project.status}
                            </span>
                          </div>
                        </div>
                        <i className={`ri-arrow-right-up-line text-lg w-5 h-5 flex items-center justify-center transition-all duration-400 ${
                          isHighlighted ? 'text-[#06B6D4] translate-x-0.5 -translate-y-0.5' : 'text-slate-600'
                        }`} />
                      </div>

                      <p className={`text-sm leading-relaxed mb-4 transition-colors duration-500 ${
                        isHighlighted ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        {project.description}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
                            style={{
                              backgroundColor: isHighlighted ? `${project.color}20` : `${project.color}10`,
                              boxShadow: isHighlighted ? `0 0 16px ${project.color}15` : 'none',
                              transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            <i className={`${project.icon} text-lg w-5 h-5 flex items-center justify-center`} style={{ color: project.color }} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{project.name}</h4>
                            <span className="text-[10px] font-medium text-slate-400">
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed mb-4 transition-colors duration-500 ${
                        isHighlighted ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        {project.description}
                      </p>
                    </>
                  )}

                  {project.homepageUrl && (
                    <a
                      href={project.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-opacity hover:opacity-80"
                      style={{ color: project.color }}
                    >
                      Visit Live Site
                      <i className="ri-external-link-line w-3.5 h-3.5 flex items-center justify-center" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No projects match this filter yet.</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide text-center mb-6">
              Development Pipeline
            </h3>
            <div className="flex items-end gap-3">
              {pipelineStages.map((stage) => (
                <div key={stage.label} className="flex-1 text-center">
                  <div className="text-lg font-bold text-white mb-1">{stage.count}</div>
                  <div className="relative w-full h-2 rounded-full bg-white/[0.04] mb-2 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(stage.count / 13) * 100}%`,
                        minWidth: stage.count > 0 ? '8px' : '0px',
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{stage.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            href="/products"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden whitespace-nowrap cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] hover:-translate-y-0.5 shadow-lg shadow-[#F97316]/15 hover:shadow-xl hover:shadow-[#F97316]/25 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 focus:ring-offset-[#060F1E]"
          >
            <span className="relative z-10">Explore the Full Portfolio</span>
            <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center relative z-10 group-hover:translate-x-0.5 transition-transform duration-200" />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}