'use client';

import { useState, useRef } from 'react';
import { motion } from '@/components/motion';
import Link from 'next/link';

interface Project {
  name: string;
  category: string;
  categories: string[];
  description: string;
  status: string;
  capabilities: string[];
  color: string;
  icon: string;
  href?: string;
  interfacePreview?: string;
}

const projects: Project[] = [
  {
    name: 'QuickGuard',
    category: 'Security',
    categories: ['SaaS', 'Security'],
    description: 'Temporary security staffing marketplace with guard accounts, client accounts, job posting, matching, subscriptions, compliance and payment workflows.',
    status: 'In Development',
    capabilities: ['Marketplace', 'Payments', 'Compliance', 'Matching', 'Staff Portals', 'Client Portals'],
    color: '#F97316',
    icon: 'ri-shield-check-line',
    href: '/products/quickguard',
  },
  {
    name: 'GuardianHub',
    category: 'Security',
    categories: ['SaaS', 'Security'],
    description: 'Security company operations platform covering rotas, patrols, incidents, compliance, client portals and guard operations.',
    status: 'In Development',
    capabilities: ['Operations', 'Rotas', 'Compliance', 'Portals', 'Incidents', 'Patrols'],
    color: '#10B981',
    icon: 'ri-building-line',
    href: '/products/guardianhub',
  },
  {
    name: 'LetHub',
    category: 'Property',
    categories: ['SaaS', 'Property'],
    description: 'Property and lettings operations platform with landlord, tenant and staff workflows, maintenance, documents, compliance and inspections.',
    status: 'In Development',
    capabilities: ['Property', 'Documents', 'Workflows', 'Portals', 'Compliance', 'Inspections'],
    color: '#2563EB',
    icon: 'ri-home-4-line',
    href: '/products/lethub',
  },
  {
    name: 'FisheryHub',
    category: 'Leisure',
    categories: ['SaaS', 'Ecommerce'],
    description: 'Fishing-lake management and booking platform with owner tools, maps, swims, memberships, QR check-in and catch reporting.',
    status: 'In Development',
    capabilities: ['Bookings', 'Maps', 'Memberships', 'QR', 'Check-In', 'Reporting'],
    color: '#06B6D4',
    icon: 'ri-anchor-line',
  },
  {
    name: 'Homora',
    category: 'Property',
    categories: ['SaaS', 'Smart Buildings', 'Property'],
    description: 'Smart-home platform and business ecosystem for monitoring, device support, third-party installation guidance and connected-home management.',
    status: 'Concept Development',
    capabilities: ['Smart Home', 'Monitoring', 'Support', 'Devices', 'Installation', 'Ecosystem'],
    color: '#7C3AED',
    icon: 'ri-home-wifi-line',
  },
  {
    name: 'Homvia',
    category: 'Property',
    categories: ['AI and Automation', 'Property'],
    description: 'AI-assisted home-improvement planning, tradesperson matching, project management, staged payments and homeowner support.',
    status: 'Prototype',
    capabilities: ['AI', 'Matching', 'Payments', 'Planning', 'Project Mgmt', 'Staged Payments'],
    color: '#D97706',
    icon: 'ri-tools-line',
  },
  {
    name: 'Corevia AI',
    category: 'AI',
    categories: ['AI and Automation', 'Internal Systems'],
    description: 'Private company AI workforce platform built from company documents, systems, workflows and internal knowledge.',
    status: 'In Development',
    capabilities: ['AI', 'Documents', 'Workflows', 'Private', 'Knowledge Base', 'Company AI'],
    color: '#EC4899',
    icon: 'ri-robot-line',
  },
  {
    name: 'DataHarbour',
    category: 'Data',
    categories: ['Data'],
    description: 'Data intelligence and packaged insight platform with controlled data operations and administrative systems.',
    status: 'Prototype',
    capabilities: ['Data', 'Analytics', 'Admin', 'Insights', 'Packaged Data', 'Operations'],
    color: '#0891B2',
    icon: 'ri-database-2-line',
  },
  {
    name: 'HotDesk Hub',
    category: 'SaaS',
    categories: ['SaaS', 'Smart Buildings'],
    description: 'Workplace desk-management SaaS with QR and NFC access, floorplans, occupancy intelligence and workplace systems.',
    status: 'Concept Development',
    capabilities: ['QR/NFC', 'Floorplans', 'Occupancy', 'SaaS', 'Access Control'],
    color: '#0D9488',
    icon: 'ri-layout-grid-line',
  },
  {
    name: 'BivvyBox',
    category: 'Ecommerce',
    categories: ['Ecommerce'],
    description: 'Specialist carp-fishing ecommerce and membership ecosystem with loyalty, content and customer data tools.',
    status: 'Concept Development',
    capabilities: ['Ecommerce', 'Membership', 'Content', 'Loyalty', 'Customer Data'],
    color: '#6366F1',
    icon: 'ri-shopping-bag-3-line',
  },
  {
    name: 'RackFlow',
    category: 'Robotics',
    categories: ['Robotics', 'Internal Systems'],
    description: 'Retrofit warehouse automation concept combining autonomous picking robots, local AI control and modular deployment.',
    status: 'Concept Development',
    capabilities: ['Robotics', 'AI', 'Warehouse', 'Modular', 'Autonomous'],
    color: '#DC2626',
    icon: 'ri-cpu-line',
  },
  {
    name: 'ChairDock AI',
    category: 'Robotics',
    categories: ['AI and Automation', 'Robotics', 'Smart Buildings'],
    description: 'Personal ergonomic chair storage, retrieval, cleaning and setup system for hot-desk offices.',
    status: 'Concept Development',
    capabilities: ['Robotics', 'AI', 'Office', 'Automation', 'Storage'],
    color: '#CA8A04',
    icon: 'ri-archive-line',
  },
  {
    name: 'DriveDrop AI',
    category: 'Robotics',
    categories: ['AI and Automation', 'Robotics', 'Ecommerce'],
    description: 'AI voice ordering and automated drive-through delivery system using smart bays and an overhead delivery rail.',
    status: 'Concept Development',
    capabilities: ['AI Voice', 'Delivery', 'Automation', 'Smart', 'Ordering'],
    color: '#9333EA',
    icon: 'ri-car-line',
  },
];

const filters = [
  'All', 'SaaS', 'AI and Automation', 'Security', 'Property',
  'Smart Buildings', 'Ecommerce', 'Data', 'Robotics', 'Internal Systems',
];

const statusStyles: Record<string, string> = {
  'Operational': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Preparing for Launch': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Testing': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'In Development': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Platform Build': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Prototype': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Internal System': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Concept Development': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Concept': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function FeaturedProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [filterAnnouncement, setFilterAnnouncement] = useState('');
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.categories.includes(activeFilter));

  const handleFilterChange = (f: string) => {
    setActiveFilter(f);
    setExpandedCard(null);
    const count = f === 'All' ? projects.length : projects.filter(p => p.categories.includes(f)).length;
    setFilterAnnouncement(`${count} project${count !== 1 ? 's' : ''} in ${f}`);
  };

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
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Companies and systems being built
          </h2>
          <h3 className="text-xl md:text-3xl font-bold text-[#06B6D4] tracking-tight mb-6">
            through Digital Footprint
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Explore SaaS platforms, marketplaces, AI systems, internal infrastructure and technology-enabled
            business concepts being shaped through the Digital Footprint CDD process.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-12" role="group" aria-label="Filter projects by category">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              aria-pressed={activeFilter === f}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2 focus:ring-offset-[#060F1E] ${
                activeFilter === f
                  ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                  : 'text-slate-400 border border-white/[0.06] hover:text-white hover:border-white/[0.15] bg-white/[0.02]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="sr-only" role="status" aria-live="polite">{filterAnnouncement}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, i) => {
            const isExpanded = expandedCard === project.name;
            const isHovered = hoveredCard === project.name;
            const isFocused = focusedCard === project.name;
            const isHighlighted = isHovered || isFocused;
            const statusClass = statusStyles[project.status] || statusStyles['Concept Development'];

            return (
              <motion.div
                key={project.name}
                ref={(el: HTMLDivElement | null) => { if (el) cardRefs.current.set(project.name, el); }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={() => setHoveredCard(project.name)}
                onMouseLeave={() => setHoveredCard(null)}
                onFocus={() => setFocusedCard(project.name)}
                onBlur={() => setFocusedCard(null)}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                aria-label={`${project.name} — ${project.status}. ${project.category}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedCard(isExpanded ? null : project.name);
                  }
                }}
                className={`group relative rounded-2xl border transition-all duration-500 cursor-pointer focus:outline-none ${
                  isExpanded
                    ? 'border-[#06B6D4]/30 bg-white/[0.04] shadow-lg shadow-[#06B6D4]/8'
                    : isHighlighted
                    ? 'border-white/[0.12] bg-white/[0.02] -translate-y-1.5 shadow-xl shadow-black/25 ring-1 ring-white/[0.06]'
                    : 'border-white/[0.05] bg-white/[0.01]'
                }`}
                style={{
                  transform: isHighlighted ? 'translateY(-6px)' : isExpanded ? 'translateY(0)' : 'translateY(0)',
                }}
                onClick={() => setExpandedCard(isExpanded ? null : project.name)}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-all duration-500"
                  style={{
                    background: isHighlighted || isExpanded ? project.color : 'transparent',
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

                <div className="p-6 relative z-10">
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
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <i
                      className={`ri-arrow-right-s-line text-lg w-5 h-5 flex items-center justify-center transition-all duration-400 ${
                        isExpanded
                          ? 'rotate-90 text-[#06B6D4]'
                          : isHighlighted
                          ? 'text-[#06B6D4] translate-x-1'
                          : 'text-slate-600'
                      }`}
                    />
                  </div>

                  <p className={`text-sm leading-relaxed mb-4 transition-colors duration-500 ${
                    isHighlighted ? 'text-slate-300' : 'text-slate-400'
                  }`}>
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all duration-300 ${
                          isHighlighted
                            ? 'bg-white/[0.05] text-slate-300 border-white/[0.08]'
                            : 'bg-white/[0.02] text-slate-500 border-white/[0.04]'
                        }`}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isExpanded ? 'max-h-56 opacity-100 mt-4 pt-4 border-t border-white/[0.06]' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Category:</span>
                        <span className="text-xs text-slate-300 font-medium">{project.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Stage:</span>
                        <span className="text-xs text-slate-300 font-medium">{project.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Connected to DF:</span>
                        <span className="text-xs text-[#06B6D4] font-medium">CDD Process</span>
                      </div>
                      {project.href ? (
                        <Link
                          href={project.href}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-opacity hover:opacity-80"
                          style={{ color: project.color }}
                        >
                          View Project Details
                          <i className="ri-arrow-right-line w-3.5 h-3.5 flex items-center justify-center" />
                        </Link>
                      ) : (
                        <p className="mt-2 text-xs text-slate-600 italic">
                          Case study in production
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No projects match this filter yet.</p>
            <button
              onClick={() => setActiveFilter('All')}
              className="mt-3 px-5 py-2 rounded-full text-sm font-medium text-[#06B6D4] border border-[#06B6D4]/20 hover:bg-[#06B6D4]/10 transition-all cursor-pointer whitespace-nowrap"
            >
              View all projects
            </button>
          </div>
        )}

        {filtered.length > 0 && (
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
        )}
      </div>
    </section>
  );
}