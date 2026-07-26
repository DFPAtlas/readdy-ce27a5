'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { demoFormatConfig, demoStatusConfig } from '@/lib/cms-definitions';

interface DemoDetailData {
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
  demo_asset_id: string | null;
  thumbnail_asset_id: string | null;
  video_asset_id: string | null;
  sandbox_url: string | null;
  tour_definition: Record<string, unknown>[] | null;
  screenshot_sequence: Record<string, unknown>[] | null;
  access_method: string | null;
  primary_cta: string | null;
  request_form_enabled: boolean;
  instructions: string | null;
  limitations: string | null;
  privacy_notice: string | null;
}

interface ProductRef {
  id: string;
  product_name: string;
  slug: string;
  short_description: string | null;
}

export default function DemoDetail({ slug }: { slug: string }) {
  const [demo, setDemo] = useState<DemoDetailData | null>(null);
  const [product, setProduct] = useState<ProductRef | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [imageExpanded, setImageExpanded] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: d, error } = await supabase
        .from('demo_registry')
        .select('*')
        .eq('slug', slug)
        .in('public_visibility', ['Public demo', 'Public preview'])
        .in('demo_status', ['Public demo', 'Public preview'])
        .is('archived_at', null)
        .maybeSingle();

      if (cancelled) return;
      if (error || !d) { setNotFound(true); setLoading(false); return; }

      const demoData = d as DemoDetailData;
      setDemo(demoData);

      if (demoData.product_id) {
        const { data: p } = await supabase
          .from('product_registry')
          .select('id,product_name,slug,short_description')
          .eq('id', demoData.product_id)
          .maybeSingle();
        if (!cancelled) setProduct(p as ProductRef | null);
      }

      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !demo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <i className="ri-video-off-line w-16 h-16 text-slate-300 mx-auto mb-4 flex items-center justify-center" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Demo Not Found</h1>
          <p className="text-slate-500 mb-6">This demo may have been removed or is not yet available publicly.</p>
          <Link href="/demos" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06B6D4] text-white text-sm font-medium hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center" />
            Back to Demo Centre
          </Link>
        </div>
      </div>
    );
  }

  const fmt = demoFormatConfig[demo.demo_format] || { label: demo.demo_format, icon: 'ri-information-line', color: '#94A3B8' };
  const sc = demoStatusConfig[demo.demo_status] || { label: demo.demo_status, color: '#94A3B8' };
  const tourSteps = demo.tour_definition || [];
  const screenshots = demo.screenshot_sequence || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">
        <Link href="/demos" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6 cursor-pointer">
          <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center" />
          Demo Centre
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${sc.color}15`, color: sc.color }}>
              {sc.label}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              <i className={`${fmt.icon} w-3.5 h-3.5 flex items-center justify-center`} />
              {fmt.label}
            </span>
            {demo.estimated_duration && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
                <i className="ri-time-line w-3.5 h-3.5 flex items-center justify-center" />
                {demo.estimated_duration}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{demo.demo_name}</h1>
          {product && (
            <Link href={`/products/${product.slug}`} className="text-sm text-[#06B6D4] hover:text-[#0891B2] font-medium cursor-pointer">
              {product.product_name} →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {demo.short_description && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">What this demo covers</h2>
                <p className="text-slate-600 leading-relaxed">{demo.short_description}</p>
              </div>
            )}

            {demo.target_audience && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Who it&apos;s for</h2>
                <p className="text-slate-600">{demo.target_audience}</p>
              </div>
            )}

            {demo.demo_format === 'guided_product_tour' && tourSteps.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Guided Tour</h2>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-medium text-slate-500">
                      Step {tourStep + 1} of {tourSteps.length}
                    </span>
                    <div className="flex gap-1">
                      {tourSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${i === tourStep ? 'bg-[#06B6D4] w-4' : 'bg-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    {(() => {
                      const step = tourSteps[tourStep] as Record<string, unknown>;
                      return (
                        <div>
                          <h3 className="text-base font-bold text-slate-900 mb-2">{String(step.heading || `Step ${tourStep + 1}`)}</h3>
                          {step.description != null && <p className="text-sm text-slate-500 mb-4">{String(step.description)}</p>}
                          {step.image_url != null && (
                            <img
                              src={String(step.image_url)}
                              alt={String(step.heading || '')}
                              className="w-full rounded-xl border border-slate-200"
                            />
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setTourStep(Math.max(0, tourStep - 1))}
                      disabled={tourStep === 0}
                      className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setTourStep(0)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => setTourStep(Math.min(tourSteps.length - 1, tourStep + 1))}
                      disabled={tourStep === tourSteps.length - 1}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-[#06B6D4] text-white hover:bg-[#0891B2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {demo.demo_format === 'recorded_video' && demo.video_asset_id && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Recorded Demonstration</h2>
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <video
                    src={demo.video_asset_id}
                    poster={demo.thumbnail_asset_id || undefined}
                    controls
                    className="w-full aspect-video"
                    controlsList="nodownload"
                  >
                    <p className="text-slate-400 text-sm p-4">Video preview is currently unavailable. Please check back later or request a live demo.</p>
                  </video>
                </div>
              </div>
            )}

            {demo.demo_format === 'screenshot_walkthrough' && screenshots.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Screenshot Walkthrough</h2>
                <div className="space-y-6">
                  {screenshots.map((ss, i) => {
                    const s = ss as Record<string, unknown>;
                    return (
                      <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        {s.image_url != null && (
                          <div
                            className="relative cursor-pointer overflow-hidden"
                            onClick={() => setImageExpanded(imageExpanded === i ? null : i)}
                          >
                            <img
                              src={String(s.image_url)}
                              alt={String(s.alt_text || `Screenshot ${i + 1}`)}
                              className={`w-full transition-all duration-300 ${imageExpanded === i ? 'scale-105' : ''}`}
                            />
                            <div className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center">
                              <i className={`${imageExpanded === i ? 'ri-zoom-out-line' : 'ri-zoom-in-line'} w-4 h-4 text-white flex items-center justify-center`} />
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          {s.caption != null && <p className="text-sm font-medium text-slate-800 mb-1">{String(s.caption)}</p>}
                          {s.alt_text != null && <p className="text-xs text-slate-400">{String(s.alt_text)}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {demo.instructions && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Instructions</h2>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <p className="text-sm text-slate-600 whitespace-pre-line">{demo.instructions}</p>
                </div>
              </div>
            )}

            {demo.limitations && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Limitations</h2>
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <p className="text-sm text-amber-800 whitespace-pre-line">{demo.limitations}</p>
                </div>
              </div>
            )}

            {demo.privacy_notice && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Data & Privacy Notice</h2>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <p className="text-sm text-slate-500 whitespace-pre-line">{demo.privacy_notice}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sticky top-28">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Availability</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="text-sm font-medium" style={{ color: sc.color }}>{sc.label}</span>
                </div>
                {demo.access_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Access</span>
                    <span className="text-sm font-medium text-slate-700">{demo.access_method}</span>
                  </div>
                )}
                {demo.target_audience && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Audience</span>
                    <span className="text-sm font-medium text-slate-700 text-right max-w-[160px]">{demo.target_audience}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2">
                {demo.request_form_enabled && (
                  <Link
                    href={`/request-demo?product=${product?.slug || ''}&demo=${demo.slug}`}
                    className="block w-full text-center px-5 py-3 rounded-xl bg-[#06B6D4] text-white font-semibold text-sm hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Request a Live Demo
                  </Link>
                )}
                {product && (
                  <Link
                    href={`/products/${product.slug}`}
                    className="block w-full text-center px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View Product Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to get started?</h2>
          <p className="text-slate-500 mb-5">Talk to our team about how this product can work for your business.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            Contact Digital Footprint
            <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center" />
          </Link>
        </div>
      </div>
    </div>
  );
}