'use client';

import { useState } from 'react';

interface BulkProduct { productName: string; affiliateLink: string; additionalInfo?: string; }

export default function BulkGeneratePage() {
  const [products, setProducts] = useState<BulkProduct[]>([{ productName: '', affiliateLink: '' }]);
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const addProduct = () => setProducts([...products, { productName: '', affiliateLink: '' }]);
  const removeProduct = (i: number) => setProducts(products.filter((_, idx) => idx !== i));
  const updateProduct = (i: number, field: string, value: string) => {
    const updated = [...products];
    (updated[i] as any)[field] = value;
    setProducts(updated);
  };

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleGenerate = async () => {
    const valid = products.filter(p => p.productName && p.affiliateLink);
    if (valid.length === 0 || platforms.length === 0) return;
    setLoading(true); setResults(null);
    setProgress(`Đang tạo nội dung cho ${valid.length} sản phẩm × ${platforms.length} platforms...`);
    try {
      const res = await fetch('/api/content/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: valid, platforms }),
      });
      const data = await res.json();
      if (data.success) setResults(data.data.results);
      setProgress('');
    } catch { setProgress('❌ Lỗi!'); }
    finally { setLoading(false); }
  };

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const iStyle: React.CSSProperties = { width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' };
  const pColors: Record<string, string> = { facebook: '#1877F2', tiktok: '#ff0050', youtube: '#FF0000' };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#f59e0b', letterSpacing: '0.1em' }}>BULK GENERATOR</span>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>Bulk <span style={{ color: '#f59e0b' }}>Generate.</span></h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Tạo content hàng loạt cho nhiều sản phẩm trên đa nền tảng (tối đa 10/batch).</p>
      </header>

      {/* Products Input */}
      <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>📦 DANH SÁCH SẢN PHẨM ({products.length}/10)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {products.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#475569', fontSize: '13px', fontWeight: '800', width: '24px' }}>{i + 1}.</span>
              <input type="text" placeholder="Tên sản phẩm" value={p.productName} onChange={e => updateProduct(i, 'productName', e.target.value)} style={{ ...iStyle, flex: 1 }} />
              <input type="text" placeholder="Affiliate link" value={p.affiliateLink} onChange={e => updateProduct(i, 'affiliateLink', e.target.value)} style={{ ...iStyle, flex: 1 }} />
              {products.length > 1 && <button onClick={() => removeProduct(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', padding: '8px' }}>✕</button>}
            </div>
          ))}
        </div>
        {products.length < 10 && (
          <button onClick={addProduct} style={{ marginTop: '16px', padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '700', width: '100%' }}>+ Thêm sản phẩm</button>
        )}
      </section>

      {/* Platforms */}
      <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>🌐 CHỌN NỀN TẢNG</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[{ k: 'facebook', l: '📘 Facebook' }, { k: 'tiktok', l: '🎵 TikTok' }, { k: 'youtube', l: '🎬 YouTube' }].map(p => (
            <button key={p.k} onClick={() => togglePlatform(p.k)} style={{ padding: '14px 24px', borderRadius: '14px', background: platforms.includes(p.k) ? `${pColors[p.k]}15` : 'rgba(0,0,0,0.2)', border: `2px solid ${platforms.includes(p.k) ? pColors[p.k] + '50' : 'rgba(255,255,255,0.05)'}`, color: platforms.includes(p.k) ? pColors[p.k] : '#64748b', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>{p.l}</button>
          ))}
        </div>
      </section>

      {/* Generate */}
      <button className="btn-tech" onClick={handleGenerate} disabled={loading || products.every(p => !p.productName || !p.affiliateLink) || platforms.length === 0} style={{ width: '100%', padding: '20px', fontSize: '16px', marginBottom: '30px', background: loading ? '#475569' : 'linear-gradient(135deg,#f59e0b,#ef4444)', opacity: loading ? 0.5 : 1 }}>
        {loading ? '⏳ ĐANG TẠO...' : `🚀 GENERATE ${products.filter(p => p.productName && p.affiliateLink).length} SẢN PHẨM × ${platforms.length} PLATFORMS`}
      </button>

      {progress && <div style={{ textAlign: 'center', color: '#f59e0b', marginBottom: '20px', fontWeight: '600' }}>{progress}</div>}

      {/* Results */}
      {results && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>✅ KẾT QUẢ ({results.length} sản phẩm)</h3>
          {results.map((r, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>{r.productName}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(r.platforms).map(([platform, data]: [string, any]) => (
                  <div key={platform} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${(pColors[platform] || '#6366f1') + '20'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ color: pColors[platform], fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>{platform}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: data.success ? '#10b981' : '#ef4444' }}>{data.success ? '✅ OK' : '❌ Fail'}</span>
                    </div>
                    {data.success && (
                      <button onClick={() => copy(JSON.stringify(data.data, null, 2), `r-${i}-${platform}`)} style={{ padding: '8px 16px', borderRadius: '10px', background: copied === `r-${i}-${platform}` ? '#10b981' : 'rgba(255,255,255,0.05)', border: 'none', color: copied === `r-${i}-${platform}` ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                        {copied === `r-${i}-${platform}` ? '✅ Copied' : '📋 Copy Result'}
                      </button>
                    )}
                    {!data.success && <div style={{ color: '#ef4444', fontSize: '12px' }}>{data.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
