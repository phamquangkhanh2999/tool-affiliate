'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDbProducts } from '@/hooks/useProducts';

interface ContentAngle {
  id: number;
  title: string;
  type: 'shock' | 'curiosity' | 'problem_solution' | 'review';
  videoIdea: string;
  targetAudience: string;
  hook: string;
  viralScore: number;
  easyScore: number;
  conversionScore: number;
  platform: string[];
}

interface ContentStrategyResult {
  productSummary: string;
  angles: ContentAngle[];
  topPicks: number[];
}

const TYPE_CONFIG = {
  shock: {
    label: 'Shock',
    emoji: '⚡',
    color: 'var(--red)',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    badge: 'badge-red',
  },
  curiosity: {
    label: 'Curiosity',
    emoji: '🤔',
    color: 'var(--purple)',
    bg: 'rgba(124,58,237,0.1)',
    border: 'rgba(124,58,237,0.25)',
    badge: 'badge-purple',
  },
  problem_solution: {
    label: 'Problem-Solution',
    emoji: '💡',
    color: 'var(--blue)',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
    badge: 'badge-blue',
  },
  review: {
    label: 'Review',
    emoji: '⭐',
    color: 'var(--green)',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    badge: 'badge-green',
  },
};

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: '🎵',
  facebook: '📘',
  instagram: '📸',
  youtube: '▶️',
};

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '10px', fontWeight: '700', color }}>{value}</span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function AngleCard({ angle, isTopPick, index }: { angle: ContentAngle; isTopPick: boolean; index: number }) {
  const [expanded, setExpanded] = useState(isTopPick);
  const [copied, setCopied] = useState(false);
  const cfg = TYPE_CONFIG[angle.type];
  const totalScore = Math.round((angle.viralScore + angle.easyScore + angle.conversionScore) / 3);

  function copyHook() {
    navigator.clipboard.writeText(angle.hook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      background: isTopPick ? cfg.bg : 'var(--bg-card)',
      border: `1px solid ${isTopPick ? cfg.border : 'var(--border)'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Header */}
      <div
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Number */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          background: isTopPick ? cfg.color : 'var(--bg-secondary)',
          border: `1px solid ${isTopPick ? cfg.color : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '800',
          color: isTopPick ? 'white' : 'var(--text-muted)'
        }}>
          {angle.id}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            {isTopPick && (
              <span style={{
                fontSize: '10px', fontWeight: '800', color: cfg.color,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px'
              }}>
                ★ TOP PICK
              </span>
            )}
            <span className={`badge ${cfg.badge}`} style={{ fontSize: '11px' }}>
              {cfg.emoji} {cfg.label}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {angle.platform.map(p => (
                <span key={p} title={p} style={{ fontSize: '14px' }}>{PLATFORM_ICONS[p] || '📱'}</span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3' }}>
            {angle.title}
          </div>
        </div>

        {/* Score + Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: totalScore >= 70 ? 'rgba(16,185,129,0.15)' : totalScore >= 50 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${totalScore >= 70 ? 'rgba(16,185,129,0.3)' : totalScore >= 50 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '14px', fontWeight: '900',
              color: totalScore >= 70 ? 'var(--green)' : totalScore >= 50 ? 'var(--yellow)' : 'var(--red)'
            }}>{totalScore}</div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>AVG</div>
          </div>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          {/* Hook */}
          <div style={{
            margin: '14px 0', padding: '12px 14px',
            background: 'var(--bg-secondary)', borderRadius: '10px',
            borderLeft: `3px solid ${cfg.color}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                🎣 HOOK (3 GIÂY ĐẦU)
              </span>
              <button
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={copyHook}
              >
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: cfg.color, fontStyle: 'italic', lineHeight: '1.5' }}>
              "{angle.hook}"
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            {/* Video Idea */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                🎬 Ý TƯỞNG VIDEO
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {angle.videoIdea}
              </p>
            </div>

            {/* Target */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                🎯 ĐỐI TƯỢNG TARGET
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {angle.targetAudience}
              </p>
            </div>
          </div>

          {/* Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ScoreBar value={angle.viralScore} label="🚀 Viral" color="var(--orange)" />
            <ScoreBar value={angle.easyScore} label="📱 Dễ quay" color="var(--blue)" />
            <ScoreBar value={angle.conversionScore} label="💰 Chuyển đổi" color="var(--green)" />
          </div>

          {/* Action */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <a
              href={`/dashboard/content?productName=${encodeURIComponent(angle.title)}`}
              className="btn btn-sm btn-primary"
            >
              🤖 Tạo caption ngay
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategyStudio() {
  const searchParams = useSearchParams();
  const [selectedProductId, setSelectedProductId] = useState(searchParams.get('productId') || '');

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [rating, setRating] = useState('');
  const [soldCount, setSoldCount] = useState('');

  // State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentStrategyResult | null>(null);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const { products: dbProducts } = useDbProducts();

  function selectProduct(id: string) {
    setSelectedProductId(id);
    const p = dbProducts.find(p => p.shopeeItemId === id);
    if (!p) return;
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setPrice(p.originalPrice.toString());
    setDiscountedPrice(p.discountedPrice.toString());
    setCommissionRate(p.commissionRate.toString());
    setRating(p.rating.toString());
    setSoldCount(p.soldCount.toString());
  }

  useEffect(() => {
    const id = searchParams.get('productId');
    if (id && dbProducts.length > 0) selectProduct(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbProducts]);

  async function handleGenerate() {
    if (!name.trim()) return setError('Vui lòng nhập tên sản phẩm');
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/content/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          price: parseFloat(price) || 0,
          discountedPrice: parseFloat(discountedPrice) || parseFloat(price) || 0,
          commissionRate: parseFloat(commissionRate) || 0,
          rating: parseFloat(rating) || undefined,
          soldCount: parseInt(soldCount) || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
      else setError(json.error || 'Lỗi khi tạo chiến lược');
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  }

  const filteredAngles = result?.angles.filter(a =>
    filterType === 'all' ? true : a.type === filterType
  ) ?? [];

  const typeCounts = result ? {
    shock: result.angles.filter(a => a.type === 'shock').length,
    curiosity: result.angles.filter(a => a.type === 'curiosity').length,
    problem_solution: result.angles.filter(a => a.type === 'problem_solution').length,
    review: result.angles.filter(a => a.type === 'review').length,
  } : null;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎬 Content Strategy</h1>
          <p className="page-subtitle">Gemini AI tạo 10 content angle — Shock, Curiosity, Problem-Solution, Review</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ─── LEFT: Product Input ─── */}
        <div className="card">
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>📦 Sản phẩm</h2>

          <div className="form-group">
            <label className="label">Chọn nhanh</label>
            <select
              className="input select"
              value={selectedProductId}
              onChange={e => selectProduct(e.target.value)}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {dbProducts.map(p => (
                <option key={p.id} value={p.shopeeItemId}>{p.name.slice(0, 40)}... ({p.commissionRate}%)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Tên sản phẩm *</label>
            <input className="input" value={name} placeholder="Kem chống nắng..." onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Mô tả</label>
            <textarea className="input" rows={2} value={description} placeholder="Mô tả sản phẩm..." onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="label">Giá gốc (đ)</label>
              <input type="number" className="input" value={price} placeholder="520000" onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Giá sale (đ)</label>
              <input type="number" className="input" value={discountedPrice} placeholder="380000" onChange={e => setDiscountedPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Hoa hồng (%)</label>
              <input type="number" className="input" value={commissionRate} placeholder="15" onChange={e => setCommissionRate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Danh mục</label>
              <input className="input" value={category} placeholder="Chăm Sóc Da" onChange={e => setCategory(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Rating</label>
              <input type="number" className="input" value={rating} placeholder="4.9" step="0.1" onChange={e => setRating(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Đã bán</label>
              <input type="number" className="input" value={soldCount} placeholder="45000" onChange={e => setSoldCount(e.target.value)} />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              color: '#f87171', fontSize: '13px', marginBottom: '12px'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '🤖 Đang tạo 10 angles...' : '🎬 Tạo Content Strategy'}
          </button>

          {/* Legend */}
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              4 DẠNG CONTENT
            </div>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px' }}>
                <span>{cfg.emoji}</span>
                <span style={{ color: cfg.color, fontWeight: '600' }}>{cfg.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>—</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                  {key === 'shock' && 'Gây sốc, dừng scroll'}
                  {key === 'curiosity' && 'Tò mò, FOMO'}
                  {key === 'problem_solution' && 'Đưa ra giải pháp'}
                  {key === 'review' && 'Đánh giá thực tế'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Results ─── */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '70px 20px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
              <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
                Gemini AI đang brainstorm...
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                Đang tạo 10 content angle độc đáo<br />
                Shock • Curiosity • Problem-Solution • Review
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state" style={{ padding: '80px 20px' }}>
              <div className="empty-state-icon">🎬</div>
              <div className="empty-state-title">Sẵn sàng tạo chiến lược</div>
              <div className="empty-state-text">Chọn sản phẩm và nhấn "Tạo Content Strategy"</div>
            </div>
          )}

          {result && (
            <>
              {/* Summary banner */}
              <div style={{
                padding: '14px 18px', marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(124,58,237,0.08))',
                border: '1px solid rgba(255,107,53,0.2)', borderRadius: '14px',
                display: 'flex', gap: '12px', alignItems: 'center'
              }}>
                <span style={{ fontSize: '24px' }}>🎯</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    PRODUCT INSIGHT
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    {result.productSummary}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterType('all')}
                  className={`badge ${filterType === 'all' ? 'badge-orange' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', fontSize: '12px', padding: '5px 12px' }}
                >
                  Tất cả ({result.angles.length})
                </button>
                {typeCounts && Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '12px', padding: '5px 12px', borderRadius: '6px',
                      background: filterType === key ? cfg.bg : 'var(--bg-secondary)',
                      border: `1px solid ${filterType === key ? cfg.border : 'var(--border)'}`,
                      color: filterType === key ? cfg.color : 'var(--text-secondary)',
                      fontWeight: filterType === key ? '700' : '500',
                    }}
                  >
                    {cfg.emoji} {cfg.label} ({typeCounts[key as keyof typeof typeCounts]})
                  </button>
                ))}
              </div>

              {/* Angle Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredAngles.map((angle, idx) => (
                  <AngleCard
                    key={angle.id}
                    angle={angle}
                    isTopPick={result.topPicks.includes(angle.id)}
                    index={idx}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function StrategyPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" />}>
      <StrategyStudio />
    </Suspense>
  );
}
