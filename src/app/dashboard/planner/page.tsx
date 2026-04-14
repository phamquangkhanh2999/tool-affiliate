'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDbProducts } from '@/hooks/useProducts';

interface DayPlan {
  day: number; dayLabel: string;
  videos: { slot: 1 | 2; time: string; type: string; hook: string; idea: string; goal: string; platform: string[] }[];
  dailyGoal: string; tip: string;
}
interface ContentPlanResult { summary: string; strategy: string; days: DayPlan[]; weekGoals: string[] }

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  shock:            { icon: '⚡', color: 'var(--red)',    bg: 'rgba(239,68,68,0.1)' },
  curiosity:        { icon: '🤔', color: 'var(--purple)', bg: 'rgba(124,58,237,0.1)' },
  problem_solution: { icon: '💡', color: 'var(--blue)',   bg: 'rgba(59,130,246,0.1)' },
  review:           { icon: '⭐', color: 'var(--green)',  bg: 'rgba(16,185,129,0.1)' },
  unboxing:         { icon: '📦', color: 'var(--orange)', bg: 'rgba(255,107,53,0.1)' },
  story:            { icon: '📖', color: 'var(--purple)', bg: 'rgba(124,58,237,0.1)' },
};
const GOAL_COLORS: Record<string, string> = {
  'Test hook': 'var(--blue)', 'Build awareness': 'var(--green)',
  'Drive conversion': 'var(--orange)', 'Viral push': 'var(--red)',
  'Build trust': 'var(--green)',
};
const PLATFORM_ICONS: Record<string, string> = { tiktok: '🎵', facebook: '📘', instagram: '📸', youtube: '▶️' };

function PlannerStudio() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(searchParams.get('productId') || '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentPlanResult | null>(null);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  const { products: dbProducts } = useDbProducts();

  function selectProduct(id: string) {
    setSelectedId(id);
    const p = dbProducts.find(p => p.shopeeItemId === id);
    if (!p) return;
    setName(p.name); setPrice(p.originalPrice.toString());
    setDiscountedPrice(p.discountedPrice.toString());
    setCommissionRate(p.commissionRate.toString());
    setCategory(p.category);
  }

  useEffect(() => {
    const id = searchParams.get('productId');
    if (id && dbProducts.length > 0) selectProduct(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbProducts]);

  async function handleGenerate() {
    if (!name.trim()) return setError('Vui lòng nhập tên sản phẩm');
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/content/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, price: parseFloat(price) || 0, discountedPrice: parseFloat(discountedPrice) || 0, commissionRate: parseFloat(commissionRate) || 0, category }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
      else setError(json.error || 'Lỗi tạo plan');
    } catch { setError('Không thể kết nối server'); }
    finally { setLoading(false); }
  }

  const activeDay_ = result?.days.find(d => d.day === activeDay);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 7-Day Content Plan</h1>
          <p className="page-subtitle">STEP 5 — Lịch đăng 7 ngày, 2 video/ngày — test angle & tìm video viral</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>📦 Sản phẩm</h2>
          <div className="form-group">
            <label className="label">Chọn nhanh</label>
            <select className="input select" value={selectedId} onChange={e => selectProduct(e.target.value)}>
              <option value="">-- Chọn --</option>
              {dbProducts.map(p => <option key={p.id} value={p.shopeeItemId}>{p.name.slice(0, 40)}... ({p.commissionRate}%)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Tên sản phẩm *</label>
            <input className="input" value={name} placeholder="Nhập tên..." onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="label">Giá gốc</label>
              <input type="number" className="input" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Giá sale</label>
              <input type="number" className="input" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Hoa hồng %</label>
              <input type="number" className="input" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Danh mục</label>
              <input className="input" value={category} onChange={e => setCategory(e.target.value)} />
            </div>
          </div>
          {error && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>❌ {error}</div>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} onClick={handleGenerate} disabled={loading}>
            {loading ? '📅 Đang tạo kế hoạch...' : '📅 Tạo kế hoạch 7 ngày'}
          </button>
        </div>

        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '70px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Đang tạo kế hoạch 7 ngày...</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>14 videos với hook, idea và goal cụ thể cho từng ngày</div>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state" style={{ padding: '80px' }}>
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">Sẵn sàng tạo kế hoạch</div>
              <div className="empty-state-text">14 videos, plan chi tiết từng ngày</div>
            </div>
          )}

          {result && (
            <>
              {/* Strategy Banner */}
              <div style={{
                padding: '14px 18px', marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(124,58,237,0.08))',
                border: '1px solid rgba(255,107,53,0.2)', borderRadius: '14px'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: '700', marginBottom: '4px' }}>📋 CHIẾN LƯỢC</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{result.strategy}</p>
              </div>

              {/* Week Goals */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {result.weekGoals.map((g, i) => (
                  <div key={i} style={{
                    padding: '6px 12px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontSize: '12px', color: 'var(--text-secondary)'
                  }}>
                    🎯 {g}
                  </div>
                ))}
              </div>

              {/* Day Selector */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', padding: '4px 0' }}>
                {result.days.map(d => (
                  <button
                    key={d.day}
                    onClick={() => setActiveDay(d.day)}
                    style={{
                      minWidth: '60px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer',
                      background: activeDay === d.day ? 'var(--gradient-brand)' : 'var(--bg-card)',
                      border: `1px solid ${activeDay === d.day ? 'transparent' : 'var(--border)'}`,
                      color: activeDay === d.day ? 'white' : 'var(--text-secondary)',
                      fontWeight: activeDay === d.day ? '700' : '400',
                      fontSize: '12px', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Ngày</div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{d.day}</div>
                  </button>
                ))}
              </div>

              {/* Active Day Detail */}
              {activeDay_ && (
                <div>
                  <div className="card" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{activeDay_.dayLabel}</h3>
                      <div style={{ padding: '4px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--green)' }}>
                        🎯 {activeDay_.dailyGoal}
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '0' }}>
                      💡 <strong>Tip:</strong> {activeDay_.tip}
                    </div>
                  </div>

                  {activeDay_.videos.map(video => {
                    const tc = TYPE_ICONS[video.type] || { icon: '🎬', color: 'var(--orange)', bg: 'rgba(255,107,53,0.1)' };
                    const goalColor = GOAL_COLORS[video.goal] || 'var(--text-muted)';
                    return (
                      <div key={video.slot} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: '14px', padding: '16px 18px', marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                              padding: '4px 12px', borderRadius: '8px',
                              background: 'var(--gradient-brand)', color: 'white',
                              fontSize: '12px', fontWeight: '700'
                            }}>
                              Video {video.slot} • {video.time}
                            </div>
                            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', background: tc.bg, color: tc.color, fontWeight: '600' }}>
                              {tc.icon} {video.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {video.platform.map(p => <span key={p} title={p}>{PLATFORM_ICONS[p] || '📱'}</span>)}
                            <span style={{ fontSize: '11px', color: goalColor, fontWeight: '600', marginLeft: '4px' }}>
                              → {video.goal}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          padding: '10px 14px', background: 'rgba(255,107,53,0.06)',
                          borderLeft: '3px solid var(--orange)', borderRadius: '0 8px 8px 0',
                          marginBottom: '10px'
                        }}>
                          <div style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: '700', marginBottom: '4px' }}>🎣 HOOK</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{video.hook}"</div>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                          {video.idea}
                        </div>

                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                          <a href={`/dashboard/scripts?productId=${selectedId}`} className="btn btn-sm btn-secondary">
                            🎬 Tạo Script
                          </a>
                          <a href={`/dashboard/content`} className="btn btn-sm btn-secondary">
                            📝 Tạo Caption
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function PlannerPage() {
  return <Suspense fallback={<div className="loading-spinner" />}><PlannerStudio /></Suspense>;
}
