'use client';

import { useDbProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface AnalysisResult {
  summary: string;
  targetAudience: string;
  painPoints: string[];
  usp: string[];
  scores: {
    marketDemand: number;
    viralPotential: number;
    competition: number;
    conversionRate: number;
    overall: number;
  };
  conclusion: {
    shouldAffiliate: boolean;
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SKIP';
    reasons: string[];
  };
}

const RECOMMENDATION_CONFIG = {
  STRONG_BUY: { label: '🔥 Nên làm ngay!', badge: 'badge-green', color: 'var(--green)' },
  BUY: { label: '✅ Nên làm', badge: 'badge-blue', color: 'var(--blue)' },
  HOLD: { label: '⚠️ Cân nhắc', badge: 'badge-yellow', color: 'var(--yellow)' },
  SKIP: { label: '❌ Bỏ qua', badge: 'badge-red', color: 'var(--red)' },
};

// Radial score meter
function ScoreMeter({
  value,
  label,
  note,
  invert = false,
}: {
  value: number;
  label: string;
  note?: string;
  invert?: boolean;
}) {
  // inverted = higher score = worse (competition)
  const displayColor = invert
    ? value < 40
      ? 'var(--green)'
      : value < 70
        ? 'var(--yellow)'
        : 'var(--red)'
    : value >= 70
      ? 'var(--green)'
      : value >= 40
        ? 'var(--yellow)'
        : 'var(--red)';

  const pct = value / 100;
  const circumference = 2 * Math.PI * 28;
  const dash = pct * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 8px' }}>
        <svg width='72' height='72' style={{ transform: 'rotate(-90deg)' }}>
          <circle cx='36' cy='36' r='28' fill='none' stroke='var(--border)' strokeWidth='6' />
          <circle
            cx='36'
            cy='36'
            r='28'
            fill='none'
            stroke={displayColor}
            strokeWidth='6'
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap='round'
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '800',
            color: displayColor,
          }}
        >
          {value}
        </div>
      </div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
        {label}
      </div>
      {note && (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{note}</div>
      )}
    </div>
  );
}

function ProgressBar({
  value,
  label,
  invert = false,
}: {
  value: number;
  label: string;
  invert?: boolean;
}) {
  const color = invert
    ? value < 40
      ? 'var(--green)'
      : value < 70
        ? 'var(--yellow)'
        : 'var(--red)'
    : value >= 70
      ? 'var(--green)'
      : value >= 40
        ? 'var(--yellow)'
        : 'var(--red)';

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color }}>{value}/100</span>
      </div>
      <div
        style={{
          height: '6px',
          background: 'var(--border)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: '3px',
            transition: 'width 1s ease',
          }}
        />
      </div>
    </div>
  );
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function AnalyzeStudio() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'manual' | 'pick'>('pick');
  const [selectedProductId, setSelectedProductId] = useState(searchParams.get('productId') || '');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [rating, setRating] = useState('');
  const [soldCount, setSoldCount] = useState('');
  const [shopName, setShopName] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  // Prefill from mock product
  const { products: dbProducts } = useDbProducts();

  function selectProduct(id: string) {
    setSelectedProductId(id);
    const p = dbProducts.find((p) => p.shopeeItemId === id);
    if (!p) return;
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setPrice(p.originalPrice.toString());
    setDiscountedPrice(p.discountedPrice.toString());
    setCommissionRate(p.commissionRate.toString());
    setRating(p.rating.toString());
    setSoldCount(p.soldCount.toString());
    setShopName(p.shopName);
  }

  // Auto-select nếu có productId trong URL
  useEffect(() => {
    const id = searchParams.get('productId');
    if (id && dbProducts.length > 0) selectProduct(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbProducts]);

  async function handleAnalyze() {
    if (!name.trim()) return setError('Vui lòng nhập tên sản phẩm');
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/products/analyze', {
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
          shopName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || 'Lỗi phân tích');
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  }

  const recConfig = result ? RECOMMENDATION_CONFIG[result.conclusion.recommendation] : null;

  return (
    <>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>🔬 Phân tích sản phẩm AI</h1>
          <p className='page-subtitle'>
            Gemini AI chấm điểm tiềm năng affiliate — nên hay không nên làm?
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* ─── LEFT: Input Form ─── */}
        <div className='card'>
          {/* Mode Toggle */}
          <div className='tabs' style={{ marginBottom: '16px' }}>
            <button
              className={`tab ${mode === 'pick' ? 'active' : ''}`}
              onClick={() => setMode('pick')}
            >
              📦 Chọn từ danh sách
            </button>
            <button
              className={`tab ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
            >
              ✏️ Nhập thủ công
            </button>
          </div>

          {/* Pick from mock */}
          {mode === 'pick' && (
            <div className='form-group'>
              <label className='label'>Chọn sản phẩm</label>
              <select
                className='input select'
                value={selectedProductId}
                onChange={(e) => selectProduct(e.target.value)}
              >
                <option value=''>-- Chọn sản phẩm --</option>
                {dbProducts.map((p) => (
                  <option key={p.id} value={p.shopeeItemId}>
                    {p.name.slice(0, 40)}... ({p.commissionRate}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form fields */}
          <div className='form-group'>
            <label className='label'>Tên sản phẩm *</label>
            <input
              className='input'
              placeholder='Kem chống nắng Anessa...'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className='form-group'>
            <label className='label'>Mô tả</label>
            <textarea
              className='input'
              rows={2}
              placeholder='Mô tả ngắn...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className='form-group'>
              <label className='label'>Giá gốc (đ)</label>
              <input
                type='number'
                className='input'
                placeholder='520000'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label className='label'>Giá sale (đ)</label>
              <input
                type='number'
                className='input'
                placeholder='380000'
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label className='label'>Hoa hồng (%)</label>
              <input
                type='number'
                className='input'
                placeholder='15'
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label className='label'>Danh mục</label>
              <input
                className='input'
                placeholder='Chăm Sóc Da'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label className='label'>Rating</label>
              <input
                type='number'
                className='input'
                placeholder='4.9'
                step='0.1'
                max='5'
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label className='label'>Đã bán</label>
              <input
                type='number'
                className='input'
                placeholder='45000'
                value={soldCount}
                onChange={(e) => setSoldCount(e.target.value)}
              />
            </div>
          </div>

          <div className='form-group'>
            <label className='label'>Tên Shop</label>
            <input
              className='input'
              placeholder='Anessa Vietnam Official'
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                color: '#f87171',
                fontSize: '13px',
                marginBottom: '12px',
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            className='btn btn-primary'
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? '🤖 Gemini đang phân tích...' : '🔬 Phân tích với AI'}
          </button>
        </div>

        {/* ─── RIGHT: Result ─── */}
        <div>
          {loading && (
            <div className='card' style={{ textAlign: 'center', padding: '60px' }}>
              <div className='loading-spinner' style={{ margin: '0 auto 20px' }} />
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Gemini AI đang phân tích...
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Đang đánh giá thị trường, đối thủ cạnh tranh và tiềm năng viral
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className='empty-state' style={{ padding: '80px 20px' }}>
              <div className='empty-state-icon'>🔬</div>
              <div className='empty-state-title'>Sẵn sàng phân tích</div>
              <div className='empty-state-text'>Chọn sản phẩm và nhấn "Phân tích với AI"</div>
            </div>
          )}

          {result && recConfig && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Verdict Banner */}
              <div
                style={{
                  padding: '20px 24px',
                  background: result.conclusion.shouldAffiliate
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(255,107,53,0.08))'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(107,114,128,0.05))',
                  border: `1px solid ${result.conclusion.shouldAffiliate ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <div style={{ fontSize: '48px' }}>
                  {result.conclusion.shouldAffiliate ? '✅' : '❌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
                    {result.conclusion.shouldAffiliate ? 'NÊN LÀM AFFILIATE' : 'KHÔNG NÊN LÀM'}
                  </div>
                  <span
                    className={`badge ${recConfig.badge}`}
                    style={{ fontSize: '13px', padding: '4px 12px' }}
                  >
                    {recConfig.label}
                  </span>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '36px', fontWeight: '900', color: recConfig.color }}>
                    {result.scores.overall}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Điểm tổng</div>
                </div>
              </div>

              {/* Scores */}
              <div className='card'>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>
                  📊 Bảng chấm điểm
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <ScoreMeter
                    value={result.scores.marketDemand}
                    label='Nhu cầu thị trường'
                    note='Cao hơn = tốt hơn'
                  />
                  <ScoreMeter
                    value={result.scores.viralPotential}
                    label='Khả năng viral'
                    note='Cao hơn = tốt hơn'
                  />
                  <ScoreMeter
                    value={result.scores.competition}
                    label='Mức cạnh tranh'
                    note='Thấp hơn = dễ hơn'
                    invert
                  />
                  <ScoreMeter
                    value={result.scores.conversionRate}
                    label='Khả năng chuyển đổi'
                    note='Cao hơn = tốt hơn'
                  />
                </div>
                <div>
                  <ProgressBar value={result.scores.marketDemand} label='🛒 Nhu cầu thị trường' />
                  <ProgressBar value={result.scores.viralPotential} label='🚀 Khả năng viral' />
                  <ProgressBar value={result.scores.competition} label='⚔️ Mức cạnh tranh' invert />
                  <ProgressBar value={result.scores.conversionRate} label='💰 Tỷ lệ chuyển đổi' />
                </div>
              </div>

              {/* 2-col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Summary + Target */}
                <div className='card'>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                    📋 Tóm tắt
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      marginBottom: '14px',
                    }}
                  >
                    {result.summary}
                  </p>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    🎯 KHÁCH HÀNG MỤC TIÊU
                  </h4>
                  <p
                    style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}
                  >
                    {result.targetAudience}
                  </p>
                </div>

                {/* Pain Points + USP */}
                <div className='card'>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                    😤 Pain Points
                  </h3>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginBottom: '14px',
                    }}
                  >
                    {result.painPoints.map((p, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ color: 'var(--red)', flexShrink: 0 }}>•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    ⭐ USP (Điểm bán hàng)
                  </h4>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {result.usp.map((u, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conclusion Reasons */}
              <div
                className='card'
                style={{
                  background: result.conclusion.shouldAffiliate
                    ? 'rgba(16,185,129,0.05)'
                    : 'rgba(239,68,68,0.05)',
                  border: `1px solid ${result.conclusion.shouldAffiliate ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
                  🎯 Kết luận — Tại sao {result.conclusion.shouldAffiliate ? 'NÊN' : 'KHÔNG NÊN'}{' '}
                  làm?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.conclusion.reasons.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '10px 14px',
                        background: 'var(--bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span
                        style={{
                          color: result.conclusion.shouldAffiliate ? 'var(--green)' : 'var(--red)',
                          flexShrink: 0,
                          fontWeight: '700',
                        }}
                      >
                        {i + 1}.
                      </span>
                      {r}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  {result.conclusion.shouldAffiliate && (
                    <a href='/dashboard/content' className='btn btn-primary'>
                      🤖 Tạo AI Content ngay
                    </a>
                  )}
                  <a href='/dashboard/products' className='btn btn-secondary'>
                    🛍️ Xem sản phẩm khác
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className='loading-spinner' />}>
      <AnalyzeStudio />
    </Suspense>
  );
}
