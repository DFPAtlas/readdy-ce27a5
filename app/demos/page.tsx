'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import { demoFormatConfig, demoStatusConfig } from '@/lib/cms-definitions';

interface DemoItem {
  id: string;
  product_id: string | null;
  demo_name: string;
  slug: string;
  short_description: string | null;
  demo_format: string;
  demo_status: string;
  public_visibility: string;
  target_audience: string | null;
  estimated_duration: string | null;
  thumbnail_asset_id: string | null;
  is_featured: boolean;
  featured_sort_order: number;
  sort_order: number;
}

interface ProductRef {
  id: string;
  product_name: string;
  slug: string;
}

const FORMAT_FILTERS = [
  { key: 'all', label: 'All Formats' },
  { key: 'guided_product_tour', label: 'Guided Tours' },
  { key: 'screenshot_walkthrough', label: 'Screenshot Walkthroughs' },
  { key: 'recorded_video', label: 'Recorded Videos' },
  { key: 'interactive_sandbox', label: 'Interactive Sandboxes' },
  { key: 'live_demonstration_request', label: 'Live Demos' },
];

const AVAILABILITY_FILTERS = [
  { key: 'all', label: 'All Availability' },
  { key: 'public', label: 'Public Demos' },
  { key: 'preview', label: 'Public Previews' },
];

export default function DemosPage() {
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [products, setProducts] = useState<Map<string, ProductRef>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [{ data: demoData }, { data: prodData }] = await Promise.all([
        supabase.from('demo_registry').select('id,product_id,demo_name,slug,short_description,demo_format,demo_status,public_visibility,target_audience,estimated_duration,thumbnail_asset_id,is_featured,featured_sort_order,sort_order').in('public_visibility', ['Public demo', 'Public preview']).in('demo_status', ['Public demo', 'Public preview']).is('archived_at', null).order('sort_order'),
        supabase.from('product_registry').select('id,product_name,slug').in('public_visibility', ['Public']),
      ]);
      if (cancelled) return;
      setDemos((demoData || []) as DemoItem[]);
      const pMap = new Map<string, ProductRef>();
      (prodData || []).forEach((p: any) => pMap.set(p.id, p));
      setProducts(pMap);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredDemos = useMemo(() => {
    let result = [...demos];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.demo_name.toLowerCase().includes(q) ||
        (d.short_description || '').toLowerCase().includes(q) ||
        (d.target_audience || '').toLowerCase().includes(q)
      );
    }

    if (formatFilter !== 'all') {
      result = result.filter(d => d.demo_format === formatFilter);
    }

    if (availabilityFilter === 'public') {
      result = result.filter(d => d.demo_status === 'Public demo');
    } else if (availabilityFilter === 'preview') {
      result = result.filter(d => d.public_visibility === 'Public preview');
    }

    if (sortBy === 'featured') {
      result.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return (a.featured_sort_order || 0) - (b.featured_sort_order || 0);
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.demo_name.localeCompare(b.demo_name));
    } else if (sortBy === 'duration') {
      result.sort((a, b) => (a.estimated_duration || '').localeCompare(b.estimated_duration || ''));
    }

    return result;
  }, [demos, search, formatFilter, availabilityFilter, sortBy]);

  const featuredDemos = filteredDemos.filter(d => d.is_featured);
  const otherDemos = filteredDemos.filter(d => !d.is_featured);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <p className="text-sm font-semibold text-[#06B6D4] uppercase tracking-wider mb-3">Demo Centre</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Explore Digital Footprint Products</h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Watch recorded demos, browse screenshot walkthroughs, or request a live demonstration of any Digital Footprint product.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 flex items-center justify-center" />
            <input
              type="text"
              placeholder="Search demos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {FORMAT_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFormatFilter(f.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  formatFilter === f.key ? 'bg-[#06B6D4] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {AVAILABILITY_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setAvailabilityFilter(f.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  availabilityFilter === f.key ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 focus:outline-none cursor-pointer pr-8"
          >
            <option value="featured">Featured First</option>
            <option value="name">Name A-Z</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl bg-slate-50 border border-slate-100 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-full mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDemos.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-video-off-line w-12 h-12 text-slate-300 mx-auto mb-4 flex items-center justify-center" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No demos found</h3>
            <p className="text-slate-400 text-sm mb-4">
              {demos.length === 0 ? 'Demos will appear here once published. Check back soon.' : 'Try adjusting your search or filters.'}
            </p>
            {(search || formatFilter !== 'all' || availabilityFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFormatFilter('all'); setAvailabilityFilter('all'); }}
                className="px-5 py-2.5 rounded-xl bg-[#06B6D4] text-white text-sm font-medium hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {featuredDemos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <i className="ri-star-fill w-5 h-5 text-[#06B6D4] flex items-center justify-center" />
                  <h2 className="text-lg font-bold text-slate-900">Featured Demos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredDemos.map(demo => (
                    <DemoCard key={demo.id} demo={demo} product={demo.product_id ? products.get(demo.product_id) : undefined} />
                  ))}
                </div>
              </div>
            )}

            {otherDemos.length > 0 && (
              <div>
                {featuredDemos.length > 0 && (
                  <h2 className="text-lg font-bold text-slate-900 mb-5">All Demos</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherDemos.map(demo => (
                    <DemoCard key={demo.id} demo={demo} product={demo.product_id ? products.get(demo.product_id) : undefined} />
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-slate-400 text-center pt-4">
              Showing {filteredDemos.length} demo{filteredDemos.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Need a tailored demonstration?</h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">
            Not sure which product fits your needs? Request a personalised walkthrough with our team.
          </p>
          <Link
            href="/request-demo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06B6D4] text-white font-semibold text-sm hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap"
          >
            Request a Live Demo
            <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DemoCard({ demo, product }: { demo: DemoItem; product?: ProductRef }) {
  const fmt = demoFormatConfig[demo.demo_format] || { label: demo.demo_format, icon: 'ri-information-line', color: '#94A3B8' };
  const sc = demoStatusConfig[demo.demo_status] || { label: demo.demo_status, color: '#94A3B8' };

  return (
    <Link
      href={`/demos/${demo.slug}`}
      className="group block bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#06B6D4]/30 hover:shadow-lg hover:shadow-[#06B6D4]/5 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-3">
        <i className={`${fmt.icon} w-4 h-4 flex items-center justify-center`} style={{ color: fmt.color }} />
        <span className="text-xs font-medium" style={{ color: fmt.color }}>{fmt.label}</span>
        <span
          className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{ backgroundColor: `${sc.color}15`, color: sc.color }}
        >
          {sc.label}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-[#06B6D4] transition-colors">
        {demo.demo_name}
      </h3>

      {product && (
        <p className="text-xs text-[#06B6D4] font-medium mb-2">{product.product_name}</p>
      )}

      <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
        {demo.short_description || 'No description available.'}
      </p>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        {demo.target_audience && (
          <span className="flex items-center gap-1">
            <i className="ri-user-line w-3 h-3 flex items-center justify-center" />
            {demo.target_audience}
          </span>
        )}
        {demo.estimated_duration && (
          <span className="flex items-center gap-1 ml-auto">
            <i className="ri-time-line w-3 h-3 flex items-center justify-center" />
            {demo.estimated_duration}
          </span>
        )}
      </div>
    </Link>
  );
}