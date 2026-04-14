'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDbProducts } from '@/hooks/useProducts';

interface TikTokHook { id: number; hook: string; style: string; emotionTrigger: string }
interface TikTokScript {
  id: number; hookLine: string; cta: string; music: string; videoGuide: string;
  scenes: { second: string; action: string; text: string; voice: string }[];
}
interface HookScriptResult { hooks: TikTokHook[]; scripts: TikTokScript[] }

const STYLE_CONFIG: Record<string, { icon: string; color: string }> = {
  question:  { icon: '❓', color: 'var(--blue)' },
  statement: { icon: '💥', color: 'var(--red)' },
  challenge: { icon: '⚡', color: 'var(--orange)' },
  reveal:    { icon: '🎯', color: 'var(--purple)' },
  number:    { icon: '🔢', color: 'var(--green)' },
};

function HookCard({ hook, rank }: { hook: TikTokHook; rank: number }) {
  const [copied, setCopied] = useState(false);
  const cfg = STYLE_CONFIG[hook.style] || { icon: '💬', color: 'var(--orange)' };

  return (
    <div style={{
      padding: '14px 16px', borderRadius: '12px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      display: 'flex', gap: '12px', alignItems: 'flex-start',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        background: cfg.color + '20', border: `1px solid ${cfg.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: '800', color: cfg.color
      }}>{rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.4', marginBottom: '6px' }}>
          "{hook.hook}"
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            background: cfg.color + '15', color: cfg.color, fontWeight: '600'
          }}>{cfg.icon} {hook.style}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🎭 {hook.emotionTrigger}</span>
        </div>
      </div>
      <button
        className="btn btn-sm btn-secondary"
        onClick={() => { navigator.clipboard.writeText(hook.hook); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      >
        {copied ? '✅' : '📋'}
      </button>
    </div>
  );
}

function ScriptCard({ script, idx }: { script: TikTokScript; idx: number }) {
  const [expanded, setExpanded] = useState(idx === 0);
  const [copiedFull, setCopiedFull] = useState(false);

  const fullScript = `🎣 HOOK: "${script.hookLine}"\n\n` +
    script.scenes.map(s => `[${s.second}]\n📷 ${s.action}\n📝 ${s.text}\n🎙️ ${s.voice}`).join('\n\n') +
    `\n\n👉 CTA: ${script.cta}\n🎵 Nhạc: ${script.music}\n💡 Tips: ${script.videoGuide}`;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
      <div
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '800', color: 'white'
        }}>#{idx + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
            Script {idx + 1}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '8px' }}>
              🎵 {script.music}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--orange)', fontStyle: 'italic' }}>
            "{script.hookLine}"
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(fullScript); setCopiedFull(true); setTimeout(() => setCopiedFull(false), 2000); }}
          >
            {copiedFull ? '✅ Copied' : '📋 Copy all'}
          </button>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {script.scenes.map((scene, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr', gap: '10px',
                padding: '10px 14px', background: 'var(--bg-secondary)',
                borderRadius: '10px', border: '1px solid var(--border)'
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: '800', color: 'var(--orange)',
                  background: 'rgba(255,107,53,0.1)', padding: '4px 8px',
                  borderRadius: '6px', textAlign: 'center', alignSelf: 'start'
                }}>{scene.second}</div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: '700' }}>📷 CẢNH QUAY</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{scene.action}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: '700' }}>📝 TEXT OVERLAY</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.5' }}>{scene.text}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: '700' }}>🎙️ VOICE</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>"{scene.voice}"</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(255,107,53,0.08)', borderRadius: '10px', border: '1px solid rgba(255,107,53,0.2)' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--orange)', marginBottom: '4px' }}>👉 CTA</div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{script.cta}</div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--purple)', marginBottom: '4px' }}>💡 VIDEO TIPS</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{script.videoGuide}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptStudio() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'hooks' | 'scripts'>('hooks');
  const [selectedId, setSelectedId] = useState(searchParams.get('productId') || '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HookScriptResult | null>(null);
  const [error, setError] = useState('');

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
      const res = await fetch('/api/content/hooks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, price: parseFloat(price) || 0, discountedPrice: parseFloat(discountedPrice) || 0, commissionRate: parseFloat(commissionRate) || 0, category }),
      });
      const json = await res.json();
      if (json.success) { setResult(json.data); setTab('hooks'); }
      else setError(json.error || 'Lỗi tạo script');
    } catch { setError('Không thể kết nối server'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎣 Hook & Script</h1>
          <p className="page-subtitle">STEP 3 — 5 hooks viral + 5 TikTok script 30s với hướng dẫn quay chi tiết</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>📦 Sản phẩm</h2>
          <div className="form-group">
            <label className="label">Chọn nhanh</label>
            <select className="input select" value={selectedId} onChange={e => selectProduct(e.target.value)}>
              <option value="">-- Chọn sản phẩm --</option>
              {dbProducts.map(p => <option key={p.id} value={p.shopeeItemId}>{p.name.slice(0, 40)}... ({p.commissionRate}%)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Tên sản phẩm *</label>
            <input className="input" value={name} placeholder="Kem chống nắng..." onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="label">Giá gốc (đ)</label>
              <input type="number" className="input" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Giá sale (đ)</label>
              <input type="number" className="input" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Hoa hồng (%)</label>
              <input type="number" className="input" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Danh mục</label>
              <input className="input" value={category} onChange={e => setCategory(e.target.value)} />
            </div>
          </div>
          {error && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>❌ {error}</div>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} onClick={handleGenerate} disabled={loading}>
            {loading ? '🤖 Đang tạo...' : '🎣 Tạo 5 Hooks + 5 Scripts'}
          </button>

          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: '700', marginBottom: '6px' }}>Output:</div>
            <div>✓ 5 hooks ≤10 từ (câu mở đầu viral)</div>
            <div>✓ 5 script 30s chia từng cảnh</div>
            <div>✓ Text overlay, voice-over, nhạc</div>
            <div>✓ Hướng dẫn quay thực tế</div>
          </div>
        </div>

        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '70px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Đang tạo hooks & scripts...</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>5 hooks viral + 5 TikTok scripts 30 giây</div>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state" style={{ padding: '80px' }}>
              <div className="empty-state-icon">🎣</div>
              <div className="empty-state-title">Sẵn sàng tạo Hook & Script</div>
              <div className="empty-state-text">Chọn sản phẩm và nhấn tạo</div>
            </div>
          )}

          {result && (
            <>
              <div className="tabs" style={{ marginBottom: '16px' }}>
                <button className={`tab ${tab === 'hooks' ? 'active' : ''}`} onClick={() => setTab('hooks')}>
                  🎣 5 Hooks ({result.hooks.length})
                </button>
                <button className={`tab ${tab === 'scripts' ? 'active' : ''}`} onClick={() => setTab('scripts')}>
                  🎬 5 Scripts ({result.scripts.length})
                </button>
              </div>

              {tab === 'hooks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.hooks.map((h, i) => <HookCard key={h.id} hook={h} rank={i + 1} />)}
                </div>
              )}
              {tab === 'scripts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.scripts.map((s, i) => <ScriptCard key={s.id} script={s} idx={i} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ScriptPage() {
  return <Suspense fallback={<div className="loading-spinner" />}><ScriptStudio /></Suspense>;
}
